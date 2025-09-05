import { z } from "zod";

export const startWorkflowResultSchema = z.object({
    runId: z.string().optional(),
    suspendPayload: z.any().optional(),
    status: z.enum(["suspended"]).optional()
  });
  
  export type StartWorkflowResult = z.infer<typeof startWorkflowResultSchema>;