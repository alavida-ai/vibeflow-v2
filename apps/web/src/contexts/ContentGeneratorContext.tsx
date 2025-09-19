// src/contexts/ContentGeneratorContext.tsx
"use client";

import { createContext, useContext, ReactNode, useState } from 'react';

interface ContentGeneratorContextType {
  templates: string[];
  currentTemplate: string | null;
  generatedContent: string[];
  handleSelectTemplate: (template: string) => void;
  handleCreateNew: () => void;
  addContent: (content: string) => void;
}

const ContentGeneratorContext = createContext<ContentGeneratorContextType | null>(null);

export function ContentGeneratorProvider({ children }: { children: ReactNode }) {
  const [templates] = useState<string[]>(['Blog Post', 'Social Media', 'Email Newsletter', 'Product Description']);
  const [currentTemplate, setCurrentTemplate] = useState<string | null>(null);
  const [generatedContent] = useState<string[]>(['Sample content 1', 'Sample content 2']);

  const handleSelectTemplate = (template: string) => {
    setCurrentTemplate(template);
  };

  const handleCreateNew = () => {
    setCurrentTemplate(null);
  };

  const addContent = (content: string) => {
    // Dummy implementation
    console.log('Adding content:', content);
  };

  return (
    <ContentGeneratorContext.Provider value={{
      templates,
      currentTemplate,
      generatedContent,
      handleSelectTemplate,
      handleCreateNew,
      addContent,
    }}>
      {children}
    </ContentGeneratorContext.Provider>
  );
}

export const useContentGenerator = () => {
  const context = useContext(ContentGeneratorContext);
  if (!context) {
    throw new Error('useContentGenerator must be used within ContentGeneratorProvider');
  }
  return context;
};
