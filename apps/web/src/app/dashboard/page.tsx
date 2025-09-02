"use client";

import { useState } from "react";
import { TwitterInput } from "@/components/TwitterInput";
import { FrameworksList } from "@/components/FrameworksList";
import { MetricsPanel } from "@/components/MetricsPanel";

// Simplified mock data
const mockFrameworks = [
  {
    id: "1",
    title: "Problem → Solution → Result",
    description: "Present a problem, share your solution, quantify the outcome",
    structure: "1. Identify problem\n2. Share solution\n3. Show result\n4. Ask question",
    prompt: "You are a content expert. Help me create a tweet using the Problem → Solution → Result framework.\n\nAsk me:\n1. What problem does my audience face?\n2. What solution do I offer?\n3. What specific result can I share?\n4. What engaging question should I end with?\n\nCreate a tweet under 280 characters that follows this structure.",
    metrics: {
      avgViews: 125000,
      avgLikes: 890,
      successRate: 84
    }
  },
  {
    id: "2",
    title: "Contrarian Opinion + Data",
    description: "Challenge common beliefs with supporting evidence",
    structure: "1. Contrarian statement\n2. Supporting data\n3. Why it matters\n4. Discussion prompt",
    prompt: "You are a thought leadership expert. Help me create a contrarian take tweet.\n\nAsk me:\n1. What common belief do I disagree with?\n2. What data supports my view?\n3. Why should people care?\n4. What question sparks discussion?\n\nCreate a bold tweet under 280 characters.",
    metrics: {
      avgViews: 89000,
      avgLikes: 1240,
      successRate: 76
    }
  },
  {
    id: "3",
    title: "Personal Story + Lesson",
    description: "Share a transformative experience with clear takeaway",
    structure: "1. Set the scene\n2. The challenge\n3. The insight\n4. The lesson",
    prompt: "You are a storytelling expert. Help me craft a personal story tweet.\n\nAsk me:\n1. What challenge did I face?\n2. What was the turning point?\n3. What did I learn?\n4. How can others apply this?\n\nCreate an authentic story tweet under 280 characters.",
    metrics: {
      avgViews: 156000,
      avgLikes: 2100,
      successRate: 92
    }
  }
];

const Index = () => {
  const [frameworks, setFrameworks] = useState<typeof mockFrameworks>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");

  const handleAnalyze = async (inputUsername: string) => {
    setIsLoading(true);
    setUsername(inputUsername);
    
    setTimeout(() => {
      setFrameworks(mockFrameworks);
      setIsLoading(false);
    }, 1500);
  };

  const avgEngagement = frameworks.reduce((acc, f) => acc + f.metrics.avgLikes, 0) / Math.max(frameworks.length, 1);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 min-h-screen">
          {/* Input Section */}
          <div className="lg:col-span-1 flex items-center justify-center p-6 border-r border-border">
            <TwitterInput onAnalyze={handleAnalyze} isLoading={isLoading} />
          </div>
          
          {/* Frameworks Section */}
          <div className="lg:col-span-2 p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-light mb-2">Frameworks</h2>
              <p className="text-sm text-muted-foreground font-light">
                {frameworks.length > 0 ? `${frameworks.length} frameworks found` : "Discover content patterns"}
              </p>
            </div>
            <FrameworksList frameworks={frameworks} isLoading={isLoading} />
          </div>
          
          {/* Metrics Section */}
          <div className="lg:col-span-1">
            <MetricsPanel 
              username={username}
              totalFrameworks={frameworks.length}
              avgEngagement={Math.round(avgEngagement)}
              totalPosts={247}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;