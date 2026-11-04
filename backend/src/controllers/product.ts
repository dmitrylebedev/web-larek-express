import { NextFunction, Request, Response } from 'express';
import { Error as MongooseError } from 'mongoose';

import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';
import NotFoundError from '../errors/not-found-error';
import Product from '../models/product';
import { publishImage, removeImage } from '../utils/file';

const VALIDATION_MESSAGE = 'Ошибка валидации данных при создании товара';
const UPDATE_VALIDATION_MESSAGE = 'Ошибка валидации данных при обновлении товара';
const DUPLICATE_TITLE_MESSAGE = 'Товар с таким заголовком уже существует';
const INVALID_ID_MESSAGE = 'Передан не валидный ID товара';
const NOT_FOUND_MESSAGE = 'Нет товара по заданному id';

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

const handleWriteError = (
  error: unknown,
  next: NextFunction,
  validationMessage: string,
) => {
  if (error instanceof MongooseError.CastError) {
    next(new BadRequestError(INVALID_ID_MESSAGE));
    return;
  }

  if (error instanceof MongooseError.ValidationError) {
    next(new BadRequestError(validationMessage));
    return;
  }

  if (isDuplicateKeyError(error)) {
    next(new ConflictError(DUPLICATE_TITLE_MESSAGE));
    return;
  }

  next(error);
};

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await publishImage(req.body.image.fileName);
    const product = await Product.create(req.body);
    return res.json(product);
  } catch (error) {
    return handleWriteError(error, next, VALIDATION_MESSAGE);
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId } = req.params;
    const existing = await Product.findById(productId);

    if (!existing) {
      return next(new NotFoundError(NOT_FOUND_MESSAGE));
    }

    const nextFileName = req.body.image?.fileName as string | undefined;

    if (nextFileName) {
      await publishImage(nextFileName);
    }

    const product = await Product.findByIdAndUpdate(productId, req.body, {
      new: true,
      runValidators: true,
    });

    if (nextFileName && nextFileName !== existing.image.fileName) {
      await removeImage(existing.image.fileName);
    }

    return res.json(product);
  } catch (error) {
    return handleWriteError(error, next, UPDATE_VALIDATION_MESSAGE);
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.productId);

    if (!product) {
      return next(new NotFoundError(NOT_FOUND_MESSAGE));
    }

    return res.json(product);
  } catch (error) {
    if (error instanceof MongooseError.CastError) {
      return next(new BadRequestError(INVALID_ID_MESSAGE));
    }

    return next(error);
  }
};
