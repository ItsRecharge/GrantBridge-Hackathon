import { Scholarship, Tag, UserScholarshipSwipe } from '../models/index.js';
import { Op } from 'sequelize';
import logger from '../utils/logger.js';

export const getScholarshipFeed = async (req, res, next) => {
  try {
    const { tags, minAmount, maxAmount, deadlineAfter, page = 1, limit = 20 } = req.query;
    const userId = req.user.id;

    // Build where clause
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

    // Get all scholarships (we'll filter out swiped ones after)
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

    // Get user's swiped scholarship IDs
    const swipedScholarships = await UserScholarshipSwipe.findAll({
      where: { user_id: userId },
      attributes: ['scholarship_id'],
    });
    const swipedIds = swipedScholarships.map(s => s.scholarship_id);

    // Filter out swiped scholarships
    const unswipedScholarships = rows.filter(s => !swipedIds.includes(s.id));

    res.json({
      scholarships: unswipedScholarships,
      total: count,
      unswipedCount: unswipedScholarships.length,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(count / limit),
    });

    logger.info(`Scholarship feed requested: tags=${tags}, unswipedCount=${unswipedScholarships.length}`);
  } catch (error) {
    next(error);
  }
};

export const swipeScholarship = async (req, res, next) => {
  try {
    const { scholarshipId } = req.body;
    const { swipe_direction } = req.body;
    const userId = req.user.id;

    if (!scholarshipId || !swipe_direction) {
      return res.status(400).json({ message: 'scholarshipId and swipe_direction are required' });
    }

    if (!['like', 'dislike'].includes(swipe_direction)) {
      return res.status(400).json({ message: 'swipe_direction must be "like" or "dislike"' });
    }

    // Check if scholarship exists
    const scholarship = await Scholarship.findByPk(scholarshipId);
    if (!scholarship) {
      return res.status(404).json({ message: 'Scholarship not found' });
    }

    // Check if already swiped
    const existing = await UserScholarshipSwipe.findOne({
      where: { user_id: userId, scholarship_id: scholarshipId },
    });

    if (existing) {
      return res.status(409).json({ message: 'You have already swiped this scholarship' });
    }

    // Create swipe record
    const swipe = await UserScholarshipSwipe.create({
      user_id: userId,
      scholarship_id: scholarshipId,
      swipe_direction,
    });

    res.status(201).json({
      message: 'Swipe recorded',
      swipe,
    });

    logger.info(`Scholarship ${scholarshipId} swiped ${swipe_direction} by user ${userId}`);
  } catch (error) {
    next(error);
  }
};

export const getLikedScholarships = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const likedScholarships = await UserScholarshipSwipe.findAll({
      where: { user_id: userId, swipe_direction: 'like' },
      include: [
        {
          model: Scholarship,
          attributes: [
            'id',
            'title',
            'description',
            'amount',
            'amount_text',
            'deadline',
            'url',
            'provider',
            'eligibility_criteria',
          ],
          include: [{ model: Tag, through: { attributes: [] } }],
        },
      ],
      order: [['swiped_at', 'DESC']],
    });

    // Format response
    const scholarships = likedScholarships.map(s => ({
      ...s.Scholarship.dataValues,
      swiped_at: s.swiped_at,
    }));

    res.json({
      scholarships,
      total: scholarships.length,
    });

    logger.info(`Liked scholarships retrieved for user ${userId}: ${scholarships.length} found`);
  } catch (error) {
    next(error);
  }
};

export const undoSwipe = async (req, res, next) => {
  try {
    const { scholarshipId } = req.params;
    const userId = req.user.id;

    const swipe = await UserScholarshipSwipe.findOne({
      where: { user_id: userId, scholarship_id: scholarshipId },
    });

    if (!swipe) {
      return res.status(404).json({ message: 'Swipe not found' });
    }

    await swipe.destroy();

    res.json({ message: 'Swipe undone - you can swipe this scholarship again' });

    logger.info(`Swipe undone for scholarship ${scholarshipId} by user ${userId}`);
  } catch (error) {
    next(error);
  }
};

export const updateSwipe = async (req, res, next) => {
  try {
    const { scholarshipId } = req.params;
    const { swipe_direction } = req.body;
    const userId = req.user.id;

    if (!swipe_direction || !['like', 'dislike'].includes(swipe_direction)) {
      return res.status(400).json({ message: 'swipe_direction must be "like" or "dislike"' });
    }

    const swipe = await UserScholarshipSwipe.findOne({
      where: { user_id: userId, scholarship_id: scholarshipId },
    });

    if (!swipe) {
      return res.status(404).json({ message: 'Swipe not found' });
    }

    swipe.swipe_direction = swipe_direction;
    await swipe.save();

    res.json({
      message: 'Swipe updated',
      swipe,
    });

    logger.info(`Swipe updated for scholarship ${scholarshipId} by user ${userId} to ${swipe_direction}`);
  } catch (error) {
    next(error);
  }
};

export const resetDislikes = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Delete all dislike swipes for this user
    const result = await UserScholarshipSwipe.destroy({
      where: { user_id: userId, swipe_direction: 'dislike' },
    });

    res.json({
      message: `Reset ${result} passed scholarships. You can now swipe them again!`,
      resetCount: result,
    });

    logger.info(`Reset ${result} disliked scholarships for user ${userId}`);
  } catch (error) {
    next(error);
  }
};
