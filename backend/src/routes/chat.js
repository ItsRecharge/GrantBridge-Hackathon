import express from 'express';
import { streamScholarshipChat } from '../controllers/chatController.js';

const router = express.Router();

router.post('/scholarship/stream', streamScholarshipChat);

export default router;
