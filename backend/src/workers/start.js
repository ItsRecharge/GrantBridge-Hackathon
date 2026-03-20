import dotenv from 'dotenv';
dotenv.config();

import createFinancialAidWorker from './financialAidWorker.js';
import { createScraperWorker } from './scraperWorker.js';
import sequelize from '../config/database.js';
import { ScrapingJob, Scholarship, Tag } from '../models/index.js';
import { scrapeScholarships } from '../services/scraper/scholarshipScraper.js';
import { extractTagsBatch } from '../services/scraper/tagExtractor.js';
import logger from '../utils/logger.js';

const categorizeTag = (tagName) => {
  const lowerName = tagName.toLowerCase();
  if (lowerName.includes('stem') || lowerName.includes('engineering') || lowerName.includes('business') || lowerName.includes('science') || lowerName.includes('technology') || lowerName.includes('computer') || lowerName.includes('math')) {
    return 'academic';
  }
  if (lowerName.includes('women') || lowerName.includes('minority') || lowerName.includes('first-gen') || lowerName.includes('first generation') || lowerName.includes('disability') || lowerName.includes('veteran') || lowerName.includes('lgbtq') || lowerName.includes('native')) {
    return 'demographic';
  }
  if (lowerName.includes('california') || lowerName.includes('new york') || lowerName.includes('texas') || lowerName.match(/^[a-z]{2}$/)) {
    return 'location';
  }
  return 'interest';
};

const startWorker = async () => {
  try {
    logger.info('Starting workers...');

    // Start financial aid worker
    const financialAidWorker = createFinancialAidWorker();
    logger.info('✓ Financial aid worker started');

    // Start scraper worker
    const scraperWorker = createScraperWorker();
    logger.info('✓ Scholarship scraper worker started');

    logger.info('✓ All workers listening for jobs');

    // Auto-trigger scraping on startup
    logger.info('Starting automatic scholarship scraping...');
    try {
      // Clear old scholarships and tags
      logger.info('Clearing old scholarships and tags...');
      await sequelize.query('DELETE FROM scholarship_tags;');
      await sequelize.query('DELETE FROM scholarships;');
      await sequelize.query('DELETE FROM tags;');
      logger.info('Database cleared');

      const existingJob = await ScrapingJob.findOne({
        where: { status: 'processing' },
      });

      if (existingJob) {
        logger.info(`Scraping already in progress (Job ID: ${existingJob.id})`);
      } else {
        // Create a new scraping job
        const job = await ScrapingJob.create({
          job_type: 'scholarship-scraping',
          status: 'processing',
          result_count: 0,
          started_at: new Date(),
        });

        logger.info(`✓ Starting scholarship scrape (Job ID: ${job.id})`);

        // Perform scraping directly
        const transaction = await sequelize.transaction();

        try {
          logger.info('Scraping scholarships...');
          const scholarships = await scrapeScholarships(100);
          logger.info(`Scraped ${scholarships.length} scholarships`);

          logger.info('Extracting tags...');
          const scholarshipsWithTags = await extractTagsBatch(scholarships);
          logger.info('Tags extracted');

          logger.info('Saving to database...');

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

          // Update job status to completed
          await job.update(
            {
              status: 'completed',
              result_count: scholarshipsWithTags.length,
              completed_at: new Date(),
            },
            { transaction }
          );

          await transaction.commit();

          logger.info(`✓ Scraping completed! Saved ${scholarshipsWithTags.length} scholarships`);
        } catch (error) {
          await transaction.rollback();
          logger.error('Scraping error:', error.message);

          // Update job with error
          await job.update({
            status: 'failed',
            error_message: error.message,
            completed_at: new Date(),
          });
        }
      }
    } catch (error) {
      logger.warn('Could not auto-trigger scraping:', error.message);
    }

    // Handle graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, shutting down workers...');
      await financialAidWorker.close();
      await scraperWorker.close();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      logger.info('SIGINT received, shutting down workers...');
      await financialAidWorker.close();
      await scraperWorker.close();
      process.exit(0);
    });
  } catch (error) {
    logger.error('Failed to start worker:', error);
    process.exit(1);
  }
};

startWorker();
