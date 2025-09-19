"use client";

import { useParams } from 'next/navigation';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { ToolSidebar } from "@/components/tools/ToolSidebar";
import { getToolConfig } from "@/lib/tools/registry";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const tool = params.tool as string;
  
  const toolConfig = getToolConfig(tool);
  if (!toolConfig) return <div>Tool not found</div>;

  const { SidebarContent, Provider, displayName } = toolConfig;

  return (
    <Provider>
      <SidebarProvider defaultOpen={true}>
        <div className="min-h-screen flex w-full bg-background">
          <ToolSidebar tool={displayName}>
            <SidebarContent />
          </ToolSidebar>
          
          <SidebarInset className="flex-1 w-0">
            {children}
          </SidebarInset>
        </div>
      </SidebarProvider>
    </Provider>
  );
}