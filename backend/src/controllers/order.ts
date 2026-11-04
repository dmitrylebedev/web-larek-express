import { faker } from '@faker-js/faker';
import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import validator from 'validator';

import BadRequestError from '../errors/bad-request-error';
import Product from '../models/product';

const VALIDATION_MESSAGE = 'Ошибка валидации данных при создании заказа';

const isNonEmptyString = (value: unknown): value is string => (
  typeof value === 'string' && value.trim().length > 0
);

const isObjectId = (value: string) => /^[a-f\d]{24}$/i.test(value);

const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      payment,
      email,
      phone,
      address,
      total,
      items,
    } = req.body;

    const hasValidPayment = payment === 'card' || payment === 'online';
    const hasValidEmail = isNonEmptyString(email) && validator.isEmail(email);
    const hasValidContacts = isNonEmptyString(phone) && isNonEmptyString(address);
    const hasValidTotal = typeof total === 'number' && Number.isFinite(total);
    const hasValidItems = Array.isArray(items)
      && items.length > 0
      && items.every((item) => typeof item === 'string');

    const isValidRequest = hasValidPayment
      && hasValidEmail
      && hasValidContacts
      && hasValidTotal
      && hasValidItems;

    if (!isValidRequest) {
      return next(new BadRequestError(VALIDATION_MESSAGE));
    }

    const productIds = items as string[];
    const unknownId = productIds.find((id) => !isObjectId(id));

    if (unknownId) {
      return next(new BadRequestError(`Товар с id ${unknownId} не найден`));
    }

    const products = await Product.find({
      _id: { $in: productIds.map((id) => new mongoose.Types.ObjectId(id)) },
    });
    const productsById = new Map(
      products.map((product) => [product._id.toString(), product]),
    );

    let sum = 0;

    for (let index = 0; index < productIds.length; index += 1) {
      const id = productIds[index].toLowerCase();
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
