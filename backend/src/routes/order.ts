import { Router } from 'express';

import createOrder from '../controllers/order';
import { validateOrder } from '../middlewares/validation';

const router = Router();

router.post('/', validateOrder, createOrder);

export default router;
