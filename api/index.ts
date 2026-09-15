import { handle } from 'hono/vercel';
import app from '../apps/backend/src/index.js';

export const config = {
  runtime: 'edge',
};

export default handle(app);
