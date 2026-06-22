export interface ContactSubmissionInput {
  name: string;
  email: string;
  company?: string;
  service?: string;
  message: string;
}

export interface ApiResponse<T = null> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface AppConfig {
  port: number;
  nodeEnv: string;
  databaseUrl: string;
  corsOrigin: string;
  bcryptRounds: number;
  jwt: {
    accessSecret: string;
    refreshSecret: string;
    accessExpiresIn: string;
    refreshExpiresIn: string;
  };
  cookie: {
    name: string;
    sameSite: 'lax' | 'strict' | 'none';
    maxAge: number;
    path: string;
  };
  rateLimit: {
    windowMs: number;
    max: number;
  };
}

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: 'SUPER_ADMIN' | 'SECURITY_ADMIN' | 'READ_ONLY';
}

export interface RefreshTokenPayload {
  sub: string;
  sessionId: string;
}

import { Admin } from '@prisma/client';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      admin?: Omit<Admin, 'hashedPassword'>;
    }
  }
}
