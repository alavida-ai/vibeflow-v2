// Event processing logic - handles different event types from the stream

import { AnalysisHistory, StepResult } from '@/types/twitter-analyzer';
import { ParsedEvent } from './stream-processor';

export interface EventHandlerContext {
  setCurrentStep: (step: string | null) => void;
  setCompletedSteps: (updater: (prev: string[]) => string[]) => void;
  setStepResults: (updater: (prev: Record<string, StepResult>) => Record<string, StepResult>) => void;
  setCurrentAnalysis: (updater: (prev: AnalysisHistory | null) => AnalysisHistory | null) => void;
  setAnalysisHistory: (updater: (prev: AnalysisHistory[]) => AnalysisHistory[]) => void;
}

/**
 * Handle workflow start event
 */
export function handleWorkflowStart(event: ParsedEvent, context: EventHandlerContext): void {
  console.log('Workflow started with runId:', event.runId);
  context.setCurrentStep('starting');
  context.setCompletedSteps(() => []);
  context.setStepResults(() => ({}));
}

/**
 * Handle workflow step start event
 */
export function handleStepStart(event: ParsedEvent, context: EventHandlerContext): void {
  const stepName = event.payload?.stepName || event.payload?.id || 'Unknown step';
  console.log('Step started:', stepName);
  context.setCurrentStep(stepName);
}

/**
 * Handle workflow step result event
 */
export function handleStepResult(event: ParsedEvent, context: EventHandlerContext): void {
  const stepName = event.payload?.stepName || event.payload?.id;
  const stepOutput = event.payload?.output;

  // Store step result
  context.setStepResults(prev => ({
    ...prev,
    [stepName]: {
      stepId: stepName,
      output: stepOutput,
      timestamp: Date.now()
    }
  }));

  // Mark step as completed
  context.setCompletedSteps(prev => [...prev, stepName]);

  // Handle final step with complete results
  if (stepName === 'calculate-metrics' && stepOutput?.frameworks) {
    updateFinalAnalysis(stepOutput, context);
  } else {
    console.log(`Step ${stepName} completed:`, stepOutput);
  }
}

/**
 * Handle workflow finish event
 */
export function handleWorkflowFinish(event: ParsedEvent, context: EventHandlerContext): void {
  console.log('Workflow completed with usage:', event.payload?.usage);
  context.setCurrentStep(null);
}

/**
 * Update analysis with final results
 */
function updateFinalAnalysis(result: any, context: EventHandlerContext): void {
  context.setCurrentAnalysis(prev => {
    if (!prev) return prev;
    
    const finalAnalysis = {
      ...prev,
      frameworks: result.frameworks || [],
      totalPosts: result.totalPosts || prev.totalPosts
    };

    // Update in history
    context.setAnalysisHistory(prevHistory =>
      prevHistory.map(analysis =>
        analysis.id === prev.id ? finalAnalysis : analysis
      )
    );

    return finalAnalysis;
  });
  
  console.log('Final frameworks received from calculate-metrics step:', result);
}

/**
 * Main event processor - routes events to appropriate handlers
 */
export function processEvent(event: ParsedEvent, context: EventHandlerContext): void {
  try {
    console.log('Stream event:', event);

    switch (event.type) {
      case 'workflow-start':
        handleWorkflowStart(event, context);
        break;
      case 'workflow-step-start':
        handleStepStart(event, context);
        break;
      case 'workflow-step-result':
        handleStepResult(event, context);
        break;
      case 'workflow-finish':
        handleWorkflowFinish(event, context);
        break;
      default:
        console.log('Unknown event type:', event.type);
    }
  } catch (error) {
    console.error('Error processing stream event:', error);
  }
}
