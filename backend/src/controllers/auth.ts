import bcrypt from 'bcryptjs';
import { NextFunction, Request, Response } from 'express';
import { Error as MongooseError } from 'mongoose';

import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';
import NotFoundError from '../errors/not-found-error';
import UnauthorizedError from '../errors/unauthorized-error';
import User from '../models/user';
import {
  clearRefreshCookie,
  setRefreshCookie,
  signAccessToken,
  signRefreshToken,
  verifyToken,
} from '../utils/token';

const INVALID_CREDENTIALS = 'Неправильные почта или пароль';
const INVALID_TOKEN = 'Не валидный токен';
const AUTH_REQUIRED = 'Необходима авторизация';
const USER_NOT_FOUND = 'Пользователь не найден';
const INVALID_USER_ID = 'Передан невалидный id пользователя';
const DUPLICATE_EMAIL = 'Пользователь с таким email уже существует';

const isObjectId = (value: string) => /^[a-f\d]{24}$/i.test(value);

const isDuplicateKeyError = (error: unknown) => (
  error instanceof Error && error.message.includes('E11000')
);

const toPublicUser = (user: { name: string; email: string; _id: { toString(): string } }) => ({
  name: user.name,
  email: user.email,
  id: user._id.toString(),
});

const issueSession = async (
  user: {
    _id: { toString(): string };
    name: string;
    email: string;
    isNew?: boolean;
    tokens: { token: string }[];
    save: () => Promise<unknown>;
  },
  res: Response,
  previousToken?: string,
) => {
  const userId = user._id.toString();
  const accessToken = signAccessToken(userId);
  const refreshToken = signRefreshToken(userId);

  if (user.isNew) {
    user.tokens.push({ token: refreshToken });
    await user.save();
  } else if (previousToken) {
    await User.updateOne({ _id: user._id }, { $pull: { tokens: { token: previousToken } } });
    await User.updateOne({ _id: user._id }, { $push: { tokens: { token: refreshToken } } });
  } else {
    await User.updateOne({ _id: user._id }, { $push: { tokens: { token: refreshToken } } });
  }

  setRefreshCookie(res, refreshToken);

  return res.json({
    success: true,
    user: toPublicUser(user),
    accessToken,
  });
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;
    const user = new User({ name, email, password });

    return await issueSession(user, res.status(201));
  } catch (error) {
    if (error instanceof MongooseError.ValidationError) {
      return next(new BadRequestError(error.message));
    }

    if (isDuplicateKeyError(error)) {
      return next(new ConflictError(DUPLICATE_EMAIL));
    }

    return next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password +tokens');

    if (!user) {
      return next(new UnauthorizedError(INVALID_CREDENTIALS));
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return next(new UnauthorizedError(INVALID_CREDENTIALS));
    }

    return await issueSession(user, res);
  } catch (error) {
    return next(error);
  }
};

const readRefreshToken = (req: Request) => {
  const { refreshToken } = req.cookies ?? {};

  if (typeof refreshToken !== 'string' || refreshToken.length === 0) {
    return null;
  }

  return refreshToken;
};

export const refreshAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const refreshToken = readRefreshToken(req);

    if (!refreshToken) {
      return next(new UnauthorizedError(INVALID_TOKEN));
    }

    let payload;

    try {
      payload = verifyToken(refreshToken);
    } catch (error) {
      return next(new UnauthorizedError(INVALID_TOKEN));
    }

    if (!isObjectId(payload._id)) {
      return next(new BadRequestError(INVALID_USER_ID));
    }

    const user = await User.findById(payload._id).select('+tokens');

    if (!user) {
      return next(new NotFoundError(USER_NOT_FOUND));
    }

    const tokenIndex = user.tokens.findIndex((item) => item.token === refreshToken);

    if (tokenIndex === -1) {
      return next(new UnauthorizedError(INVALID_TOKEN));
    }

    return await issueSession(user, res, refreshToken);
  } catch (error) {
    return next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = readRefreshToken(req);

    if (!refreshToken) {
      return next(new UnauthorizedError(AUTH_REQUIRED));
    }

    let payload;

    try {
      payload = verifyToken(refreshToken);
    } catch (error) {
      return next(new UnauthorizedError(INVALID_TOKEN));
    }

    if (!isObjectId(payload._id)) {
      return next(new BadRequestError(INVALID_USER_ID));
    }

    const user = await User.findById(payload._id).select('+tokens');

    if (!user) {
      return next(new NotFoundError(USER_NOT_FOUND));
    }

    const tokenIndex = user.tokens.findIndex((item) => item.token === refreshToken);

    if (tokenIndex === -1) {
      return next(new UnauthorizedError(INVALID_TOKEN));
    }

    await User.updateOne(
      { _id: user._id },
      { $pull: { tokens: { token: refreshToken } } },
    );
    clearRefreshCookie(res);

    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
};

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return next(new UnauthorizedError(AUTH_REQUIRED));
    }

    const user = await User.findById(userId);

    if (!user) {
      return next(new NotFoundError(USER_NOT_FOUND));
    }

    return res.json({
      success: true,
      user: toPublicUser(user),
    });
  } catch (error) {
    return next(error);
  }
};
