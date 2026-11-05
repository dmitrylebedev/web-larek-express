import { celebrate, Joi, Segments } from 'celebrate';

const productSchema = Joi.object().keys({
  title: Joi.string().min(2).max(30).required(),
  image: Joi.object().keys({
    fileName: Joi.string().required(),
    originalName: Joi.string().required(),
  }).required(),
  category: Joi.string().required(),
  description: Joi.string(),
  price: Joi.number().allow(null),
});

const orderSchema = Joi.object().keys({
  payment: Joi.string().valid('card', 'online').required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  address: Joi.string().required(),
  total: Joi.number().required(),
  items: Joi.array().items(Joi.string().hex().length(24)).min(1).required(),
});

export const validateProduct = celebrate({
  [Segments.BODY]: productSchema,
});

export const validateOrder = celebrate({
  [Segments.BODY]: orderSchema,
});
