import { College } from '../models/index.js';
import { scrapeCollegeBoard } from '../services/collegeScraper.js';
import logger from '../utils/logger.js';

/**
 * Check if colleges are cached and return cache status
 */
export const getCacheStatus = async (req, res, next) => {
  try {
    const cacheCount = await College.count({
      where: { source: 'collegeboard' }
    });

    const lastScraped = await College.findOne({
      where: { source: 'collegeboard' },
      order: [['scraped_at', 'DESC']],
      attributes: ['scraped_at']
    });

    res.json({
      cached: cacheCount > 0,
      count: cacheCount,
      lastScraped: lastScraped?.scraped_at || null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Scrape and cache colleges from College Board
 */
export const scrapeAndCacheColleges = async (req, res, next) => {
  try {
    logger.info('Starting College Board scraping...');

    // Check if we already have cached colleges (less than 24 hours old)
    const lastScraped = await College.findOne({
      where: { source: 'collegeboard' },
      order: [['scraped_at', 'DESC']],
    });

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    if (lastScraped && lastScraped.scraped_at > oneDayAgo) {
      const count = await College.count({ where: { source: 'collegeboard' } });
      return res.json({
        message: 'Colleges already cached and up to date',
        cached: true,
        count,
        lastScraped: lastScraped.scraped_at,
      });
    }

    // Scrape fresh colleges
    const scrapedColleges = await scrapeCollegeBoard();
    logger.info(`Scraped ${scrapedColleges.length} colleges from College Board`);

    // Clear old cached colleges
    await College.destroy({
      where: { source: 'collegeboard' }
    });
    logger.info('Cleared old cached colleges');

    // Insert new colleges
    let inserted = 0;
    for (const collegeData of scrapedColleges) {
      try {
        await College.create({
          name: collegeData.name,
          url: collegeData.website,
          state: collegeData.state,
          type: collegeData.college_type,
          source: 'collegeboard',
          scraped_at: new Date(),
        });
        inserted++;
      } catch (error) {
        // Skip duplicates
        if (error.name !== 'SequelizeUniqueConstraintError') {
          logger.warn(`Failed to insert college ${collegeData.name}:`, error.message);
        }
      }
    }

    logger.info(`Cached ${inserted} colleges from College Board`);

    res.json({
      message: `Successfully cached ${inserted} colleges from College Board`,
      inserted,
      total: inserted,
    });
  } catch (error) {
    logger.error('College scraping error:', error);
    next(error);
  }
};

/**
 * Ensure colleges are cached on startup
 */
export const ensureCollegesAreCached = async () => {
  try {
    const count = await College.count();

    if (count === 0) {
      logger.info('No colleges found, adding default colleges...');
      const defaultColleges = [
        { name: 'Harvard University', url: 'https://www.harvard.edu', state: 'MA', type: 'Private' },
        { name: 'Stanford University', url: 'https://www.stanford.edu', state: 'CA', type: 'Private' },
        { name: 'MIT', url: 'https://www.mit.edu', state: 'MA', type: 'Private' },
        { name: 'Yale University', url: 'https://www.yale.edu', state: 'CT', type: 'Private' },
        { name: 'University of California, Berkeley', url: 'https://www.berkeley.edu', state: 'CA', type: 'Public' },
        { name: 'University of Michigan', url: 'https://www.umich.edu', state: 'MI', type: 'Public' },
      ];

      for (const collegeData of defaultColleges) {
        try {
          await College.create({
            name: collegeData.name,
            url: collegeData.url,
            state: collegeData.state,
            type: collegeData.type,
          });
        } catch (error) {
          logger.warn(`Skipped ${collegeData.name}:`, error.message);
        }
      }

      logger.info(`Added ${defaultColleges.length} default colleges on startup`);
    } else {
      logger.info(`Colleges already cached (${count} found)`);
    }
  } catch (error) {
    logger.warn('Failed to cache colleges on startup:', error.message);
  }
};
