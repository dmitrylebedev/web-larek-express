import { Request, Response } from 'express';
import { Error as MongooseError } from 'mongoose';

import Product from '../models/product';

const VALIDATION_MESSAGE = 'Ошибка валидации данных при создании товара';
const DUPLICATE_TITLE_MESSAGE = 'Товар с таким заголовком уже существует';
const SERVER_MESSAGE = 'На сервере произошла ошибка';

const isDuplicateKeyError = (error: unknown) => (
  error instanceof Error && error.message.includes('E11000')
);

export const getProducts = async (_req: Request, res: Response) => {
  try {
    const products = await Product.find({});
    return res.json({
      items: products,
      total: products.length,
    });
  } catch (error) {
    return res.status(500).json({ message: SERVER_MESSAGE });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.create(req.body);
    return res.json(product);
  } catch (error) {
    if (
      error instanceof MongooseError.ValidationError
      || error instanceof MongooseError.CastError
    ) {
      return res.status(400).json({ message: VALIDATION_MESSAGE });
    }

    if (isDuplicateKeyError(error)) {
      return res.status(409).json({ message: DUPLICATE_TITLE_MESSAGE });
    }

    return res.status(500).json({ message: SERVER_MESSAGE });
  }
};
