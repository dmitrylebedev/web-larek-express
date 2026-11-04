import { Router } from 'express';

import {
  getCurrentUser,
  login,
  logout,
  refreshAccessToken,
  register,
} from '../controllers/auth';
import { validateLogin, validateRegister } from '../middlewares/validation';

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/token', refreshAccessToken);
router.get('/logout', logout);
router.get('/user', getCurrentUser);

export default router;
