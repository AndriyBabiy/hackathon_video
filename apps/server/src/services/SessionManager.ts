import { nanoid } from 'nanoid';
import QRCode from 'qrcode';
import type { VotingSession } from '@video-voting/shared';

export class SessionManager {
  private sessions: Map<string, VotingSession> = new Map();
  private readonly TTL = 2 * 60 * 60 * 1000; // 2 hours

  constructor() {
    // Start cleanup interval every 10 minutes
    setInterval(() => this.cleanupExpiredSessions(), 10 * 60 * 1000);
  }

  async createSession(): Promise<{ sessionId: string; qrCodeDataUrl: string }> {
    const sessionId = nanoid(8);
    const joinUrl = `${process.env.CLIENT_URL}/session/${sessionId}`;

    const session: VotingSession = {
      sessionId,
      createdAt: new Date(),
      connectedUsers: new Set(),
      votes: new Map(),
      currentPhase: 'waiting',
      currentVideoNode: 'intro',
      storyPath: []
    };

    this.sessions.set(sessionId, session);

    const qrCodeDataUrl = await QRCode.toDataURL(joinUrl, {
      errorCorrectionLevel: 'M',
      width: 300,
      margin: 2
    });

    return { sessionId, qrCodeDataUrl };
  }

  getSession(sessionId: string): VotingSession | undefined {
    return this.sessions.get(sessionId);
  }

  sessionExists(sessionId: string): boolean {
    return this.sessions.has(sessionId);
  }

  addUser(sessionId: string, userId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.connectedUsers.add(userId);
    return true;
  }

  removeUser(sessionId: string, userId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.connectedUsers.delete(userId);
    session.votes.delete(userId);
  }

  updatePhase(sessionId: string, phase: VotingSession['currentPhase']): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.currentPhase = phase;
    return true;
  }

  updateCurrentNode(sessionId: string, nodeId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.currentVideoNode = nodeId;
    session.storyPath.push(nodeId);
    return true;
  }

  clearVotes(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.votes.clear();
  }

  getUserCount(sessionId: string): number {
    const session = this.sessions.get(sessionId);
    return session ? session.connectedUsers.size : 0;
  }

  private cleanupExpiredSessions(): void {
    const now = Date.now();
    const expiredSessions: string[] = [];

    for (const [sessionId, session] of this.sessions.entries()) {
      const age = now - session.createdAt.getTime();
      if (age > this.TTL) {
        expiredSessions.push(sessionId);
      }
    }

    expiredSessions.forEach(sessionId => {
      this.sessions.delete(sessionId);
      console.log(`[SessionManager] Cleaned up expired session: ${sessionId}`);
    });
  }

  // Debug/monitoring helpers
  getActiveSessions(): number {
    return this.sessions.size;
  }

  getAllSessionStats(): Array<{ sessionId: string; users: number; phase: string }> {
    return Array.from(this.sessions.values()).map(session => ({
      sessionId: session.sessionId,
      users: session.connectedUsers.size,
      phase: session.currentPhase
    }));
  }
}
