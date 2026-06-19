import type { AppConfig } from '../types/index.js';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function validateConfig(): AppConfig {
  const missing: string[] = [];

  const required = ['DATABASE_URL', 'CORS_ORIGIN'];
  for (const key of required) {
    if (!process.env[key]) missing.push(key);
  }

  if (missing.length > 0) {
    throw new Error(
      `Server startup aborted. Missing required environment variables:\n  ${missing.join('\n  ')}\n\nCopy .env.example to .env and fill in the values.`
    );
  }

  return {
    port: parseInt(process.env['PORT'] ?? '4000', 10),
    nodeEnv: process.env['NODE_ENV'] ?? 'development',
    databaseUrl: requireEnv('DATABASE_URL'),
    corsOrigin: requireEnv('CORS_ORIGIN'),
    rateLimit: {
      windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] ?? '900000', 10),
      max: parseInt(process.env['RATE_LIMIT_MAX'] ?? '100', 10),
    },
  };
}

export const config = validateConfig();
