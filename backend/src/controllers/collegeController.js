import { College, FinancialAidResult, Profile, ScrapingJob, UserCollege } from '../models/index.js';
import logger from '../utils/logger.js';
import { Queue } from 'bullmq';
import redis from '../config/redis.js';
import { Op } from 'sequelize';
import { searchCollegesAI } from '../services/aiAgent/collegeFinder.js';

// Initialize BullMQ queue
const estimationQueue = new Queue('financial-aid-estimation', {
  connection: redis,
});

// Sample college data with known calculators
const KNOWN_COLLEGES = [
  {
    name: 'Stanford University',
    url: 'https://www.stanford.edu',
    financial_aid_url: 'https://admission.stanford.edu/admit/scea-rd/',
    state: 'CA',
    type: 'Private',
  },
  {
    name: 'MIT',
    url: 'https://web.mit.edu',
    financial_aid_url: 'https://web.mit.edu/admissions/',
    state: 'MA',
    type: 'Private',
  },
  {
    name: 'UC Berkeley',
    url: 'https://www.berkeley.edu',
    financial_aid_url: 'https://financialaid.berkeley.edu/',
    state: 'CA',
    type: 'Public',
  },
];

export const searchColleges = async (req, res, next) => {
  try {
    const { query, state, type, page = 1, limit = 10, useAI } = req.query;
    const shouldUseAI = String(useAI).toLowerCase() === 'true';

    // Always search database first
    const where = {};
    if (query) where.name = { [Op.iLike]: `%${query}%` };
    if (state) where.state = state;
    if (type) where.type = type;

    const offset = (page - 1) * limit;

    const { count, rows } = await College.findAndCountAll({
      where,
      offset,
      limit: parseInt(limit),
      order: [['name', 'ASC']],
    });

    // If AI search is explicitly requested, try AI first
    if (shouldUseAI && query) {
      try {
        logger.info(`AI-first college search requested for "${query}"`);
        const aiResults = await searchCollegesAI(query, parseInt(limit));

        if (aiResults.length > 0) {
          return res.json({
            colleges: aiResults,
            total: aiResults.length,
            page: 1,
            limit: parseInt(limit),
            pages: 1,
            source: 'ai-search',
            message: `Found ${aiResults.length} colleges via AI search.`,
          });
        }
      } catch (error) {
        logger.warn('AI-first college search failed, falling back to database:', error.message);
      }
    }

    // If results found in database, return them
    if (count > 0) {
      logger.info(`College search: query=${query}, results=${count}`);
      return res.json({
        colleges: rows,
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit),
        source: 'database',
      });
    }

    // No DB results — automatically try AI search
    if (query) {
      try {
        logger.info(`No DB results for "${query}", falling back to AI search`);
        const aiResults = await searchCollegesAI(query, parseInt(limit));
        return res.json({
          colleges: aiResults,
          total: aiResults.length,
          page: 1,
          limit: parseInt(limit),
          pages: 1,
          source: 'ai-search',
          message: `Found ${aiResults.length} colleges via AI search.`,
        });
      } catch (error) {
        logger.warn('AI college search failed:', error.message);
      }
    }

    // Nothing found anywhere
    res.json({
      colleges: [],
      total: 0,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: 0,
      source: 'database',
    });

    logger.info(`College search: query=${query}, results=0`);
  } catch (error) {
    next(error);
  }
};

export const getCollege = async (req, res, next) => {
  try {
    const college = await College.findByPk(req.params.id);

    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }

    res.json({ college });
  } catch (error) {
    next(error);
  }
};

export const estimateFinancialAid = async (req, res, next) => {
  try {
    const { collegeName } = req.body;
    const userId = req.user.id;

    if (!collegeName) {
      return res.status(400).json({ message: 'College name is required' });
    }

    // Get user profile
    const profile = await Profile.findOne({ where: { user_id: userId } });
    if (!profile) {
      return res.status(404).json({ message: 'User profile not found. Please complete your profile first.' });
    }

    // Find or create college
    let college = await College.findOne({
      where: { name: collegeName },
    });

    if (!college) {
      // Check if it's a known college
      const knownCollege = KNOWN_COLLEGES.find(
        c => c.name.toLowerCase() === collegeName.toLowerCase()
      );

      if (knownCollege) {
        college = await College.create(knownCollege);
      } else {
        // For unknown colleges, create a placeholder
        college = await College.create({
          name: collegeName,
          url: `https://${collegeName.toLowerCase().replace(/\s+/g, '')}.edu`,
          state: 'Unknown',
          type: 'Unknown',
        });
      }
    }

    // Create estimation job
    const job = await estimationQueue.add(
      'estimate-aid',
      {
        userId,
        collegeId: college.id,
        collegeName: college.name,
        financialAidUrl: college.financial_aid_url,
        profile: profile.toJSON(),
      },
      {
        attempts: 2,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: false,
      }
    );

    res.status(201).json({
      jobId: job.id,
      status: 'processing',
      message: 'Financial aid estimation in progress',
    });

    logger.info(`FA estimation job created: ${job.id} for ${collegeName}`);
  } catch (error) {
    next(error);
  }
};

