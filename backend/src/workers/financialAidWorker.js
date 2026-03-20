import { Worker } from 'bullmq';
import redis from '../config/redis.js';
import { fillFinancialAidForm } from '../services/aiAgent/formFiller.js';
import logger from '../utils/logger.js';

// Create a worker for processing financial aid estimation jobs
export const createFinancialAidWorker = () => {
  const worker = new Worker(
    'financial-aid-estimation',
    async job => {
      const { userId, collegeId, collegeName, financialAidUrl, profile } = job.data;

      try {
        logger.info(`Processing FA estimation: ${collegeName} for user ${userId}`);

        job.updateProgress(10);

        if (!financialAidUrl) {
          throw new Error(`No financial aid URL found for ${collegeName}. Manual form filling not supported yet.`);
        }

        // Call the form filler service
        const result = await fillFinancialAidForm(financialAidUrl, profile);

        if (!result.success) {
          throw new Error(result.error || 'Form filling failed');
        }

        job.updateProgress(90);

        logger.info(`FA estimation completed for ${collegeName}: ${JSON.stringify(result.results)}`);

        return {
          success: true,
          results: result.results,
          formFieldsFilled: result.formFieldsFilled,
          url: result.url,
        };
      } catch (error) {
        logger.error(`FA estimation failed for ${collegeName}:`, error);
        throw error;
      }
    },
    {
      connection: redis,
      concurrency: 1, // Process one at a time to avoid browser conflicts
    }
  );

  worker.on('completed', job => {
    logger.info(`Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`Job ${job.id} failed:`, err.message);
  });

  return worker;
};

export default createFinancialAidWorker;
