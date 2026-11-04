import { Router } from 'express';

import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from '../controllers/product';
import {
  validateProduct,
  validateProductId,
  validateProductUpdate,
} from '../middlewares/validation';

const router = Router();

router.get('/', getProducts);
router.post('/', validateProduct, createProduct);
router.patch('/:productId', validateProductUpdate, updateProduct);
router.delete('/:productId', validateProductId, deleteProduct);

export default router;
