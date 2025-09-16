// src/lib/tools/registry.tsx
import { TwitterAnalysisSidebarContent } from "@/components/sidebars/TwitterAnalysisSidebarContent";
import { TwitterAnalyzerDashboardContent } from "@/components/tools/twitter-analyzer/DashboardContent";
import { TwitterAnalyzerProvider } from "@/contexts/TwitterAnalyzerContext";
import { ContentGeneratorSidebarContent } from "@/components/sidebars/ContentGeneratorSidebarContent";
import { ContentGeneratorDashboardContent } from "@/components/tools/content-generator/DashboardContent";
import { ContentGeneratorProvider } from "@/contexts/ContentGeneratorContext";

interface ToolConfig {
  name: string;
  displayName: string;
  SidebarContent: React.ComponentType;
  DashboardContent: React.ComponentType;
  Provider: React.ComponentType<{ children: React.ReactNode }>;
}

export const TOOL_REGISTRY: Record<string, ToolConfig> = {
  'twitter-analyzer': {
    name: 'twitter-analyzer',
    displayName: 'Twitter Analyzer',
    SidebarContent: TwitterAnalysisSidebarContent,
    DashboardContent: TwitterAnalyzerDashboardContent,
    Provider: TwitterAnalyzerProvider,
  },
  'content-generator': {
    name: 'content-generator',
    displayName: 'Content Generator',
    SidebarContent: ContentGeneratorSidebarContent,
    DashboardContent: ContentGeneratorDashboardContent,
    Provider: ContentGeneratorProvider,
  },
  // Future tools just add here...
};

export const getToolConfig = (toolName: string): ToolConfig | null => {
    return TOOL_REGISTRY[toolName] || null;
};