export const getEstimationStatus = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    // Get job from queue
    const job = await estimationQueue.getJob(jobId);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check job state
    const state = await job.getState();
    const progress = job._progress || 0;
    const data = job.data;
    const result = job.returnvalue;

    // If job is completed, return results
    if (state === 'completed') {
      // Check if we already saved the results
      let financialAidResult = await FinancialAidResult.findOne({
        where: { user_id: userId, college_id: data.collegeId },
      });

      if (!financialAidResult && result) {
        // Save results to database
        financialAidResult = await FinancialAidResult.create({
          user_id: userId,
          college_id: data.collegeId,
          estimated_grant_aid: result.results?.grant_aid,
          estimated_loan_amount: result.results?.loan_amount,
          estimated_work_study: result.results?.work_study,
          total_cost_of_attendance: result.results?.total_cost,
          net_price: result.results?.net_price,
          result_data: result.results,
          form_filled_at: new Date(),
        });
      }

      return res.json({
        status: 'completed',
        result: result?.results || null,
        message: 'Financial aid estimation complete',
      });
    }

    if (state === 'failed') {
      const reason = job.failedReason || 'Unknown error';
      return res.json({
        status: 'failed',
        error: reason,
        message: 'Financial aid estimation failed',
      });
    }

    // Job is still processing
    res.json({
      status: state,
      progress: Math.round(progress * 100) / 100,
      message: `Estimating financial aid (${progress}% complete)`,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserEstimates = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const estimates = await FinancialAidResult.findAll({
      where: { user_id: userId },
      include: [{ model: College, attributes: ['name', 'state', 'type'] }],
      order: [['created_at', 'DESC']],
    });

    res.json({ estimates });
  } catch (error) {
    next(error);
  }
};

export const createCollege = async (req, res, next) => {
  try {
    const { name, url, financial_aid_url, state, type } = req.body;

    if (!name || !state) {
      return res.status(400).json({ message: 'Name and state are required' });
    }

    // Check if college already exists
    const existing = await College.findOne({ where: { name } });
    if (existing) {
      return res.status(409).json({ message: 'College already exists' });
    }

    const college = await College.create({
      name,
      url: url || `https://${name.toLowerCase().replace(/\s+/g, '')}.edu`,
      financial_aid_url: financial_aid_url || null,
      state,
      type: type || 'Unknown',
    });

    res.status(201).json({
      message: 'College created successfully',
      college,
    });

    logger.info(`College created: ${name}`);
  } catch (error) {
    next(error);
  }
};

export const getUserColleges = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const userColleges = await UserCollege.findAll({
      where: { user_id: userId },
      include: [
        {
          model: College,
          attributes: ['id', 'name', 'state', 'type', 'url', 'financial_aid_url'],
        },
      ],
      order: [['added_at', 'DESC']],
    });

    res.json({ colleges: userColleges });
  } catch (error) {
    next(error);
  }
};

export const addCollegeToList = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { collegeId } = req.params;
    const { notes } = req.body;

    // Check if college exists
    const college = await College.findByPk(collegeId);
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }

    // Check if already in list
    const existing = await UserCollege.findOne({
      where: { user_id: userId, college_id: collegeId },
    });

    if (existing) {
      return res.status(409).json({ message: 'College already in your list' });
    }

    // Add to list
    const userCollege = await UserCollege.create({
      user_id: userId,
      college_id: collegeId,
      notes: notes || null,
      application_status: 'prospect',
    });

    res.status(201).json({
      message: 'College added to your list',
      college: userCollege,
    });

    logger.info(`College ${collegeId} added to user ${userId} list`);
  } catch (error) {
    next(error);
  }
};

export const removeCollegeFromList = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { collegeId } = req.params;

    const userCollege = await UserCollege.findOne({
      where: { user_id: userId, college_id: collegeId },
    });

    if (!userCollege) {
      return res.status(404).json({ message: 'College not found in your list' });
    }

    await userCollege.destroy();

    res.json({ message: 'College removed from your list' });

    logger.info(`College ${collegeId} removed from user ${userId} list`);
  } catch (error) {
    next(error);
  }
};

export const updateCollegeStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { collegeId } = req.params;
    const { application_status, notes } = req.body;

    const userCollege = await UserCollege.findOne({
      where: { user_id: userId, college_id: collegeId },
    });

    if (!userCollege) {
      return res.status(404).json({ message: 'College not found in your list' });
    }

    if (application_status) {
      userCollege.application_status = application_status;
    }
    if (notes !== undefined) {
      userCollege.notes = notes;
    }

    await userCollege.save();

    res.json({
      message: 'College updated',
      college: userCollege,
    });

    logger.info(`College ${collegeId} for user ${userId} updated`);
  } catch (error) {
    next(error);
  }
};
