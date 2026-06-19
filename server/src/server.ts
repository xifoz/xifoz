import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from './config/index.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { globalRateLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import contactRoutes from './routes/contact.routes.js';
import { logger } from './utils/logger.js';

const app = express();

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// CORS
app.use(
  cors({
    origin: config.corsOrigin,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
  })
);

// Body parsing
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: false, limit: '16kb' }));

// Trust proxy for accurate rate limiting behind load balancer
app.set('trust proxy', 1);

// Global rate limiter
app.use(globalRateLimiter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/contact', contactRoutes);

// 404 + error handlers
app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  await connectDatabase();

  const server = app.listen(config.port, () => {
    logger.info(`XIFOZ API running on port ${config.port} [${config.nodeEnv}]`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start().catch((err: unknown) => {
  logger.error('Failed to start server', { error: err });
  process.exit(1);
});
