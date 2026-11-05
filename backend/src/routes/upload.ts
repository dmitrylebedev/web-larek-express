import {
  NextFunction,
  Request,
  Response,
  Router,
} from 'express';
import multer from 'multer';

import uploadFile from '../controllers/upload';
import BadRequestError from '../errors/bad-request-error';
import auth from '../middlewares/auth';
import fileMiddleware from '../middlewares/file';

const router = Router();

const uploadSingle = (req: Request, res: Response, next: NextFunction) => {
  fileMiddleware.single('file')(req, res, (error: unknown) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError) {
      next(new BadRequestError('Размер файла превышает допустимый'));
      return;
    }

    next(error);
  });
};

router.post('/', auth, uploadSingle, uploadFile);

export default router;
