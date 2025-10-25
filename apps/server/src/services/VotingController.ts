import type { VotingSession, VotingOption } from '@video-voting/shared';
import { SessionManager } from './SessionManager.js';

export interface VoteResult {
  winningOption: VotingOption;
  voteBreakdown: Array<{ optionId: string; votes: number }>;
  totalVotes: number;
}

export class VotingController {
  constructor(private sessionManager: SessionManager) {}

  recordVote(sessionId: string, userId: string, optionId: string): boolean {
    const session = this.sessionManager.getSession(sessionId);
    if (!session) return false;

    // Only allow voting during voting phase
    if (session.currentPhase !== 'voting') {
      console.warn(`[VotingController] Vote rejected - session not in voting phase: ${sessionId}`);
      return false;
    }

    // Record the vote (overwrites if user already voted)
    session.votes.set(userId, optionId);

    console.log(`[VotingController] Vote recorded: ${userId} -> ${optionId} in session ${sessionId}`);
    return true;
  }

  getVoteCount(sessionId: string): number {
    const session = this.sessionManager.getSession(sessionId);
    return session ? session.votes.size : 0;
  }

  hasUserVoted(sessionId: string, userId: string): boolean {
    const session = this.sessionManager.getSession(sessionId);
    return session ? session.votes.has(userId) : false;
  }

  tallyVotes(sessionId: string, options: VotingOption[]): VoteResult | null {
    const session = this.sessionManager.getSession(sessionId);
    if (!session) return null;

    // Count votes for each option
    const voteCounts = new Map<string, number>();
    options.forEach(opt => voteCounts.set(opt.id, 0));

    for (const optionId of session.votes.values()) {
      const currentCount = voteCounts.get(optionId) || 0;
      voteCounts.set(optionId, currentCount + 1);
    }

    // Find winning option
    let winningOption = options[0];
    let maxVotes = 0;

    for (const option of options) {
      const votes = voteCounts.get(option.id) || 0;
      if (votes > maxVotes) {
        maxVotes = votes;
        winningOption = option;
      }
    }

    // In case of tie, use random selection
    const tiedOptions = options.filter(opt =>
      voteCounts.get(opt.id) === maxVotes
    );

    if (tiedOptions.length > 1) {
      const randomIndex = Math.floor(Math.random() * tiedOptions.length);
      winningOption = tiedOptions[randomIndex];
      console.log(`[VotingController] Tie detected in session ${sessionId}, randomly selected: ${winningOption.id}`);
    }

    const voteBreakdown = options.map(opt => ({
      optionId: opt.id,
      votes: voteCounts.get(opt.id) || 0
    }));

    return {
      winningOption,
      voteBreakdown,
      totalVotes: session.votes.size
    };
  }

  resetVotingForNextRound(sessionId: string): void {
    this.sessionManager.clearVotes(sessionId);
    console.log(`[VotingController] Votes cleared for session ${sessionId}`);
  }

  getVotingStats(sessionId: string): {
    totalUsers: number;
    totalVotes: number;
    participationRate: number;
  } {
    const session = this.sessionManager.getSession(sessionId);
    if (!session) {
      return { totalUsers: 0, totalVotes: 0, participationRate: 0 };
    }

    const totalUsers = session.connectedUsers.size;
    const totalVotes = session.votes.size;
    const participationRate = totalUsers > 0 ? (totalVotes / totalUsers) * 100 : 0;

    return {
      totalUsers,
      totalVotes,
      participationRate
    };
  }
}
