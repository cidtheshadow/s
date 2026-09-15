import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { AppContext } from './types.js';
import { handleGlobalError } from './middleware/error.js';
import { healthRouter } from './routes/health.js';
import { authRouter } from './routes/auth.js';
import { farmersRouter } from './routes/farmers.js';
import { centresRouter } from './routes/centres.js';
import { bookingsRouter } from './routes/bookings.js';
import { pricesRouter } from './routes/prices.js';
import { grievancesRouter } from './routes/grievances.js';
import { officerRouter } from './routes/officer.js';
import { adminRouter } from './routes/admin.js';
import { assistantRouter } from './routes/assistant.js';
import { ivrRouter } from './routes/ivr.js';

const app = new Hono<AppContext>();

// Global Middleware
app.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Routes
app.route('/health', healthRouter);
app.route('/auth', authRouter);
app.route('/farmers', farmersRouter);
app.route('/centres', centresRouter);
app.route('/bookings', bookingsRouter);
app.route('/prices', pricesRouter);
app.route('/grievances', grievancesRouter);
app.route('/officer', officerRouter);
app.route('/admin', adminRouter);
app.route('/assistant', assistantRouter);
app.route('/ivr', ivrRouter);

// Global Error Handler
app.onError(handleGlobalError);

export default app;
