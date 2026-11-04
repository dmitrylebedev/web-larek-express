import fs from 'fs';
import path from 'path';

import multer from 'multer';

import BadRequestError from '../errors/bad-request-error';
import { createStoredFileName, tempDir } from '../utils/file';

const allowedMimeTypes = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

const fileSizeLimit = 10 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    fs.mkdirSync(tempDir, { recursive: true });
    callback(null, tempDir);
  },
  filename: (_req, file, callback) => {
    callback(null, createStoredFileName(file.originalname));
  },
});

const fileMiddleware = multer({
  storage,
  limits: { fileSize: fileSizeLimit },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      callback(new BadRequestError('Недопустимый тип файла'));
      return;
    }

    callback(null, true);
  },
});

export const storedOriginalName = (originalName: string) => path.basename(originalName);

export default fileMiddleware;
