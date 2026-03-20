import express from 'express';
import * as profileController from '../controllers/profileController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest, profileSchema } from '../utils/validators.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', profileController.getProfile);
router.post('/', validateRequest(profileSchema.create), profileController.createProfile);
router.put('/', validateRequest(profileSchema.update), profileController.updateProfile);

export default router;
