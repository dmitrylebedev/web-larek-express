import path from 'path';

import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const {
  PORT = 3000,
  DB_ADDRESS = 'mongodb://127.0.0.1:27017/weblarek',
  ORIGIN_ALLOW = 'http://localhost:5173',
  AUTH_ACCESS_TOKEN_EXPIRY = '10m',
  AUTH_REFRESH_TOKEN_EXPIRY = '7d',
  JWT_SECRET = 'weblarek-dev-secret',
  UPLOAD_PATH = 'images',
  UPLOAD_PATH_TEMP = 'temp',
} = process.env;

export {
  PORT,
  DB_ADDRESS,
  ORIGIN_ALLOW,
  AUTH_ACCESS_TOKEN_EXPIRY,
  AUTH_REFRESH_TOKEN_EXPIRY,
  JWT_SECRET,
  UPLOAD_PATH,
  UPLOAD_PATH_TEMP,
};
