import {
  errorLogger as expressErrorLogger,
  logger as expressLogger,
} from 'express-winston';
import winston from 'winston';

export const requestLogger = expressLogger({
  transports: [
    new winston.transports.File({ filename: 'request.log' }),
  ],
  format: winston.format.json(),
});

export const errorLogger = expressErrorLogger({
  transports: [
    new winston.transports.File({ filename: 'error.log' }),
  ],
  format: winston.format.json(),
});
