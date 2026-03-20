import { Profile } from '../models/index.js';
import logger from '../utils/logger.js';

export const getProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({
      where: { user_id: req.user.id },
    });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json({ profile });
  } catch (error) {
    next(error);
  }
};

export const createProfile = async (req, res, next) => {
  try {
    const existingProfile = await Profile.findOne({
      where: { user_id: req.user.id },
    });

    if (existingProfile) {
      return res.status(409).json({ message: 'Profile already exists' });
    }

    const profile = await Profile.create({
      user_id: req.user.id,
      ...req.validatedBody,
      completed: true,
    });

    res.status(201).json({
      message: 'Profile created successfully',
      profile,
    });

    logger.info(`Profile created for user: ${req.user.id}`);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({
      where: { user_id: req.user.id },
    });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    await profile.update({
      ...req.validatedBody,
      updated_at: new Date(),
    });

    res.json({
      message: 'Profile updated successfully',
      profile,
    });

    logger.info(`Profile updated for user: ${req.user.id}`);
  } catch (error) {
    next(error);
  }
};
