import { CheckCircle, Loader2 } from "lucide-react";

// Workflow step definitions
const WORKFLOW_STEPS = [
  { id: 'framework-analysis', name: 'Analyzing Tweets', description: 'Extracting content patterns from Twitter data' },
  { id: 'parse-frameworks', name: 'Processing Frameworks', description: 'Structuring discovered patterns' },
  { id: 'calculate-metrics', name: 'Computing Metrics', description: 'Calculating engagement statistics' }
];

interface WorkflowProgressProps {
  currentStep: string | null;
  completedSteps: string[];
}

export const WorkflowProgress = ({ currentStep, completedSteps }: WorkflowProgressProps) => {
  if (!currentStep && completedSteps.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-card-foreground">Analysis Progress</h3>
      <div className="space-y-4">
        {WORKFLOW_STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = currentStep === step.id;
          const isUpcoming = !isCompleted && !isCurrent;

          return (
            <div key={step.id} className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {isCompleted ? (
                  <CheckCircle className="w-6 h-6 text-success" />
                ) : isCurrent ? (
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-muted bg-muted" />
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
                  isCompleted ? 'text-success' : 
                  isCurrent ? 'text-primary' : 
                  'text-muted-foreground/70'
                }`}>
                  {step.description}
                </div>
              </div>
              {isCurrent && (
                <div className="text-sm text-primary font-medium">
                  In Progress...
                </div>
              )}
              {isCompleted && (
                <div className="text-sm text-success font-medium">
                  Complete
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
