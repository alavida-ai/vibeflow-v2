import { CheckCircle, Loader2 } from "lucide-react";
import { getWorkflowConfig } from "@/config/workflow-configs";
import { StepResult } from "@/types/twitter-analyzer";

// Re-export types for external use
export type { WorkflowStepConfig } from "@/config/workflow-configs";

interface WorkflowProgressProps {
  workflowId?: string;
  currentStep: string | null;
  completedSteps: string[];
  stepResults?: Record<string, StepResult>;
}

export const WorkflowProgress = ({ 
  workflowId = 'twitter-framework-analysis', 
  currentStep, 
  completedSteps, 
  stepResults = {}
}: WorkflowProgressProps) => {
  if (!currentStep && completedSteps.length === 0) return null;

  // Get workflow configuration
  const steps = getWorkflowConfig(workflowId);

  if (steps.length === 0) {
    console.warn(`No workflow configuration found for workflowId: ${workflowId}`);
    return null;
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-card-foreground">Analysis Progress</h3>
      <div className="space-y-4">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = currentStep === step.id;
          const stepResult = stepResults[step.id];
          const IconComponent = step.icon;

          // Get the appropriate text based on step state
          let statusText = '';
          let descriptionText = step.description;
          
          if (isCompleted && step.getResultText && stepResult?.output) {
            statusText = step.getResultText(stepResult.output);
          } else if (isCurrent && step.getProgressText) {
            statusText = step.getProgressText(stepResult?.output);
          } else if (isCompleted) {
            statusText = 'Complete';
          } else if (isCurrent) {
            statusText = 'In Progress...';
          }

          return (
            <div key={step.id} className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {isCompleted ? (
                  <CheckCircle className="w-6 h-6 text-success" />
                ) : isCurrent ? (
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                ) : (
                  <IconComponent className="w-6 h-6 text-muted-foreground/50" />
                )}
              </div>
              <div className="flex-1">
                <div className={`font-medium ${
                  isCompleted ? 'text-success' : 
                  isCurrent ? 'text-primary' : 
                  'text-muted-foreground'
                }`}>
                  {step.name}
                </div>
                <div className={`text-sm ${
                  isCompleted ? 'text-success/80' : 
                  isCurrent ? 'text-primary/80' : 
                  'text-muted-foreground/70'
                }`}>
                  {descriptionText}
                </div>
              </div>
              {statusText && (
                <div className={`text-sm font-medium ${
                  isCompleted ? 'text-success' : 
                  isCurrent ? 'text-primary' : 
                  'text-muted-foreground'
                }`}>
                  {statusText}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

