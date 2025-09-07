"use client";

import { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DashboardContent } from "@/components/DashboardContent";
import { useStreamingAnalysis } from "@/hooks/use-streaming-analysis";
import { AnalysisHistory } from "@/types/dashboard";


const Index = () => {
  // State management
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistory[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisHistory | null>(null);
  const [showNewAnalysis, setShowNewAnalysis] = useState(true);
  
  // Use the streaming analysis hook
  const { isLoading, currentStep, completedSteps, startAnalysis } = useStreamingAnalysis();

  // Load history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('twitter-analysis-history');
    if (savedHistory) {
      const parsedHistory = JSON.parse(savedHistory).map((item: any) => ({
        ...item,
        analyzedAt: new Date(item.analyzedAt)
      }));
      setAnalysisHistory(parsedHistory);
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (analysisHistory.length > 0) {
      localStorage.setItem('twitter-analysis-history', JSON.stringify(analysisHistory));
    }
  }, [analysisHistory]);

  const handleAnalyze = async (inputUsername: string) => {
    setShowNewAnalysis(false);
    
    // Create initial analysis entry
    const newAnalysis: AnalysisHistory = {
      id: Date.now().toString(),
      username: inputUsername,
      frameworks: [],
      analyzedAt: new Date(),
      totalPosts: 0
    };

    // Add to history and set as current
    setAnalysisHistory(prev => [newAnalysis, ...prev].slice(0, 10));
    setCurrentAnalysis(newAnalysis);
    
    try {
      await startAnalysis(inputUsername, currentAnalysis, setCurrentAnalysis, setAnalysisHistory);
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  const handleSelectAnalysis = (analysis: AnalysisHistory) => {
    setCurrentAnalysis(analysis);
    setShowNewAnalysis(false);
  };

  const handleNewAnalysis = () => {
    setCurrentAnalysis(null);
    setShowNewAnalysis(true);
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar
          analysisHistory={analysisHistory}
          currentAnalysis={currentAnalysis}
          showNewAnalysis={showNewAnalysis}
          onNewAnalysis={handleNewAnalysis}
          onSelectAnalysis={handleSelectAnalysis}
        />
        
        <SidebarInset className="flex-1 w-0">
          <DashboardContent
            showNewAnalysis={showNewAnalysis}
            currentAnalysis={currentAnalysis}
            isLoading={isLoading}
            currentStep={currentStep}
            completedSteps={completedSteps}
            onAnalyze={handleAnalyze}
          />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;