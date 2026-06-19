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
  rateLimit: {
    windowMs: number;
    max: number;
  };
}
