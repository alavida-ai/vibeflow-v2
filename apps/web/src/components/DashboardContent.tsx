import { TwitterInput } from "@/components/TwitterInput";
import { FrameworksList } from "@/components/FrameworksList";
import { MetricsPanel } from "@/components/MetricsPanel";
import { WorkflowProgress } from "@/components/WorkflowProgress";
import { AnalysisHistory } from "@/types/dashboard";

interface DashboardContentProps {
  showNewAnalysis: boolean;
  currentAnalysis: AnalysisHistory | null;
  isLoading: boolean;
  currentStep: string | null;
  completedSteps: string[];
  onAnalyze: (username: string) => void;
}

export const DashboardContent = ({
  showNewAnalysis,
  currentAnalysis,
  isLoading,
  currentStep,
  completedSteps,
  onAnalyze
}: DashboardContentProps) => {
  const avgEngagement = currentAnalysis
    ? currentAnalysis.frameworks.reduce((acc, f) => acc + f.metrics.avgLikes, 0) / Math.max(currentAnalysis.frameworks.length, 1)
    : 0;

  if (showNewAnalysis) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <TwitterInput onSubmit={onAnalyze} isLoading={isLoading} />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      {/* Metrics Section - Mobile (top) */}
      <div className="lg:hidden border-b border-border">
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{currentAnalysis?.frameworks.length || 0}</div>
              <div className="text-xs text-muted-foreground">Frameworks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{Math.round(avgEngagement)}</div>
              <div className="text-xs text-muted-foreground">Avg Engagement</div>
            </div>
          </div>
          {currentAnalysis?.username && (
            <div className="text-center mt-2">
              <div className="text-sm font-medium">@{currentAnalysis.username}</div>
              <div className="text-xs text-muted-foreground">{currentAnalysis.totalPosts} posts analyzed</div>
            </div>
          )}
        </div>
      </div>

      {/* Frameworks Section */}
      <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-light mb-2">Frameworks</h2>
            <p className="text-sm text-muted-foreground font-light">
              {currentAnalysis?.username && (
                <>@{currentAnalysis.username} • </>
              )}
              {currentAnalysis?.frameworks.length || 0} frameworks found
            </p>
          </div>

          {/* Show workflow progress when loading */}
          {isLoading && (
            <WorkflowProgress
              currentStep={currentStep}
              completedSteps={completedSteps}
            />
          )}

          <FrameworksList
            frameworks={currentAnalysis?.frameworks || []}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Metrics Section - Desktop (right side) */}
      <div className="hidden lg:block w-80 shrink-0">
        <MetricsPanel
          username={currentAnalysis?.username}
          totalFrameworks={currentAnalysis?.frameworks.length || 0}
          avgEngagement={Math.round(avgEngagement)}
          totalPosts={currentAnalysis?.totalPosts || 0}
        />
      </div>
    </div>
  );
};
