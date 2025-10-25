export type SessionPhase = 'waiting' | 'voting' | 'playing' | 'complete';

export interface VotingSession {
  sessionId: string;
  createdAt: Date;
  connectedUsers: Set<string>;
  votes: Map<string, string>; // userId -> optionId
  currentPhase: SessionPhase;
  currentVideoNode: string;
  storyPath: string[]; // History of node IDs visited
}

export interface SessionStats {
  totalUsers: number;
  totalVotes: number;
  currentPhase: SessionPhase;
}
