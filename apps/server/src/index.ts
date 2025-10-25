import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { config } from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { ServerToClientEvents, ClientToServerEvents } from '@video-voting/shared';

// Services
import { SessionManager } from './services/SessionManager.js';
import { VotingController } from './services/VotingController.js';
import { StoryGraphManager } from './services/StoryGraphManager.js';
import { SocketController } from './controllers/SocketController.js';

// Load environment variables
config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO with CORS
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: CLIENT_URL,
  credentials: true
}));
app.use(express.json());

// Serve static video files
const publicPath = join(__dirname, '../public');
app.use('/videos', express.static(join(publicPath, 'videos')));

// Serve static client files in production
if (process.env.NODE_ENV === 'production') {
  const clientDistPath = join(__dirname, '../../client/dist');
  app.use(express.static(clientDistPath));

  // Handle client-side routing - serve index.html for all non-API routes
  app.get('*', (req, res, next) => {
    // Skip API routes and socket.io
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io') || req.path.startsWith('/videos')) {
      return next();
    }
    res.sendFile(join(clientDistPath, 'index.html'));
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Initialize services
let sessionManager: SessionManager;
let votingController: VotingController;
let storyGraphManager: StoryGraphManager;
let socketController: SocketController;

try {
  sessionManager = new SessionManager();
  votingController = new VotingController(sessionManager);
  storyGraphManager = new StoryGraphManager();
  socketController = new SocketController(io, sessionManager, votingController, storyGraphManager);

  console.log('[Server] All services initialized successfully');
} catch (error) {
  console.error('[Server] Failed to initialize services:', error);
  process.exit(1);
}

// Stats endpoint for monitoring
app.get('/api/stats', (req, res) => {
  try {
    const stats = socketController.getServerStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Server] Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║   Interactive Video Voting Server         ║
╚════════════════════════════════════════════╝

🚀 Server running on port ${PORT}
🌐 Client URL: ${CLIENT_URL}
📊 Stats: http://localhost:${PORT}/api/stats
💚 Health: http://localhost:${PORT}/health

Environment: ${process.env.NODE_ENV || 'development'}
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received, shutting down gracefully...');
  httpServer.close(() => {
    console.log('[Server] HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('[Server] SIGINT received, shutting down gracefully...');
  httpServer.close(() => {
    console.log('[Server] HTTP server closed');
    process.exit(0);
  });
});
