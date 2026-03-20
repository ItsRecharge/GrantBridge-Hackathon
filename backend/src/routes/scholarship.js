import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import * as scraperController from '../controllers/scraperController.js';
import * as scholarshipController from '../controllers/scholarshipController.js';

const router = express.Router();

// Public endpoints
router.get('/', scraperController.getScholarships);
router.get('/tags', scraperController.getAllTags);

// Protected endpoints
router.use(authenticateToken);

// Scholarship swipe endpoints
router.get('/feed', scholarshipController.getScholarshipFeed);
router.post('/swipe', scholarshipController.swipeScholarship);
router.get('/liked', scholarshipController.getLikedScholarships);
router.delete('/swipe/:scholarshipId', scholarshipController.undoSwipe);
router.put('/swipe/:scholarshipId', scholarshipController.updateSwipe);
router.put('/reset/dislikes', scholarshipController.resetDislikes);

router.post('/save/:scholarshipId', scraperController.saveScholarship);

// Admin endpoints (should be protected with additional role check in production)
router.post('/admin/scraper/start', scraperController.startScrapingJob);
router.get('/admin/scraper/:jobId', scraperController.getScrapingStatus);

// Public endpoint (should come last to avoid conflicts)
router.get('/:id', scraperController.getScholarship);

export default router;
