import { Worker } from 'bullmq';
import redis from '../config/redis.js';
import sequelize from '../config/database.js';
import { Scholarship, Tag, ScrapingJob } from '../models/index.js';
import { scrapeScholarships } from '../services/scraper/scholarshipScraper.js';
import { extractTagsBatch } from '../services/scraper/tagExtractor.js';
import logger from '../utils/logger.js';

const formatError = (error) => {
  if (!error) return 'Unknown error';
  if (error.message) return error.message;
  return String(error);
};

// Create a worker for processing scholarship scraping jobs
export const createScraperWorker = () => {
  const worker = new Worker(
    'scholarship-scraper',
    async job => {
      const { jobId, maxScholarships } = job.data;

      const transaction = await sequelize.transaction();

      try {
        logger.info(`Processing scraping job: ${jobId}`);

        // Update job status to processing
        const scrapingJob = await ScrapingJob.findByPk(jobId, { transaction });
        await scrapingJob.update(
          { status: 'processing', started_at: new Date() },
          { transaction }
        );

        job.updateProgress(10);

        // Scrape scholarships
        logger.info('Scraping scholarships...');
        const scholarships = await scrapeScholarships(maxScholarships);
        logger.info(`Scraped ${scholarships.length} scholarships`);

        job.updateProgress(40);

        // Extract tags for scholarships
        logger.info('Extracting tags...');
        const scholarshipsWithTags = await extractTagsBatch(scholarships);
        logger.info('Tags extracted');

        job.updateProgress(70);

        // Save scholarships and tags to database
        logger.info('Saving to database...');
        let savedCount = 0;

        for (const scholarship of scholarshipsWithTags) {
          const { tags = [], eligibility = {}, ...scholarshipData } = scholarship;

          // Check if scholarship already exists by URL
          let dbScholarship = await Scholarship.findOne({
            where: { url: scholarshipData.url },
            transaction,
          });

          if (!dbScholarship) {
            // Create new scholarship
            dbScholarship = await Scholarship.create(
              {
                ...scholarshipData,
                eligibility_criteria: eligibility,
                scraped_at: new Date(),
                is_active: true,
              },
              { transaction }
            );
            savedCount += 1;

            // Get or create tags and associate
            for (const tagName of tags) {
              const [tag] = await Tag.findOrCreate({
                where: { name: tagName },
                defaults: {
                  name: tagName,
                  category: categorizeTag(tagName),
                },
                transaction,
              });

              await dbScholarship.addTag(tag, { transaction });
            }
          }
        }

        job.updateProgress(95);

        // Update job status to completed
        await scrapingJob.update(
          {
            status: 'completed',
            result_count: savedCount,
            completed_at: new Date(),
          },
          { transaction }
        );

        await transaction.commit();

        logger.info(`Scraping job ${jobId} completed. Saved ${savedCount} scholarships`);

        return {
          success: true,
          scholarshipsScraped: savedCount,
        };
      } catch (error) {
        await transaction.rollback();

        logger.error(`Scraping job ${jobId} failed: ${formatError(error)}`);

        // Update job with error
        const scrapingJob = await ScrapingJob.findByPk(jobId);
        if (scrapingJob) {
          await scrapingJob.update({
            status: 'failed',
            error_message: formatError(error),
            completed_at: new Date(),
          });
        }

        throw error;
      }
    },
    {
      connection: redis,
      concurrency: 1,
    }
  );

  worker.on('completed', job => {
    logger.info(`Scraper job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`Scraper job ${job.id} failed: ${formatError(err)}`);
  });

  return worker;
};

/**
 * Categorize a tag based on keywords
 */
function categorizeTag(tagName) {
  const lower = tagName.toLowerCase();

  if (
    lower.includes('stem') ||
    lower.includes('engineering') ||
    lower.includes('science') ||
    lower.includes('technology') ||
    lower.includes('computer') ||
    lower.includes('math')
  ) {
    return 'academic';
  }

  if (
    lower.includes('women') ||
    lower.includes('minority') ||
    lower.includes('first-generation') ||
    lower.includes('first generation') ||
    lower.includes('disability') ||
    lower.includes('veteran') ||
    lower.includes('lgbtq') ||
    lower.includes('native')
  ) {
    return 'demographic';
  }

  if (
    lower.includes('california') ||
    lower.includes('new york') ||
    lower.includes('texas') ||
    lower.match(/^[a-z]{2}$/) // State abbreviations
  ) {
    return 'location';
  }

  return 'interest';
}

export default createScraperWorker;
