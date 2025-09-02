interface MetricsPanelProps {
  username?: string;
  totalFrameworks: number;
  avgEngagement: number;
  totalPosts: number;
}

export const MetricsPanel = ({ 
  username, 
  totalFrameworks, 
  avgEngagement, 
  totalPosts 
}: MetricsPanelProps) => {
  if (!username) {
    return (
      <div className="p-6 border-l border-border h-full">
        <div className="text-center text-muted-foreground">
          <p className="text-sm font-light">Enter a username to see metrics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 border-l border-border h-full">
      <div className="space-y-8">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Profile</h3>
          <p className="text-lg font-light">@{username}</p>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-2xl font-light">{totalFrameworks}</p>
            <p className="text-sm text-muted-foreground">Frameworks</p>
          </div>

          <div>
            <p className="text-2xl font-light">{avgEngagement.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Avg. Engagement</p>
          </div>

          <div>
            <p className="text-2xl font-light">{totalPosts.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Posts Analyzed</p>
          </div>

          <div>
            <p className="text-2xl font-light text-green-600">+24%</p>
            <p className="text-sm text-muted-foreground">Growth Rate</p>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground font-light">
            Frameworks generate 3.2x more engagement than average posts
          </p>
        </div>
      </div>
    </div>
  );
};