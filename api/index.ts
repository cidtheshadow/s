import { handle } from 'hono/vercel';
import app from '../apps/backend/src/index';

export default handle(app);
