import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { register, login, logout, me } from '../controllers/authController.js';

const credentials = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const router = Router();
router.post('/register', validate(credentials), register);
router.post('/login', validate(credentials), login);
router.post('/logout', logout);
router.get('/me', requireAuth, me);
export default router;