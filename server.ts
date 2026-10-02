import express from 'express';
import http from 'http';
import path from 'path';
import dotenv from 'dotenv';
import { router as apiRouter } from './server/routes';
import { wsHub } from './server/ws';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Disable fingerprinting header
app.disable('x-powered-by');

// Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Express body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logger
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[API] ${req.method} ${req.path} - User: ${req.headers['x-user-id'] || 'anon'}`);
  }
  next();
});

// Mount API routes
app.use('/api', apiRouter);

// Centralized safe error handler (prevents stack trace disclosure)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[SERVER_ERROR]', err);
  if (!res.headersSent) {
    res.status(err.status || 500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Ocurrió un error en el servidor. La incidencia fue registrada para auditoría de seguridad.',
    });
  }
});

// Initialize Real-time WebSocket Hub attached to HTTP server
wsHub.init(server);

// Setup frontend serving (Vite in dev, static files in production)
async function startServer() {
  if (!isProduction) {
    // Dynamic import of Vite for development server middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
    console.log('[DEV] Vite dev server middleware mounted.');
  } else {
    // Production static file serving
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('[PROD] Static assets served from dist directory.');
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[SERVER] SIG-Currículo Full-Stack Server listening on http://0.0.0.0:${PORT}`);
    console.log(`[SERVER] Real-time WebSockets active at ws://0.0.0.0:${PORT}/ws`);
  });
}

startServer().catch((err) => {
  console.error('[SERVER] Fatal error during startup:', err);
  process.exit(1);
});
