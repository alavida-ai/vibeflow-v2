import { z } from 'zod';

export const StepSchema = z.object({
  id: z.string().min(1, 'steps[].id is required'),
  description: z.string().optional(),
  prompt: z.string().min(1, 'steps[].prompt is required'),
  acceptance_criteria: z.union([z.string(), z.array(z.string())]).optional(),
});

export const WorkflowSchema = z.object({
  id: z.string().min(1, 'id is required'),
  description: z.string().optional(),
  steps: z.array(StepSchema).min(1, 'steps must have at least one step'),
});

export type WorkflowInput = z.infer<typeof WorkflowSchema>;
export type StepInput = z.infer<typeof StepSchema>;


