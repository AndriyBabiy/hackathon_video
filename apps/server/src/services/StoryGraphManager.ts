import type { StoryConfig, StoryNode, VotingOption } from '@video-voting/shared';
import { readFileSync } from 'fs';
import { join } from 'path';

export class StoryGraphManager {
  private storyConfig: StoryConfig;
  private nodeMap: Map<string, StoryNode>;

  constructor(configPath?: string) {
    // Load story configuration
    const defaultPath = join(process.cwd(), 'story-config.json');
    const path = configPath || defaultPath;

    try {
      const configData = readFileSync(path, 'utf-8');
      this.storyConfig = JSON.parse(configData);

      // Build index for fast lookups
      this.nodeMap = new Map();
      this.storyConfig.nodes.forEach(node => {
        this.nodeMap.set(node.id, node);
      });

      console.log(`[StoryGraphManager] Loaded ${this.storyConfig.nodes.length} story nodes from ${path}`);
      this.validateStoryGraph();
    } catch (error) {
      console.error('[StoryGraphManager] Failed to load story config:', error);
      throw new Error('Story configuration file not found or invalid');
    }
  }

  getStartNode(): StoryNode {
    const startNode = this.nodeMap.get(this.storyConfig.startNodeId);
    if (!startNode) {
      throw new Error(`Start node ${this.storyConfig.startNodeId} not found`);
    }
    return startNode;
  }

  getNode(nodeId: string): StoryNode | undefined {
    return this.nodeMap.get(nodeId);
  }

  getNodeOptions(nodeId: string): VotingOption[] {
    const node = this.nodeMap.get(nodeId);

    if (!node) {
      console.warn(`[StoryGraphManager] Node not found: ${nodeId}`);
      return [];
    }

    if (node.type === 'ending') {
      console.warn(`[StoryGraphManager] Node ${nodeId} is an ending, has no options`);
      return [];
    }

    return node.options || [];
  }

  isEndingNode(nodeId: string): boolean {
    const node = this.nodeMap.get(nodeId);
    return node?.type === 'ending';
  }

  getVideoPath(nodeId: string): string | null {
    const node = this.nodeMap.get(nodeId);
    if (!node) return null;

    // Return relative path from public/videos directory
    return `/videos/${node.videoFile}`;
  }

  getNextNodeId(currentNodeId: string, optionId: string): string | null {
    const node = this.nodeMap.get(currentNodeId);
    if (!node || !node.options) return null;

    const selectedOption = node.options.find(opt => opt.id === optionId);
    return selectedOption?.nextNodeId || null;
  }

  private validateStoryGraph(): void {
    const issues: string[] = [];

    // Check start node exists
    if (!this.nodeMap.has(this.storyConfig.startNodeId)) {
      issues.push(`Start node '${this.storyConfig.startNodeId}' not found`);
    }

    // Validate each node
    for (const node of this.storyConfig.nodes) {
      // Decision nodes must have options
      if (node.type === 'decision' && (!node.options || node.options.length === 0)) {
        issues.push(`Decision node '${node.id}' has no options`);
      }

      // Ending nodes should not have options
      if (node.type === 'ending' && node.options && node.options.length > 0) {
        issues.push(`Ending node '${node.id}' should not have options`);
      }

      // Check that option nextNodeIds exist
      if (node.options) {
        for (const option of node.options) {
          if (!this.nodeMap.has(option.nextNodeId)) {
            issues.push(`Option '${option.id}' in node '${node.id}' points to non-existent node '${option.nextNodeId}'`);
          }
        }
      }
    }

    if (issues.length > 0) {
      console.warn('[StoryGraphManager] Story graph validation issues:');
      issues.forEach(issue => console.warn(`  - ${issue}`));
    } else {
      console.log('[StoryGraphManager] Story graph validation passed');
    }
  }

  // Debug helper
  getStoryStats(): {
    totalNodes: number;
    decisionNodes: number;
    endingNodes: number;
    orphanedNodes: number;
  } {
    const reachableNodes = new Set<string>();
    const queue = [this.storyConfig.startNodeId];

    // BFS to find all reachable nodes
    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      if (reachableNodes.has(nodeId)) continue;

      reachableNodes.add(nodeId);
      const node = this.nodeMap.get(nodeId);

      if (node?.options) {
        node.options.forEach(opt => queue.push(opt.nextNodeId));
      }
    }

    const decisionNodes = Array.from(this.nodeMap.values()).filter(n => n.type === 'decision').length;
    const endingNodes = Array.from(this.nodeMap.values()).filter(n => n.type === 'ending').length;
    const orphanedNodes = this.storyConfig.nodes.length - reachableNodes.size;

    return {
      totalNodes: this.storyConfig.nodes.length,
      decisionNodes,
      endingNodes,
      orphanedNodes
    };
  }
}
