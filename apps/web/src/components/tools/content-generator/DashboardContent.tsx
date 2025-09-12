"use client";

import { useContentGenerator } from "@/contexts/ContentGeneratorContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Sparkles, Wand2 } from "lucide-react";

export const ContentGeneratorDashboardContent = () => {
  const {
    templates,
    currentTemplate,
    generatedContent,
    handleSelectTemplate,
    handleCreateNew,
    addContent
  } = useContentGenerator();

  if (!currentTemplate) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Wand2 className="w-6 h-6" />
              Content Generator
            </CardTitle>
            <CardDescription>
              Select a template to start generating content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {templates.map((template) => (
                <Button
                  key={template}
                  variant="outline"
                  className="h-20 flex flex-col gap-2"
                  onClick={() => handleSelectTemplate(template)}
                >
                  <FileText className="w-6 h-6" />
                  <span>{template}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-row h-screen">
      {/* Content Generation Section */}
      <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-light mb-2">Content Generator</h2>
            <p className="text-sm text-muted-foreground font-light">
              Template: {currentTemplate} • Generate engaging content with AI
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                {currentTemplate}
              </CardTitle>
              <CardDescription>
                Generate content using the {currentTemplate.toLowerCase()} template
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Content Prompt
                </label>
                <Input
                  placeholder={`Enter your prompt for ${currentTemplate.toLowerCase()} content...`}
                />
              </div>
              <div className="flex gap-2">
                <Button className="flex items-center gap-2">
                  <Wand2 className="w-4 h-4" />
                  Generate Content
                </Button>
                <Button variant="outline" onClick={handleCreateNew}>
                  Change Template
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Generated Content</CardTitle>
              <CardDescription>
                Your AI-generated content will appear here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 min-h-[200px] bg-muted/20">
                <p className="text-muted-foreground text-center">
                  Click "Generate Content" to see your AI-generated content here
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stats Section - Desktop (right side) */}
      <div className="block w-80 shrink-0 p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Content Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Templates</span>
              <span className="font-semibold">{templates.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Generated</span>
              <span className="font-semibold">{generatedContent.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Current</span>
              <span className="font-semibold">{currentTemplate || 'None'}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
