# Interactive Video Voting Application

A real-time interactive video experience where audiences vote to determine how the story unfolds.

## Architecture

This is a monorepo built with npm workspaces containing:

- **apps/client** - React + Vite frontend
- **apps/server** - Express + Socket.IO backend
- **packages/shared** - Shared TypeScript types

## Story Flow Visualization

The current story follows a **late-night decision-making** narrative with **2 possible endings**:

```
                    gaming.mp4
              "Late Night Gaming Session"
                        |
           ┌────────────┴────────────┐
           │                         │
    "Order some food"      "Keep gaming a bit"
           │                         │
           └────────────┬────────────┘
                        ▼
                    eat.mp4
                  "Food Break"
                        |
           ┌────────────┴────────────┐
           │                         │
    "Hit up the party"      "Chill at home"
           │                         │
           ▼                         ▼
       party.mp4                 wakeup.mp4
    "The Party is Wild"        "Fresh Morning" ⭐
           |
    ┌──────┴──────┐
    │             │
"Keep      "Head home and
partying!"  get some sleep"
    │             │
    ▼             ▼
zombies.mp4   wakeup.mp4
"Zombie Mode"  "Fresh Morning" ⭐
    ⭐
```

**Story Theme**: Decision-making and consequences in late-night social scenarios

**See [STORY_FLOW.md](./STORY_FLOW.md) for detailed story structure and planning guide.**

## Prerequisites

- Node.js 18+ and npm 8+
- FFmpeg (for video processing)
- 5 video files (gaming, eat, party, zombies, wakeup)
- Story configuration file (already configured)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will install dependencies for all workspaces.

### 2. Build Shared Types

```bash
npm run build:shared
```

### 3. Process Your Video Files

**Option A: Auto-convert videos to 720p landscape**
```bash
# 1. Place raw videos in uploads folder
cp your-videos/*.mp4 apps/server/videos/uploads/

# 2. Install FFmpeg (if not installed)
# macOS: brew install ffmpeg
# Ubuntu: sudo apt-get install ffmpeg

# 3. Process videos to 720p landscape
cd apps/server
npm run process-videos

# Videos will be automatically converted and placed in public/videos/
```

**Option B: Use pre-formatted videos**
```bash
# Place 720p landscape videos directly
cp your-videos/*.mp4 apps/server/public/videos/
```

**Required videos (5 total)**:
```
apps/server/public/videos/
  ├── gaming.mp4    # Gaming session intro
  ├── eat.mp4       # Food break scene
  ├── party.mp4     # Party scene
  ├── zombies.mp4   # Zombie ending
  └── wakeup.mp4    # Fresh morning ending
```

**See [VIDEO_PROCESSING.md](./VIDEO_PROCESSING.md) for complete video processing guide.**

### 4. Story Configuration (Already Done!)

The story configuration is already set up in `apps/server/story-config.json` with the gaming → eat → party → zombies/wakeup flow.

### 5. Configure Environment

The server already has a `.env` file with:
```
PORT=3000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 6. Start Development

```bash
npm run dev
```

This runs both client (port 5173) and server (port 3000) concurrently.

### 7. Access the Application

- **Home**: http://localhost:5173
- **Host Panel**: http://localhost:5173/host
- **Voter View**: Scan QR code or visit http://localhost:5173/session/{sessionId}

## Usage

### Host Flow
1. Navigate to `/host`
2. Share the QR code with your audience
3. Wait for users to join
4. Click "Start Voting" when ready
5. Watch as the story unfolds based on collective votes

### Voter Flow
1. Scan the QR code or visit the session URL
2. Wait for the host to start voting
3. Vote on what happens next
4. Watch the video play based on the winning vote

## Building for Production

```bash
npm run build
```

This builds all workspaces.

## Deployment

**The app is deployment-ready!** See these guides:
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete Railway deployment guide (recommended)
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Step-by-step checklist
- **[VIDEO_STORAGE_GUIDE.md](./VIDEO_STORAGE_GUIDE.md)** - Video storage solutions

Quick deploy: Push to GitHub → Deploy to Railway → Set environment variables → Done!

## Project Structure

```
project/
├── apps/
│   ├── client/              # React frontend
│   │   ├── src/
│   │   │   ├── components/  # Reusable components
│   │   │   ├── pages/       # Route pages
│   │   │   └── main.tsx     # Entry point
│   │   └── package.json
│   │
│   └── server/              # Express backend
│       ├── src/
│       │   ├── services/    # Business logic
│       │   ├── controllers/ # Socket.IO handlers
│       │   └── index.ts     # Server entry
│       ├── public/videos/   # Video files
│       └── story-config.json
│
├── packages/
│   └── shared/              # Shared TypeScript types
│       └── src/types/
│
└── docs/                    # Documentation
```

## Key Technologies

- **Frontend**: React 18, TypeScript, Vite, Video.js, Socket.IO Client
- **Backend**: Express, Socket.IO, TypeScript
- **Deployment**: Railway (WebSocket support)

## Monitoring

- **Health Check**: http://localhost:3000/health
- **Server Stats**: http://localhost:3000/api/stats

## Troubleshooting

### Videos not loading
- Ensure video files are in `apps/server/public/videos/`
- Check `story-config.json` matches actual filenames
- Verify file permissions

### Socket.IO connection fails
- Check that both client and server are running
- Verify CORS settings in `apps/server/src/index.ts`
- Check CLIENT_URL in `.env` matches frontend URL

### TypeScript errors
- Run `npm run build:shared` to rebuild shared types
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

## Documentation

### Core Documentation
- **[QUICKSTART.md](./QUICKSTART.md)** - 5-minute getting started guide
- **[STORY_FLOW.md](./STORY_FLOW.md)** - Visual story structure and planning
- **[VIDEO_PROCESSING.md](./VIDEO_PROCESSING.md)** - Video processing guide
- **[README.md](./README.md)** - This file

### Deployment Documentation
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Pre/post deployment steps
- **[VIDEO_STORAGE_GUIDE.md](./VIDEO_STORAGE_GUIDE.md)** - Video storage options
- **[DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md)** - Technical summary

### Development Documentation
- [Architecture Guide](../docs/architecture.md) - System architecture
- [Development Story](../docs/development-story.md) - Complete development history

## License

MIT
