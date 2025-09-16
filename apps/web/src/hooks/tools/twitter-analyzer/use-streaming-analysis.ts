import { useState } from 'react';
import { useTwitterAnalyzer } from '@/contexts/TwitterAnalyzerContext';
import { StepResult } from '@/types/twitter-analyzer';
import { createAnalysisStream, readStream } from './stream-processor';
import { EventHandlerContext, processEvent } from './event-handlers';

export const useStreamingAnalysis = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [stepResults, setStepResults] = useState<Record<string, StepResult>>({});

  // Get context setters - much cleaner than passing as parameters!
  const { setCurrentAnalysis, setAnalysisHistory } = useTwitterAnalyzer();

  const startAnalysis = async (username: string) => {
    setIsLoading(true);
    setCurrentStep(null);
    setCompletedSteps([]);
    setStepResults({});

    try {
      // Create stream using pure function
      const reader = await createAnalysisStream(username);
      
      // Create event handler context
      const eventContext: EventHandlerContext = {
        setCurrentStep,
        setCompletedSteps,
        setStepResults,
        setCurrentAnalysis,
        setAnalysisHistory,
      };

      // Process stream events - much cleaner than the old approach!
      for await (const events of readStream(reader)) {
        for (const event of events) {
          processEvent(event, eventContext);
        }
      }

    } catch (error) {
      console.error('Error in streaming analysis:', error);
      // Keep the analysis entry but mark it as failed
      setCurrentAnalysis(prev => prev ? { ...prev, frameworks: [] } : prev);
      throw error;
    } finally {
      setIsLoading(false);
      setCurrentStep(null);
    }
  };

  return {
    isLoading,
    currentStep,
    completedSteps,
    stepResults,
    startAnalysis
  };
};