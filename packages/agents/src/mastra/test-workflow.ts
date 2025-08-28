import { mastra } from "./index";
import { famousPersonAgent } from "./agents/famousPerson";
import { gameAgent } from "./agents/gameAgent";
 
const run = await mastra.getWorkflow("headsUpWorkflow").createRunAsync();
    
const result = await run.start({
  inputData: {
    start: true
  }
});
 
// Dump the complete workflow result (includes status, steps and result)
console.log(JSON.stringify(result, null, 2));
 
// Get the workflow output value
if (result.status === 'success') {
  console.log(`output value: ${result.result.famousPerson}`);
}

if (result.status === "suspended") {
  result.steps
}