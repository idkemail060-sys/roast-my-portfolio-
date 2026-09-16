import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { config } from './server/config/env';
import reviewsRouter from './server/routes/reviewsRoutes';
import { requestTimeout } from './server/middleware/requestTimeout';
import { errorHandler } from './server/middleware/errorHandler';
import { AppError } from './server/errors/AppError';
import { checkSupabaseStatus } from './server/lib/supabase';

async function startServer() {
  const app = express();
  const PORT = config.port;

  // 1. CORS Configuration
  app.use(
    cors({
      origin: config.corsOrigin === '*' ? true : config.corsOrigin,
      methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    })
  );

  // 2. Request Timeout handling
  app.use(requestTimeout(config.requestTimeoutMs));

  // 3. JSON & Form Body Parsing
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // 4. API Health Endpoint
  app.get('/api/health', async (req, res) => {
    const supabaseStatus = await checkSupabaseStatus();

    res.json({
      success: true,
      status: 'ok',
      service: 'Roast My Portfolio API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      architecture: {
        websiteScraperReady: true,
        geminiAiReady: !!config.geminiApiKey,
        databaseReady: supabaseStatus.connected,
      },
      supabase: supabaseStatus,
    });
  });

  // 5. REST API Routes
  app.use('/api/reviews', reviewsRouter);

  // 6. Handle 404 for unhandled API endpoints before SPA fallback
  app.all('/api/*', (req, res, next) => {
    next(AppError.notFound(`Endpoint ${req.method} ${req.originalUrl} does not exist.`));
  });

  // 7. Centralized Error Handler for API routes
  app.use(errorHandler);

  // 8. Vite Middleware (Dev) or Static Assets (Prod)
  if (config.nodeEnv !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // 9. Bind to host 0.0.0.0 and port 3000
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[RoastMyPortfolio] Server running on http://0.0.0.0:${PORT} (${config.nodeEnv})`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup failure:', err);
  process.exit(1);
});
