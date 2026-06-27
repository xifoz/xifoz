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

  const required = [
    'DATABASE_URL',
    'CORS_ORIGIN',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'COOKIE_NAME',
    'MFA_ENCRYPTION_KEY',
  ];
  for (const key of required) {
    if (!process.env[key]) missing.push(key);
  }

  if (missing.length > 0) {
    throw new Error(
      `Server startup aborted. Missing required environment variables:\n  ${missing.join('\n  ')}\n\nCopy .env.example to .env and fill in the values.`
    );
  }

  const rawSameSite = process.env['COOKIE_SAME_SITE']?.toLowerCase();
  const sameSite = (rawSameSite === 'strict' || rawSameSite === 'none') ? rawSameSite : 'lax';

  return {
    port: parseInt(process.env['PORT'] ?? '4000', 10),
    nodeEnv: process.env['NODE_ENV'] ?? 'development',
    databaseUrl: requireEnv('DATABASE_URL'),
    corsOrigin: requireEnv('CORS_ORIGIN').split(',').map(origin => origin.trim()),
    bcryptRounds: parseInt(process.env['BCRYPT_ROUNDS'] ?? '12', 10),
    mfaEncryptionKey: requireEnv('MFA_ENCRYPTION_KEY'),
    jwt: {
      accessSecret: requireEnv('JWT_ACCESS_SECRET'),
      refreshSecret: requireEnv('JWT_REFRESH_SECRET'),
      accessExpiresIn: process.env['JWT_ACCESS_EXPIRES_IN'] ?? '15m',
      refreshExpiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] ?? '7d',
    },
    cookie: {
      name: requireEnv('COOKIE_NAME'),
      sameSite,
      maxAge: parseInt(process.env['COOKIE_MAX_AGE_MS'] ?? '604800000', 10),
      path: process.env['COOKIE_PATH'] ?? '/api/auth',
    },
    rateLimit: {
      windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] ?? '900000', 10),
      max: parseInt(process.env['RATE_LIMIT_MAX'] ?? '100', 10),
    },
  };
}

export const config = validateConfig();
