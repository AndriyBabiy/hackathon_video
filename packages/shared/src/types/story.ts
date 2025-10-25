export interface VotingOption {
  id: string;
  text: string;
  nextNodeId: string;
}

export interface StoryNode {
  id: string;
  videoFile: string;
  type: 'decision' | 'ending';
  options?: VotingOption[];
  title?: string;
}

export interface StoryConfig {
  nodes: StoryNode[];
  startNodeId: string;
}
