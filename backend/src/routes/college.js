import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import * as collegeController from '../controllers/collegeController.js';
import * as collegeScraperController from '../controllers/collegeScraperController.js';
import * as reportController from '../controllers/reportController.js';

const router = express.Router();

// Public routes
router.get('/', collegeController.searchColleges);

// College scraping endpoints
router.get('/cache/status', collegeScraperController.getCacheStatus);
router.post('/cache/scrape', collegeScraperController.scrapeAndCacheColleges);

// Protected routes (must come before /:id)
router.use(authenticateToken);

// More specific routes first
router.post('/', collegeController.createCollege);
router.post('/estimate', collegeController.estimateFinancialAid);
router.get('/estimate/:jobId', collegeController.getEstimationStatus);
router.get('/user/estimates', collegeController.getUserEstimates);

// User college list endpoints
router.get('/user/list', collegeController.getUserColleges);
router.post('/user/list/:collegeId', collegeController.addCollegeToList);
router.delete('/user/list/:collegeId', collegeController.removeCollegeFromList);
router.put('/user/list/:collegeId', collegeController.updateCollegeStatus);

// Financial aid report endpoints
router.get('/reports/all', reportController.getUserReports);
router.post('/reports/compare', reportController.compareColleges);
router.get('/reports/:reportId', reportController.getFinancialAidReport);
router.delete('/reports/:reportId', reportController.deleteReport);
router.post('/:collegeId/report', reportController.generateFinancialAidReport);

// Generic college endpoint (must come last)
router.get('/:id', collegeController.getCollege);

export default router;
