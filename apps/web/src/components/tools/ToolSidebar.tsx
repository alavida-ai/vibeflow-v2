import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarFooter,
    SidebarTrigger,
} from "@/components/ui/sidebar";

import { SignedIn, UserButton } from '@clerk/nextjs';
import { ThemeSwitcherButton } from "@/components/elements/theme-switcher-button";
import { useRouter, useParams } from 'next/navigation';
import { TOOL_REGISTRY } from '@/lib/tools/registry';

interface ToolSidebarProps {
    tool: string;
    children: React.ReactNode;
}

export function ToolSidebar({ tool, children }: ToolSidebarProps) {
    const router = useRouter();
    const params = useParams();
    const currentTool = params.tool as string;

    const switchTool = (toolName: string) => {
        router.push(`/tools/${toolName}/dashboard`);
    };

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="flex flex-col gap-2 p-2">
                <div className="mb-4 flex h-8 w-full items-center justify-start gap-2 group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2">
                    <SidebarTrigger className="h-8 w-8 flex-shrink-0" />
                    <span className="group-data-[collapsible=icon]:hidden font-semibold">Vibeflow</span>
                </div>
                
                {/* Tool Switcher Dropdown */}
                <div className="group-data-[collapsible=icon]:hidden">
                    <select 
                        value={currentTool} 
                        onChange={(e) => switchTool(e.target.value)}
                        className="w-full p-2 text-sm bg-background border border-border rounded-md"
                    >
                        {Object.values(TOOL_REGISTRY).map((toolConfig) => (
                            <option key={toolConfig.name} value={toolConfig.name}>
                                {toolConfig.displayName}
                            </option>
                        ))}
                    </select>
                </div>
            </SidebarHeader>

            <SidebarContent> {/* add px-2? */}
                {children} {/* Tool-specific content goes here */}
            </SidebarContent>

            <SidebarFooter className="flex flex-col gap-4 p-2">
                <ThemeSwitcherButton />

                <SignedIn>
                    <div className="flex items-center group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center ">
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
}