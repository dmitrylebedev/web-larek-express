import { faker } from '@faker-js/faker';
import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';

import BadRequestError from '../errors/bad-request-error';
import Product from '../models/product';

interface IOrderBody {
  total: number;
  items: string[];
}

const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { total, items } = req.body as IOrderBody;
    const products = await Product.find({
      _id: { $in: items.map((id) => new mongoose.Types.ObjectId(id)) },
    });
    const productsById = new Map(
      products.map((product) => [product._id.toString(), product]),
    );

    let sum = 0;

    for (let index = 0; index < items.length; index += 1) {
      const id = items[index].toLowerCase();
      const product = productsById.get(id);

      if (!product) {
        return next(new BadRequestError(`Товар с id ${id} не найден`));
      }

      if (product.price === null) {
        return next(new BadRequestError(`Товар с id ${id} не продается`));
      }

      sum += product.price;
    }

    if (sum !== total) {
      return next(new BadRequestError('Неверная сумма заказа'));
    }

    return res.json({
      id: faker.string.uuid(),
      total,
    });
  } catch (error) {
    return next(error);
  }
};

export default createOrder;
