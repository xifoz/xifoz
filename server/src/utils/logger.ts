import { createLogger, format, transports } from 'winston';

const { combine, timestamp, errors, json, colorize, simple } = format;

const isProd = process.env['NODE_ENV'] === 'production';

export const logger = createLogger({
  level: isProd ? 'info' : 'debug',
  format: isProd
    ? combine(timestamp(), errors({ stack: true }), json())
    : combine(colorize(), timestamp({ format: 'HH:mm:ss' }), errors({ stack: true }), simple()),
  transports: [new transports.Console()],
  exceptionHandlers: [new transports.Console()],
  rejectionHandlers: [new transports.Console()],
});
