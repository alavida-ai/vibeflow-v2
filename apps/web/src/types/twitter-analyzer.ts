export interface Framework {
  id: string;
  title: string;
  description: string;
  structure: string;
  promptTemplate: string;
  tweetsReferenced: number[];
  metrics: {
    avgViews: number;
    avgLikes: number;
    avgRetweets: number;
    avgReplies: number;
    avgQuotes: number;
    avgBookmarks: number;
  };
}

export interface AnalysisHistory {
  id: string;
  username: string;
  frameworks: Framework[];
  analyzedAt: Date;
  totalPosts: number;
}

export interface StepResult {
  stepId: string;
  output?: any;
  timestamp?: number;
}
