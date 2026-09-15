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

const INDEX_HTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
    <title>Kisanify | किसानिफाई</title>
    <style id="expo-reset">
      html, body { height: 100%; }
      body { overflow: hidden; }
      #root { display: flex; height: 100%; flex: 1; }
    </style>
  <link rel="preload" href="/_expo/static/css/global-30fcb4b49539bac5f11e99be779c574c.css" as="style"><link rel="stylesheet" href="/_expo/static/css/global-30fcb4b49539bac5f11e99be779c574c.css"></head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  <script src="/_expo/static/js/web/entry-8559a687cbbef98f94f5df6e7433c9ec.js" defer></script>
</body>
</html>`;

// Global Middleware
app.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// API Routes
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

// Frontend UI HTML Fallback (serves React Native Web app for browser navigation requests)
app.get('*', (c) => {
  return c.html(INDEX_HTML);
});

// Global Error Handler
app.onError(handleGlobalError);

export default app;
