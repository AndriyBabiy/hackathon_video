import { SessionPhase } from './session.js';
import { VotingOption } from './story.js';

// Client -> Server Events
export interface CreateSessionPayload {}

export interface JoinSessionPayload {
  sessionId: string;
}

export interface VotePayload {
  sessionId: string;
  optionId: string;
}

// Server -> Client Events
export interface SessionCreatedPayload {
  sessionId: string;
  qrCodeDataUrl: string;
}

export interface SessionJoinedPayload {
  sessionId: string;
  currentPhase: SessionPhase;
  currentVideoNode: string;
}

export interface UserCountUpdatePayload {
  count: number;
}

export interface VotingStartedPayload {
  options: VotingOption[];
  nodeTitle?: string;
}

export interface VoteRecordedPayload {
  voteCount: number;
  totalUsers: number;
}

export interface VotingResultsPayload {
  winningOption: VotingOption;
  voteBreakdown: { optionId: string; votes: number }[];
}

export interface PlayVideoPayload {
  videoUrl: string;
  nodeId: string;
}

export interface StoryCompletePayload {
  endingNodeId: string;
  storyPath: string[];
}

export interface ErrorPayload {
  message: string;
}

// Socket.IO Event Map for type safety
export interface ServerToClientEvents {
  sessionCreated: (data: SessionCreatedPayload) => void;
  sessionJoined: (data: SessionJoinedPayload) => void;
  userCountUpdate: (data: UserCountUpdatePayload) => void;
  votingStarted: (data: VotingStartedPayload) => void;
  voteRecorded: (data: VoteRecordedPayload) => void;
  votingResults: (data: VotingResultsPayload) => void;
  playVideo: (data: PlayVideoPayload) => void;
  storyComplete: (data: StoryCompletePayload) => void;
  error: (data: ErrorPayload) => void;
}

export interface ClientToServerEvents {
  createSession: (data: CreateSessionPayload) => void;
  joinSession: (data: JoinSessionPayload) => void;
  vote: (data: VotePayload) => void;
  startVoting: () => void;
}
