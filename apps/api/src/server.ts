import { Hono } from 'hono';
import { serve } from 'bun';
// routes
import { mastraApp } from './routes/mastra';
import { docs } from './routes/docs';

// Build the Mastra Hono app and mount it

const app = new Hono();

// Your API routes first
app.get('/health', (c) => c.text('ok'));
// Mount Mastra under a namespace

app.route('/docs', docs);
app.route('/', mastraApp);

serve({ fetch: app.fetch, port: 4111, hostname: 'localhost', idleTimeout: 255 });
console.log('API server running on http://localhost:4111');


