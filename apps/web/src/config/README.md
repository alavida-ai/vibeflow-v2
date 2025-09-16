# Scalable Workflow Progress System

This system provides a flexible and scalable way to display workflow progress with real-time step results, making it easy to add new workflows without hardcoding UI components.

## Overview

The workflow progress system consists of:
- **WorkflowProgress Component**: Displays progress with step-specific icons, descriptions, and results
- **Workflow Configurations**: Centralized configuration for different workflows
- **Streaming Analysis Hook**: Captures and stores step results in real-time
- **Step Result Display**: Shows actual data (e.g., "50 tweets collected") instead of generic loading states

## Quick Start

### 1. Using an Existing Workflow

```tsx
import { WorkflowProgress } from "@/components/WorkflowProgress";

// In your component
<WorkflowProgress
  workflowId="twitter-framework-analysis"
  currentStep={currentStep}
  completedSteps={completedSteps}
  stepResults={stepResults}
/>
```

### 2. Creating a New Workflow Configuration

```tsx
// In apps/web/src/config/workflow-configs.ts
import { Brain, Database, Send } from "lucide-react";
import { createWorkflowConfig } from "@/config/workflow-configs";

export const MY_NEW_WORKFLOW_CONFIG = createWorkflowConfig([
  {
    id: 'data-collection',
    name: 'Collecting Data',
    description: 'Gathering information from sources',
    icon: Database,
    getResultText: (result) => result?.itemsCollected ? `${result.itemsCollected} items collected` : 'Data collected',
    getProgressText: () => 'Collecting data from sources...'
  },
  {
    id: 'ai-processing',
    name: 'AI Processing',
    description: 'Processing data with AI',
    icon: Brain,
    getResultText: (result) => result?.processed ? `${result.processed} items processed` : 'Processing complete',
    getProgressText: () => 'AI is processing your data...'
  },
  {
    id: 'send-results',
    name: 'Sending Results',
    description: 'Delivering processed results',
    icon: Send,
    getResultText: (result) => result?.sent ? 'Results sent successfully' : 'Results delivered',
    getProgressText: () => 'Sending results...'
  }
]);

// Register the workflow
export const WORKFLOW_CONFIGS: Record<string, WorkflowStepConfig[]> = {
  'twitter-framework-analysis': TWITTER_FRAMEWORK_ANALYSIS_CONFIG,
  'my-new-workflow': MY_NEW_WORKFLOW_CONFIG, // Add your new workflow here
  // ... other workflows
};
```

### 3. Using the New Workflow

```tsx
<WorkflowProgress
  workflowId="my-new-workflow"
  currentStep={currentStep}
  completedSteps={completedSteps}
  stepResults={stepResults}
/>
```

## Configuration Reference

### WorkflowStepConfig Interface

```tsx
interface WorkflowStepConfig {
  id: string;                                    // Unique step identifier (matches workflow step ID)
  name: string;                                  // Display name for the step
  description: string;                           // Brief description of what the step does
  icon: React.ComponentType<{ className?: string }>; // Lucide React icon component
  getResultText?: (result: any) => string;      // Function to generate result text when step completes
  getProgressText?: (result: any) => string;    // Function to generate progress text while step is running
}
```

### Step States

The component automatically handles different step states:

- **Upcoming**: Shows the step icon in muted colors
- **In Progress**: Shows spinning loader with progress text
- **Completed**: Shows checkmark with result text

### Result Data

Step results are automatically captured from the streaming workflow and passed to your `getResultText` and `getProgressText` functions:

```tsx
// Example result data structure
const stepResult = {
  stepId: 'twitter-scraper',
  output: {
    totalTweets: 150,
    username: 'example_user'
  },
  timestamp: 1703123456789
}
```

## Advanced Usage

### Dynamic Workflow Registration

You can register workflows at runtime:

```tsx
import { registerWorkflowConfig } from "@/config/workflow-configs";

// Register a new workflow dynamically
registerWorkflowConfig('dynamic-workflow', [
  {
    id: 'step1',
    name: 'Dynamic Step',
    description: 'A dynamically registered step',
    icon: Zap,
    getResultText: (result) => `Processed ${result?.count || 0} items`
  }
]);
```

### Custom Result Formatting

Use the result functions to create rich, informative progress messages:

```tsx
{
  id: 'complex-step',
  name: 'Complex Processing',
  description: 'Multi-phase processing step',
  icon: Settings,
  getResultText: (result) => {
    if (!result) return 'Processing complete';
    
    const { processed, errors, duration } = result;
    if (errors > 0) {
      return `Processed ${processed} items (${errors} errors) in ${duration}ms`;
    }
    return `Successfully processed ${processed} items in ${duration}ms`;
  },
  getProgressText: (result) => {
    if (result?.phase) {
      return `Processing phase ${result.phase}/3...`;
    }
    return 'Starting complex processing...';
  }
}
```

## Integration with Mastra Workflows

The system automatically integrates with Mastra workflows through the streaming analysis hook:

1. **Workflow Events**: Listens for `workflow-step-start` and `workflow-step-result` events
2. **Step Results**: Captures step output data from `event.payload.output`
3. **Progress Updates**: Updates UI in real-time as steps complete

### Workflow Step Naming

Ensure your Mastra workflow step IDs match the configuration step IDs:

```tsx
// In your Mastra workflow
const myStep = createStep({
  id: "data-collection", // This should match the config step ID
  // ... rest of step definition
});

// In your workflow config
{
  id: 'data-collection', // This should match the workflow step ID
  name: 'Collecting Data',
  // ... rest of config
}
```

## Available Icons

Common Lucide React icons you can use:

- **Data**: `Database`, `HardDrive`, `Archive`
- **Processing**: `Brain`, `Cpu`, `Zap`, `Settings`
- **Communication**: `Send`, `Mail`, `MessageSquare`, `Phone`
- **Analysis**: `BarChart3`, `TrendingUp`, `PieChart`, `Activity`
- **Content**: `FileText`, `Image`, `Video`, `Music`
- **Social**: `Users`, `User`, `Heart`, `Share`
- **Actions**: `Search`, `Download`, `Upload`, `Refresh`

## Best Practices

1. **Meaningful Names**: Use clear, action-oriented step names
2. **Helpful Descriptions**: Provide context about what each step does
3. **Relevant Icons**: Choose icons that visually represent the step action
4. **Informative Results**: Show actual data rather than generic "Complete" messages
5. **Progressive Updates**: Use progress text to show intermediate states
6. **Error Handling**: Consider error states in your result text functions
7. **Performance**: Keep result text functions lightweight as they run on every update

## Troubleshooting

### Step Not Showing
- Ensure the workflow step ID matches the configuration step ID exactly
- Check that the workflow is registered in `WORKFLOW_CONFIGS`
- Verify the `workflowId` prop matches the registered workflow key

### No Result Text
- Check that your workflow is emitting `workflow-step-result` events with output data
- Verify the `getResultText` function is handling the result structure correctly
- Ensure the streaming analysis hook is capturing step results

### Icons Not Displaying
- Verify the icon is imported from `lucide-react`
- Check that the icon component is passed correctly (not as a string)
- Ensure the icon component accepts a `className` prop
