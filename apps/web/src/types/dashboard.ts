export interface Framework {
  id: string;
  title: string;
  description: string;
  structure: string;
  prompt: string;
  tweetsReferenced: number[];
  metrics: {
    avgViews: number;
    avgLikes: number;
    successRate: number;
  };
}

export interface AnalysisHistory {
  id: string;
  username: string;
  frameworks: Framework[];
  analyzedAt: Date;
  totalPosts: number;
}
