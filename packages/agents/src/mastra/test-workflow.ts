import { startWorkflow, getNextStep } from "./tools/workflows/StepOrchestrator";

// Start the workflow and get the first task
const firstTask = await startWorkflow("testWorkflow");
console.log("First task:", JSON.stringify(firstTask, null, 2));

if (firstTask.status === "suspended") {
  console.log("Task to complete:", firstTask.suspendPayload);
  
  // Complete the first task and get the next one (no parameters needed)
  const secondTask = await getNextStep();
  
  console.log("Second task:", JSON.stringify(secondTask, null, 2));
  
  if (secondTask.status === "suspended") {
    console.log("Next task to complete:", secondTask.suspendPayload);
    
    // Complete the research step (no parameters needed)
    const thirdTask = await getNextStep();
    
    console.log("Third task result:", JSON.stringify(thirdTask, null, 2));
    
    if (thirdTask.status === "success") {
      console.log("Workflow completed!", thirdTask.result);
    }
  } else if (secondTask.status === "success") {
    console.log("Workflow completed!", secondTask.result);
  }
} else if (firstTask.status === "success") {
  console.log("Workflow completed immediately!", firstTask.result);
}