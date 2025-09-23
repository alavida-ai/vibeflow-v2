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

export const AgentSchema = z.object({
  id: z.string().min(1, 'id is required'),
  name: z.string().min(1, 'name is required'),
  description: z.string().min(1, 'description is required'),
  instructions: z.string().min(1, 'instructions is required'),
});

export type WorkflowInput = z.infer<typeof WorkflowSchema>;
export type StepInput = z.infer<typeof StepSchema>;
export type AgentInput = z.infer<typeof AgentSchema>;


