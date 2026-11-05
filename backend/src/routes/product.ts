import { Router } from 'express';

import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from '../controllers/product';
import auth from '../middlewares/auth';
import {
  validateProduct,
  validateProductId,
  validateProductUpdate,
} from '../middlewares/validation';

const router = Router();

router.get('/', getProducts);
router.post('/', auth, validateProduct, createProduct);
router.patch('/:productId', auth, validateProductUpdate, updateProduct);
router.delete('/:productId', auth, validateProductId, deleteProduct);

export default router;
