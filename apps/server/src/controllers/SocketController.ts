import type { Server, Socket } from 'socket.io';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  CreateSessionPayload,
  JoinSessionPayload,
  VotePayload
} from '@video-voting/shared';
import { SessionManager } from '../services/SessionManager.js';
import { VotingController } from '../services/VotingController.js';
import { StoryGraphManager } from '../services/StoryGraphManager.js';

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
type TypedServer = Server<ClientToServerEvents, ServerToClientEvents>;

export class SocketController {
  constructor(
    private io: TypedServer,
    private sessionManager: SessionManager,
    private votingController: VotingController,
    private storyGraphManager: StoryGraphManager
  ) {
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: TypedSocket) => {
      console.log(`[SocketController] Client connected: ${socket.id}`);

      // Create new session (host only)
      socket.on('createSession', async (data: CreateSessionPayload) => {
        try {
          const { sessionId, qrCodeDataUrl } = await this.sessionManager.createSession();

          // Join host to their own session room
          socket.join(sessionId);

          // Send session details back to host
          socket.emit('sessionCreated', { sessionId, qrCodeDataUrl });

          console.log(`[SocketController] Session created: ${sessionId} by ${socket.id}`);
        } catch (error) {
          console.error('[SocketController] Error creating session:', error);
          socket.emit('error', { message: 'Failed to create session' });
        }
      });

      // Join existing session (voters)
      socket.on('joinSession', (data: JoinSessionPayload) => {
        const { sessionId } = data;

        if (!this.sessionManager.sessionExists(sessionId)) {
          socket.emit('error', { message: 'Session not found' });
          return;
        }

        // Add user to session
        this.sessionManager.addUser(sessionId, socket.id);

        // Join socket to room
        socket.join(sessionId);

        // Get current session state
        const session = this.sessionManager.getSession(sessionId);
        if (!session) {
          socket.emit('error', { message: 'Session not found' });
          return;
        }

        // Send confirmation to voter
        socket.emit('sessionJoined', {
          sessionId,
          currentPhase: session.currentPhase,
          currentVideoNode: session.currentVideoNode
        });

        // Broadcast updated user count to everyone in room
        const userCount = this.sessionManager.getUserCount(sessionId);
        this.io.to(sessionId).emit('userCountUpdate', { count: userCount });

        console.log(`[SocketController] User ${socket.id} joined session ${sessionId} (${userCount} total)`);
      });

      // Start voting (host only)
      socket.on('startVoting', () => {
        // Find which session this host belongs to
        const sessionId = this.findSessionForSocket(socket);
        if (!sessionId) {
          socket.emit('error', { message: 'Not in a session' });
          return;
        }

        const session = this.sessionManager.getSession(sessionId);
        if (!session) {
          socket.emit('error', { message: 'Session not found' });
          return;
        }

        // Get current node options
        const options = this.storyGraphManager.getNodeOptions(session.currentVideoNode);

        if (options.length === 0) {
          // Current node is an ending - notify completion
          this.io.to(sessionId).emit('storyComplete', {
            endingNodeId: session.currentVideoNode,
            storyPath: session.storyPath
          });
          return;
        }

        // Update session to voting phase
        this.sessionManager.updatePhase(sessionId, 'voting');

        // Clear previous votes
        this.votingController.resetVotingForNextRound(sessionId);

        // Get node title if available
        const currentNode = this.storyGraphManager.getNode(session.currentVideoNode);

        // Broadcast voting start to all users in session
        this.io.to(sessionId).emit('votingStarted', {
          options,
          nodeTitle: currentNode?.title
        });

        console.log(`[SocketController] Voting started in session ${sessionId}`);
      });

      // Record vote (voters only)
      socket.on('vote', (data: VotePayload) => {
        const { sessionId, optionId } = data;

        const success = this.votingController.recordVote(sessionId, socket.id, optionId);

        if (!success) {
          socket.emit('error', { message: 'Failed to record vote' });
          return;
        }

        // Send confirmation to voter
        const voteCount = this.votingController.getVoteCount(sessionId);
        const totalUsers = this.sessionManager.getUserCount(sessionId);

        socket.emit('voteRecorded', { voteCount, totalUsers });

        // Check if all users have voted
        if (voteCount === totalUsers && totalUsers > 0) {
          this.processVotingResults(sessionId);
        }

        console.log(`[SocketController] Vote recorded in ${sessionId}: ${voteCount}/${totalUsers}`);
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        const sessionId = this.findSessionForSocket(socket);

        if (sessionId) {
          this.sessionManager.removeUser(sessionId, socket.id);

          const userCount = this.sessionManager.getUserCount(sessionId);
          this.io.to(sessionId).emit('userCountUpdate', { count: userCount });

          console.log(`[SocketController] User ${socket.id} disconnected from ${sessionId} (${userCount} remaining)`);
        } else {
          console.log(`[SocketController] Client disconnected: ${socket.id}`);
        }
      });
    });

    console.log('[SocketController] Event handlers initialized');
  }

  private async processVotingResults(sessionId: string): Promise<void> {
    const session = this.sessionManager.getSession(sessionId);
    if (!session) return;

    // Get current node options
    const options = this.storyGraphManager.getNodeOptions(session.currentVideoNode);

    // Tally votes and determine winner
    const result = this.votingController.tallyVotes(sessionId, options);
    if (!result) return;

    // Update phase to playing
    this.sessionManager.updatePhase(sessionId, 'playing');

    // Send voting results to all users
    this.io.to(sessionId).emit('votingResults', {
      winningOption: result.winningOption,
      voteBreakdown: result.voteBreakdown
    });

    console.log(`[SocketController] Voting results for ${sessionId}:`, result.voteBreakdown);

    // Wait 3 seconds before playing video
    await this.delay(3000);

    // Get next node based on winning option
    const nextNodeId = result.winningOption.nextNodeId;
    const nextNode = this.storyGraphManager.getNode(nextNodeId);

    if (!nextNode) {
      console.error(`[SocketController] Next node not found: ${nextNodeId}`);
      return;
    }

    // Update session's current node
    this.sessionManager.updateCurrentNode(sessionId, nextNodeId);

    // Get video URL
    const videoUrl = this.storyGraphManager.getVideoPath(nextNodeId);

    if (videoUrl) {
      // Broadcast video play command
      this.io.to(sessionId).emit('playVideo', {
        videoUrl,
        nodeId: nextNodeId
      });

      console.log(`[SocketController] Playing video for session ${sessionId}: ${videoUrl}`);
    }

    // After video plays (estimate 30 seconds), check if story is complete
    // In production, you'd wait for actual video duration
    await this.delay(30000);

    if (this.storyGraphManager.isEndingNode(nextNodeId)) {
      this.sessionManager.updatePhase(sessionId, 'complete');
      this.io.to(sessionId).emit('storyComplete', {
        endingNodeId: nextNodeId,
        storyPath: session.storyPath
      });
    } else {
      this.sessionManager.updatePhase(sessionId, 'waiting');
    }
  }

  private findSessionForSocket(socket: TypedSocket): string | null {
    const rooms = Array.from(socket.rooms);
    // Filter out the socket's own room (which is its socket.id)
    const sessionRooms = rooms.filter(room => room !== socket.id);
    return sessionRooms[0] || null;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public method to get server stats (for monitoring endpoint)
  public getServerStats() {
    return {
      activeSessions: this.sessionManager.getActiveSessions(),
      connectedClients: this.io.sockets.sockets.size,
      sessions: this.sessionManager.getAllSessionStats(),
      storyStats: this.storyGraphManager.getStoryStats()
    };
  }
}
