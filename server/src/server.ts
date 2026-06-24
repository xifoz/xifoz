import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config/index.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { globalRateLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import contactRoutes from './routes/contact.routes.js';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { logger } from './utils/logger.js';
import { cleanupExpiredSessions } from './repositories/session.repository.js';

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
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Cookie parsing
app.use(cookieParser());

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
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// 404 + error handlers
app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  await connectDatabase();

  // Warn (non-fatal) if email notification env vars are absent
  const emailEnvMissing: string[] = [];
  if (!process.env['RESEND_API_KEY']) emailEnvMissing.push('RESEND_API_KEY');
  if (!process.env['SUPPORT_EMAIL']) emailEnvMissing.push('SUPPORT_EMAIL');
  if (emailEnvMissing.length > 0) {
    logger.warn(
      `Email notifications are disabled. Missing environment variables: ${emailEnvMissing.join(', ')}. ` +
      'Contact form submissions will still be saved to the database.'
    );
  }

  // Run database session cleanup on startup
  cleanupExpiredSessions()
    .then((result) => {
      if (result.count > 0) {
        logger.info(`Startup session cleanup completed: removed ${result.count} expired/revoked sessions`);
      }
    })
    .catch((err) => {
      logger.error('Startup session cleanup failed', { error: err });
    });

  // Schedule session cleanup to run daily (every 24 hours)
  const cleanupInterval = setInterval(() => {
    cleanupExpiredSessions()
      .then((result) => {
        if (result.count > 0) {
          logger.info(`Scheduled session cleanup completed: removed ${result.count} expired/revoked sessions`);
        }
      })
      .catch((err) => {
        logger.error('Scheduled session cleanup failed', { error: err });
      });
  }, 24 * 60 * 60 * 1000);

  const server = app.listen(config.port, () => {
    logger.info(`XIFOZ API running on port ${config.port} [${config.nodeEnv}]`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    clearInterval(cleanupInterval);
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
