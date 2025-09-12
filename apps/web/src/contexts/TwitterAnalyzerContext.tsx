"use client";

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { AnalysisHistory } from '@/types/twitter-analyzer';

interface TwitterAnalyzerContextType {
  analysisHistory: AnalysisHistory[];
  currentAnalysis: AnalysisHistory | null;
  showNewAnalysis: boolean;
  handleSelectAnalysis: (analysis: AnalysisHistory) => void;
  handleNewAnalysis: () => void;
  addToHistory: (analysis: AnalysisHistory) => void;
  setAnalysisHistory: (history: AnalysisHistory[] | ((prev: AnalysisHistory[]) => AnalysisHistory[])) => void;
  setCurrentAnalysis: (analysis: AnalysisHistory | null | ((prev: AnalysisHistory | null) => AnalysisHistory | null)) => void;
  setShowNewAnalysis: (show: boolean) => void;
}

const TwitterAnalyzerContext = createContext<TwitterAnalyzerContextType | null>(null);

export function TwitterAnalyzerProvider({ children }: { children: ReactNode }) {
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistory[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisHistory | null>(null);
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

  const handleSelectAnalysis = (analysis: AnalysisHistory) => {
    console.log('handleSelectAnalysis', analysis);
    setCurrentAnalysis(analysis);
    setShowNewAnalysis(false);
  };

  const handleNewAnalysis = () => {
    setCurrentAnalysis(null);
    setShowNewAnalysis(true);
  };

  const addToHistory = (analysis: AnalysisHistory) => {
    setAnalysisHistory(prev => [analysis, ...prev].slice(0, 10));
    setCurrentAnalysis(analysis);
  };

  return (
    <TwitterAnalyzerContext.Provider value={{
      analysisHistory,
      currentAnalysis,
      showNewAnalysis,
      handleSelectAnalysis,
      handleNewAnalysis,
      addToHistory,
      setAnalysisHistory,
      setCurrentAnalysis,
      setShowNewAnalysis,
    }}>
      {children}
    </TwitterAnalyzerContext.Provider>
  );
}

export const useTwitterAnalyzer = () => {
  const context = useContext(TwitterAnalyzerContext);
  if (!context) {
    throw new Error('useTwitterAnalyzer must be used within TwitterAnalyzerProvider');
  }
  return context;
};
