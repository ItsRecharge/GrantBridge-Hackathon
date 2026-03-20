import { Scholarship, Tag, ScrapingJob } from '../models/index.js';
import { scrapeScholarships } from '../services/scraper/scholarshipScraper.js';
import { extractTagsBatch } from '../services/scraper/tagExtractor.js';
import { Queue } from 'bullmq';
import redis from '../config/redis.js';
import logger from '../utils/logger.js';
import { Op } from 'sequelize';

// Initialize BullMQ queue
const scraperQueue = new Queue('scholarship-scraper', {
  connection: redis,
});

export const startScrapingJob = async (req, res, next) => {
  try {
    // Check if scraping is already in progress
    const activeJob = await ScrapingJob.findOne({
      where: { status: 'processing' },
    });

    if (activeJob) {
      return res.status(409).json({
        message: 'Scraping job already in progress',
        jobId: activeJob.id,
      });
    }

    // Create a scraping job entry
    const job = await ScrapingJob.create({
      job_type: 'scholarship-scraping',
      status: 'pending',
      result_count: 0,
    });

    // Add to queue
    const queueJob = await scraperQueue.add(
      'scrape-scholarships',
      {
        jobId: job.id,
        maxScholarships: 100,
      },
      {
        attempts: 1,
        removeOnComplete: false,
      }
    );

    res.status(201).json({
      jobId: job.id,
      queueJobId: queueJob.id,
      status: 'pending',
      message: 'Scholarship scraping job started',
    });

    logger.info(`Scraping job started: ${job.id}`);
  } catch (error) {
    next(error);
  }
};

export const getScrapingStatus = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const job = await ScrapingJob.findByPk(jobId);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json({
      jobId: job.id,
      status: job.status,
      resultCount: job.result_count,
      errorMessage: job.error_message,
      startedAt: job.started_at,
      completedAt: job.completed_at,
    });
  } catch (error) {
    next(error);
  }
};

export const getScholarships = async (req, res, next) => {
  try {
    const { tags, minAmount, maxAmount, deadlineAfter, page = 1, limit = 20 } = req.query;

    const where = { is_active: true };

    // Filter by amount
    if (minAmount) {
      where.amount = { [Op.gte]: parseInt(minAmount) };
    }
    if (maxAmount) {
      where.amount = {
        ...(where.amount || {}),
        [Op.lte]: parseInt(maxAmount),
      };
    }

    // Filter by deadline
    if (deadlineAfter) {
      where.deadline = { [Op.gte]: new Date(deadlineAfter) };
    }

    const offset = (page - 1) * limit;

    let query = {
      where,
      offset,
      limit: parseInt(limit),
      order: [['deadline', 'ASC']],
    };

    // Include tags if filtering
    if (tags) {
      const tagNames = Array.isArray(tags) ? tags : [tags];
      query.include = [
        {
          model: Tag,
          where: { name: { [Op.in]: tagNames } },
          through: { attributes: [] },
        },
      ];
    } else {
      query.include = [{ model: Tag, through: { attributes: [] } }];
    }

    const { count, rows } = await Scholarship.findAndCountAll(query);

    res.json({
      scholarships: rows,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(count / limit),
    });

    logger.info(`Scholarship search: tags=${tags}, results=${count}`);
  } catch (error) {
    next(error);
  }
};

export const getScholarship = async (req, res, next) => {
  try {
    const scholarship = await Scholarship.findByPk(req.params.id, {
      include: [Tag],
    });

    if (!scholarship) {
      return res.status(404).json({ message: 'Scholarship not found' });
    }

    res.json({ scholarship });
  } catch (error) {
    next(error);
  }
};

export const getAllTags = async (req, res, next) => {
  try {
    const tags = await Tag.findAll({
      attributes: ['id', 'name', 'category'],
      order: [['category', 'ASC'], ['name', 'ASC']],
    });

    // Group by category
    const grouped = tags.reduce((acc, tag) => {
      if (!acc[tag.category]) acc[tag.category] = [];
      acc[tag.category].push(tag);
      return acc;
    }, {});

    res.json({ tags: grouped, total: tags.length });
  } catch (error) {
    next(error);
  }
};

export const saveScholarship = async (req, res, next) => {
  try {
    const { scholarshipId } = req.params;
    const userId = req.user.id;

    // For now, just return success
    // In a full implementation, you'd have a UserSavedScholarships table

    res.json({ message: 'Scholarship saved successfully' });
  } catch (error) {
    next(error);
  }
};
