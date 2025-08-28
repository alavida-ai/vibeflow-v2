// import { createTool } from "@mastra/core";
// import { z } from "zod";
// import { humanInLoopWorkflow } from "../workflows/flow";

// export const getWorkflowTool = createTool({
//     id: "get-workflow",
//     description: "Get the latest workflow for a given brand",
//     inputSchema: z.object({
//       workflowId: z.string()
//     }),
//     execute: async ({ context, runtimeContext }) => {
//       const { workflowId } = context;

//       console.log("workflowId", workflowId);
      
//       const run = await humanInLoopWorkflow?.createRunAsync({
//           inputData: {
//           value: 1
//         }
//       });

//       const result = await run?.start({
//         inputData: {
//           input: "test"
//         }
//       });

//       if (result.status === "suspended") {
//         const suspended = result.suspended;
//         console.log("suspended", suspended);
    
//       }
        
//       return {
//         outcome: result
//       };
//     }
//   });