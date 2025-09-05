"use client";

import { useState, useEffect } from "react";
import { TwitterInput } from "@/components/TwitterInput";
import { FrameworksList } from "@/components/FrameworksList";
import { MetricsPanel } from "@/components/MetricsPanel";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Plus, User, Clock } from "lucide-react";

// Types
interface Framework {
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

interface AnalysisHistory {
  id: string;
  username: string;
  frameworks: Framework[];
  analyzedAt: Date;
  totalPosts: number;
}

// // Simplified mock data
// const mockFrameworks: Framework[] = [
//   {
//     id: "1",
//     title: "Problem → Solution → Result",
//     description: "Present a problem, share your solution, quantify the outcome",
//     structure: "1. Identify problem\n2. Share solution\n3. Show result\n4. Ask question",
//     prompt: "You are a content expert. Help me create a tweet using the Problem → Solution → Result framework.\n\nAsk me:\n1. What problem does my audience face?\n2. What solution do I offer?\n3. What specific result can I share?\n4. What engaging question should I end with?\n\nCreate a tweet under 280 characters that follows this structure.",
//     metrics: {
//       avgViews: 125000,
//       avgLikes: 890,
//       successRate: 84
//     }
//   },
//   {
//     id: "2",
//     title: "Contrarian Opinion + Data",
//     description: "Challenge common beliefs with supporting evidence",
//     structure: "1. Contrarian statement\n2. Supporting data\n3. Why it matters\n4. Discussion prompt",
//     prompt: "You are a thought leadership expert. Help me create a contrarian take tweet.\n\nAsk me:\n1. What common belief do I disagree with?\n2. What data supports my view?\n3. Why should people care?\n4. What question sparks discussion?\n\nCreate a bold tweet under 280 characters.",
//     metrics: {
//       avgViews: 89000,
//       avgLikes: 1240,
//       successRate: 76
//     }
//   },
//   {
//     id: "3",
//     title: "Personal Story + Lesson",
//     description: "Share a transformative experience with clear takeaway",
//     structure: "1. Set the scene\n2. The challenge\n3. The insight\n4. The lesson",
//     prompt: "You are a storytelling expert. Help me craft a personal story tweet.\n\nAsk me:\n1. What challenge did I face?\n2. What was the turning point?\n3. What did I learn?\n4. How can others apply this?\n\nCreate an authentic story tweet under 280 characters.",
//     metrics: {
//       avgViews: 156000,
//       avgLikes: 2100,
//       successRate: 92
//     }
//   }
// ];

const Index = () => {
  // State management
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistory[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisHistory | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showNewAnalysis, setShowNewAnalysis] = useState(true);

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
    setIsLoading(true);
    setShowNewAnalysis(false);
    
    try {
      // Call the analysis API
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: inputUsername }),
      });

      const data = await response.json();

      let frameworks = []; // Fallback to mock data
      let totalPosts = 247;

      if (response.ok && data.frameworks && Array.isArray(data.frameworks)) {
        frameworks = data.frameworks;
        totalPosts = data.totalPosts || 0;
        console.log('Using real framework data:', frameworks);
      } else {
        console.log('API call failed or no framework data received, using mock data');
        if (!response.ok) {
          console.error('API Error:', data.error || 'Failed to analyze user');
        }
      }

      const newAnalysis: AnalysisHistory = {
        id: Date.now().toString(),
        username: inputUsername,
        frameworks: frameworks,
        analyzedAt: new Date(),
        totalPosts: totalPosts
      };

      // Add to history (keep only last 10 analyses)
      setAnalysisHistory(prev => [newAnalysis, ...prev].slice(0, 10));
      setCurrentAnalysis(newAnalysis);
    } catch (error) {
      console.error('Error calling analysis API:', error);
      // Still create an entry with mock data on error
      const newAnalysis: AnalysisHistory = {
        id: Date.now().toString(),
        username: inputUsername,
        frameworks: [],
        analyzedAt: new Date(),
        totalPosts: 0
      };
      setAnalysisHistory(prev => [newAnalysis, ...prev].slice(0, 10));
      setCurrentAnalysis(newAnalysis);
    } finally {
      setIsLoading(false);
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

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const avgEngagement = currentAnalysis 
    ? currentAnalysis.frameworks.reduce((acc, f) => acc + f.metrics.avgLikes, 0) / Math.max(currentAnalysis.frameworks.length, 1)
    : 0;

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        {/* Sidebar */}
        <Sidebar className="border-r border-border">
          <SidebarHeader className="p-4">
            <Button
              onClick={handleNewAnalysis}
              className="w-full justify-start gap-2"
              variant={showNewAnalysis ? "default" : "outline"}
            >
              <Plus className="w-4 h-4" />
              New Analysis
            </Button>
          </SidebarHeader>
          
          <SidebarContent className="px-2">
            <SidebarGroup>
              <SidebarGroupLabel className="px-2 text-xs font-medium text-muted-foreground">
                Recent Analyses
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {analysisHistory.length === 0 ? (
                    <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                      No analyses yet
                    </div>
                  ) : (
                    analysisHistory.map((analysis) => (
                      <SidebarMenuItem key={analysis.id}>
                        <SidebarMenuButton
                          onClick={() => handleSelectAnalysis(analysis)}
                          isActive={currentAnalysis?.id === analysis.id}
                          className="w-full justify-start gap-2 p-2"
                        >
                          <User className="w-4 h-4 shrink-0" />
                          <div className="flex flex-col items-start min-w-0 flex-1">
                            <span className="font-medium truncate">@{analysis.username}</span>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>{formatDate(analysis.analyzedAt)}</span>
                            </div>
                          </div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <SidebarInset className="flex-1">
          {showNewAnalysis ? (
            // New Analysis View
            <div className="flex items-center justify-center min-h-screen p-6">
              <TwitterInput onSubmit={handleAnalyze} isLoading={isLoading} />
            </div>
          ) : (
            // Results View
            <div className="flex h-screen">
              {/* Frameworks Section */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="mb-6">
                  <h2 className="text-2xl font-light mb-2">Frameworks</h2>
                  <p className="text-sm text-muted-foreground font-light">
                    {currentAnalysis?.username && (
                      <>@{currentAnalysis.username} • </>
                    )}
                    {currentAnalysis?.frameworks.length || 0} frameworks found
                  </p>
                </div>
                <FrameworksList 
                  frameworks={currentAnalysis?.frameworks || []} 
                  isLoading={isLoading} 
                />
              </div>
              
              {/* Metrics Section */}
              <div className="w-80 shrink-0">
                <MetricsPanel 
                  username={currentAnalysis?.username}
                  totalFrameworks={currentAnalysis?.frameworks.length || 0}
                  avgEngagement={Math.round(avgEngagement)}
                  totalPosts={currentAnalysis?.totalPosts || 0}
                />
              </div>
            </div>
          )}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;