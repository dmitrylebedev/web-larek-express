import { NextFunction, Request, Response } from 'express';
import { Error as MongooseError } from 'mongoose';

import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';
import Product from '../models/product';

const VALIDATION_MESSAGE = 'Ошибка валидации данных при создании товара';
const DUPLICATE_TITLE_MESSAGE = 'Товар с таким заголовком уже существует';

const isDuplicateKeyError = (error: unknown) => (
  error instanceof Error && error.message.includes('E11000')
);

export const getProducts = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const products = await Product.find();
    return res.json({
      items: products,
      total: products.length,
    });
  } catch (error) {
    return next(error);
  }
};

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const product = await Product.create(req.body);
    return res.json(product);
  } catch (error) {
    if (
      error instanceof MongooseError.ValidationError
      || error instanceof MongooseError.CastError
    ) {
      return next(new BadRequestError(VALIDATION_MESSAGE));
    }

    if (isDuplicateKeyError(error)) {
      return next(new ConflictError(DUPLICATE_TITLE_MESSAGE));
    }

    return next(error);
  }
};
