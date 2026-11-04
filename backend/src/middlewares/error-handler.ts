import { NextFunction, Request, Response } from 'express';

import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';
import NotFoundError from '../errors/not-found-error';

const SERVER_MESSAGE = 'На сервере произошла ошибка';

const isKnownError = (
  error: Error,
): error is BadRequestError | ConflictError | NotFoundError => (
  error instanceof BadRequestError
  || error instanceof ConflictError
  || error instanceof NotFoundError
);

const isInvalidJson = (error: Error) => (
  error instanceof SyntaxError && 'status' in error && error.status === 400
);

const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (isKnownError(error)) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  if (isInvalidJson(error)) {
    return res.status(400).json({ message: 'Ошибка валидации данных' });
  }

  return res.status(500).json({ message: SERVER_MESSAGE });
};

export default errorHandler;
