import fs from 'fs/promises';
import path from 'path';
import { randomBytes } from 'crypto';

import cron from 'node-cron';

import { UPLOAD_PATH, UPLOAD_PATH_TEMP } from '../config';
import BadRequestError from '../errors/bad-request-error';

const HOUR_IN_MS = 60 * 60 * 1000;
const sourceRoot = path.resolve(__dirname, '..');

export const tempDir = path.resolve(sourceRoot, '..', UPLOAD_PATH_TEMP);
export const imagesDir = path.resolve(sourceRoot, 'public', UPLOAD_PATH);

const allowedExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg'];

export const createStoredFileName = (originalName: string) => {
  const extension = path.extname(originalName).toLowerCase();
  const safeExtension = allowedExtensions.includes(extension) ? extension : '.png';

  return `${randomBytes(4).toString('hex')}${safeExtension}`;
};

const imageBaseName = (fileName: string) => {
  const baseName = path.basename(fileName);
  const isSafeName = baseName === fileName.slice('/images/'.length)
    && /^[\w.-]+$/.test(baseName);

  if (!fileName.startsWith('/images/') || !isSafeName) {
    throw new BadRequestError('Некорректный путь к файлу');
  }

  return baseName;
};

export const ensureUploadDirs = async () => {
  await fs.mkdir(tempDir, { recursive: true });
  await fs.mkdir(imagesDir, { recursive: true });
};

export const publishImage = async (fileName: string) => {
  const baseName = imageBaseName(fileName);
  const source = path.join(tempDir, baseName);
  const destination = path.join(imagesDir, baseName);

  try {
    await fs.access(source);
  } catch (_error) {
    return;
  }

  await fs.rename(source, destination);
};

export const removeImage = async (fileName?: string) => {
  if (!fileName) {
    return;
  }

  try {
    const baseName = imageBaseName(fileName);
    await fs.rm(path.join(imagesDir, baseName), { force: true });
  } catch (_error) {
    // Файл уже отсутствует или путь не относится к публичным картинкам.
  }
};

const cleanTempDir = async () => {
  await ensureUploadDirs();
  const fileNames = await fs.readdir(tempDir);
  const expiration = Date.now() - HOUR_IN_MS;

  await Promise.all(fileNames.map(async (fileName) => {
    const filePath = path.join(tempDir, fileName);
    const stat = await fs.stat(filePath);

    if (stat.isFile() && stat.mtimeMs < expiration) {
      await fs.rm(filePath, { force: true });
    }
  }));
};

export const startTempCleanup = () => {
  cron.schedule('0 * * * *', () => {
    cleanTempDir().catch(() => undefined);
  });
};
