import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Plus, User, Clock } from "lucide-react";
import { SignedIn, UserButton } from '@clerk/nextjs';
import { AnalysisHistory } from "@/types/dashboard";

interface DashboardSidebarProps {
  analysisHistory: AnalysisHistory[];
  currentAnalysis: AnalysisHistory | null;
  showNewAnalysis: boolean;
  onNewAnalysis: () => void;
  onSelectAnalysis: (analysis: AnalysisHistory) => void;
}

const formatDate = (date: Date) => {
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInHours < 48) return 'Yesterday';
  return date.toLocaleDateString();
};

export const DashboardSidebar = ({
  analysisHistory,
  currentAnalysis,
  showNewAnalysis,
  onNewAnalysis,
  onSelectAnalysis
}: DashboardSidebarProps) => {
  return (
    <Sidebar className="border-r border-border" collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-between mb-4">
          <SidebarTrigger className="h-8 w-8 flex-shrink-0" />
          <span className="group-data-[collapsible=icon]:hidden font-semibold">Vibeflow</span>
        </div>
        <Button
          onClick={onNewAnalysis}
          className="w-full justify-start gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
          variant={showNewAnalysis ? "default" : "outline"}
          size="sm"
        >
          <Plus className="w-4 h-4 flex-shrink-0" />
          <span className="group-data-[collapsible=icon]:hidden">New Analysis</span>
        </Button>
      </SidebarHeader>
      
      <SidebarContent className="px-2">
        {/* Only show history section when not collapsed */}
        <div className="group-data-[collapsible=icon]:hidden">
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
                        onClick={() => onSelectAnalysis(analysis)}
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
      </SidebarContent>
      
      <SidebarFooter className="p-4">
        <SignedIn>
          <div className="flex items-center justify-center group-data-[collapsible=icon]:justify-center">
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                  userButtonPopoverCard: "min-w-[200px]"
                }
              }}
            />
            <span className="ml-2 text-sm font-medium group-data-[collapsible=icon]:hidden">
              Profile
            </span>
          </div>
        </SignedIn>
      </SidebarFooter>
    </Sidebar>
  );
};
