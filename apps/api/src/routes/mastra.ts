import { createHonoServer } from '@mastra/deployer/server';
import type { Hono } from 'hono';

import { createMastra } from '@vibeflow/mastra-runtime';

// Build Mastra (apps/web/etc can reuse this package)
const mastra = createMastra();

console.log('Creating Mastra app');

const mastraApp = await createHonoServer(mastra) as unknown as Hono;

export { mastraApp };



