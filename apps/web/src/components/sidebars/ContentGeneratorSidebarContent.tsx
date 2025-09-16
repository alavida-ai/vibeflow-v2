import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { FileText, Plus, Sparkles } from "lucide-react";
import { useContentGenerator } from "@/contexts/ContentGeneratorContext";

export const ContentGeneratorSidebarContent = () => {
  const {
    templates,
    currentTemplate,
    generatedContent,
    handleCreateNew,
    handleSelectTemplate
  } = useContentGenerator();

  return (
    <div className="group-data-[collapsible=icon]:hidden">
      <SidebarGroup>
        <SidebarMenuButton
          onClick={handleCreateNew}
          isActive={!currentTemplate}
          className="h-8 w-full"
        >
          <Plus className="w-4 h-4 flex-shrink-0" />
          <span>New Content</span>
        </SidebarMenuButton>
        
        <SidebarGroupLabel className="px-2 text-xs font-medium text-muted-foreground">
          Templates
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {templates.map((template) => (
              <SidebarMenuItem key={template}>
                <SidebarMenuButton
                  onClick={() => handleSelectTemplate(template)}
                  isActive={currentTemplate === template}
                  className="w-full justify-start gap-2 p-2"
                >
                  <FileText className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium truncate">{template}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel className="px-2 text-xs font-medium text-muted-foreground">
          Recent Content
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {generatedContent.length === 0 ? (
              <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                No content generated yet
              </div>
            ) : (
              generatedContent.map((content, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton className="w-full justify-start gap-2 p-2">
                    <Sparkles className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium truncate">{content}</span>
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
