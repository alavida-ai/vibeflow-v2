import { Hono } from 'hono';
import { swaggerUI } from '@hono/swagger-ui';
import { Scalar } from '@scalar/hono-api-reference';

export const docs = new Hono();

docs.get('/swagger', swaggerUI({ url: '/openapi.json' }));
docs.get('/scalar', Scalar({ url: '/openapi.json' }));