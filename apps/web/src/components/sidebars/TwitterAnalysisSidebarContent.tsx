import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { User, Clock, Plus } from "lucide-react";
import { AnalysisHistory } from "@/types/twitter-analyzer";
import { useTwitterAnalyzer } from "@/contexts/TwitterAnalyzerContext";

const formatDate = (date: Date) => {
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInHours < 48) return 'Yesterday';
  return date.toLocaleDateString();
};

export const TwitterAnalysisSidebarContent = () => {
  const {
    analysisHistory,
    currentAnalysis,
    showNewAnalysis,
    handleNewAnalysis,
    handleSelectAnalysis
  } = useTwitterAnalyzer();

  return (
    <div className="group-data-[collapsible=icon]:hidden">
      <SidebarGroup>
        <SidebarMenuButton
          onClick={handleNewAnalysis}
          isActive={showNewAnalysis}
          className="h-8 w-full"
        >
          <Plus className="w-4 h-4 flex-shrink-0" />
          <span>New Analysis</span>
        </SidebarMenuButton>
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
              analysisHistory.map((analysis: AnalysisHistory) => (
                <SidebarMenuItem key={analysis.id}>
                  <SidebarMenuButton
                    onClick={() => handleSelectAnalysis(analysis)}
                    isActive={currentAnalysis?.id === analysis.id}
                    className="w-full justify-start gap-2 p-2"
                    title={`@${analysis.username}`}
                  >
                    <User className="w-4 h-4 flex-shrink-0" />
                    <div className="flex flex-col items-start min-w-0 flex-1">
                      <span className="font-medium truncate">@{analysis.username}</span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3 flex-shrink-0" />
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
    </div>
  );
};