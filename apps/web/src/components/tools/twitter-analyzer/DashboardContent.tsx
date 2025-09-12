"use client";

import { useStreamingAnalysis } from "@/hooks/tools/twitter-analyzer/use-streaming-analysis";
import { useTwitterAnalyzer } from "@/contexts/TwitterAnalyzerContext";

import { TwitterInput } from "@/components/tools/twitter-analyzer/TwitterInput";
import { FrameworksList } from "@/components/tools/twitter-analyzer/FrameworksList";
import { MetricsPanel } from "@/components/tools/twitter-analyzer/MetricsPanel";
import { WorkflowProgress } from "@/components/tools/twitter-analyzer/WorkflowProgress";
import { AnalysisHistory } from "@/types/twitter-analyzer";

export const TwitterAnalyzerDashboardContent = () => {
  const {
    currentAnalysis,
    showNewAnalysis,
    setShowNewAnalysis,
    addToHistory,
    setCurrentAnalysis,
    setAnalysisHistory
  } = useTwitterAnalyzer();

  // Use the streaming analysis hook
  const { isLoading, currentStep, completedSteps, stepResults, startAnalysis } = useStreamingAnalysis();


  const handleAnalyze = async (inputUsername: string) => {
    setShowNewAnalysis(false);

    // Create initial analysis entry
    const newAnalysis: AnalysisHistory = {
      id: inputUsername + Date.now().toString(),
      username: inputUsername,
      frameworks: [],
      analyzedAt: new Date(),
      totalPosts: 0
    };

    // Add to history and set as current
    addToHistory(newAnalysis);

    try {
      await startAnalysis(inputUsername, newAnalysis, setCurrentAnalysis, setAnalysisHistory);
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  const avgEngagement = currentAnalysis
    ? currentAnalysis.frameworks.reduce((acc, f) => acc + f.metrics.avgLikes, 0) / Math.max(currentAnalysis.frameworks.length, 1)
    : 0;

  if (showNewAnalysis) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <TwitterInput onSubmit={handleAnalyze} />
      </div>
    );
  }

  return (
    <div className="flex flex-row h-screen">
      {/* Frameworks Section */}
      <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-light mb-2">Frameworks</h2>
            <p className="text-sm text-muted-foreground font-light">
              {currentAnalysis?.username && (
                <>@{currentAnalysis.username} • </>
              )}
              {isLoading
                ? "Analyzing frameworks..."
                : `${currentAnalysis?.frameworks.length || 0} frameworks found`
              }
            </p>
          </div>

          {/* Show workflow progress when loading */}
          {isLoading && (
            <WorkflowProgress
              workflowId="twitter-framework-analysis"
              currentStep={currentStep}
              completedSteps={completedSteps}
              stepResults={stepResults}
            />
          )}

          <FrameworksList
            frameworks={currentAnalysis?.frameworks || []}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Metrics Section - Desktop (right side) */}
      <div className="block w-80 shrink-0">
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
