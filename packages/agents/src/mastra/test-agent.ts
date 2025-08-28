import dotenv from "dotenv";
dotenv.config({path: "/Users/alexandergirardet/Code/vibeflow-projects/brand-listener/packages/agents/.env"});

import { famousPersonAgent } from "./agents/famousPerson";


const result = await famousPersonAgent.generate("What is the capital of France?");

console.log(result);