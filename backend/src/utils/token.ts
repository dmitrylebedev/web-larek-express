import { CookieOptions, Response } from 'express';
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import ms from 'ms';

import {
  AUTH_ACCESS_TOKEN_EXPIRY,
  AUTH_REFRESH_TOKEN_EXPIRY,
  JWT_SECRET,
} from '../config';

const accessSignOptions: SignOptions = {
  expiresIn: AUTH_ACCESS_TOKEN_EXPIRY as SignOptions['expiresIn'],
};

const refreshSignOptions: SignOptions = {
  expiresIn: AUTH_REFRESH_TOKEN_EXPIRY as SignOptions['expiresIn'],
};

const refreshMaxAge = ms(AUTH_REFRESH_TOKEN_EXPIRY as ms.StringValue) ?? ms('7d');

export const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: false,
  maxAge: refreshMaxAge,
  path: '/',
};

export const signAccessToken = (userId: string) => (
  jwt.sign({ _id: userId }, JWT_SECRET, accessSignOptions)
);

export const signRefreshToken = (userId: string) => (
  jwt.sign({ _id: userId }, JWT_SECRET, refreshSignOptions)
);

export const verifyToken = (token: string) => (
  jwt.verify(token, JWT_SECRET) as JwtPayload & { _id: string }
);

export const setRefreshCookie = (res: Response, token: string) => {
  res.cookie('refreshToken', token, refreshCookieOptions);
};

export const clearRefreshCookie = (res: Response) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
  });
};
