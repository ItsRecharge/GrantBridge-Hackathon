import express from 'express';
import * as authController from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest, authSchema } from '../utils/validators.js';

const router = express.Router();

router.post('/signup', validateRequest(authSchema.signup), authController.signup);
router.post('/login', validateRequest(authSchema.login), authController.login);
router.get('/me', authenticateToken, authController.getMe);

export default router;
