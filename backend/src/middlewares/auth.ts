import { NextFunction, Request, Response } from 'express';

import UnauthorizedError from '../errors/unauthorized-error';
import { verifyToken } from '../utils/token';

declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
      };
    }
  }
}

const AUTH_REQUIRED = 'Необходима авторизация';
const TOKEN_EXPIRED = 'Истек срок действия токена';

const isObjectId = (value: string) => /^[a-f\d]{24}$/i.test(value);

const auth = (req: Request, _res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    next(new UnauthorizedError(AUTH_REQUIRED));
    return;
  }

  try {
    const payload = verifyToken(authorization.replace('Bearer ', ''));

    if (!isObjectId(payload._id)) {
      next(new UnauthorizedError(AUTH_REQUIRED));
      return;
    }

    req.user = { _id: payload._id };
    next();
  } catch (error) {
    if (error instanceof Error && error.name === 'TokenExpiredError') {
      next(new UnauthorizedError(TOKEN_EXPIRED));
      return;
    }

    next(new UnauthorizedError(AUTH_REQUIRED));
  }
};

export default auth;
