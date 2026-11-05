import { NextFunction, Request, Response } from 'express';

import BadRequestError from '../errors/bad-request-error';
import { storedOriginalName } from '../middlewares/file';

const uploadFile = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    next(new BadRequestError('Файл не передан'));
    return;
  }

  res.json({
    fileName: `/images/${req.file.filename}`,
    originalName: storedOriginalName(req.file.originalname),
  });
};

export default uploadFile;
