import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { jwtConfig } from '../config/jwt.js';
import logger from '../utils/logger.js';

export const signup = async (req, res, next) => {
  try {
    const { email, password } = req.validatedBody;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password_hash,
    });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn },
    );

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
      },
      token,
    });

    logger.info(`User signup: ${email}`);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.validatedBody;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    await user.update({ last_login: new Date() });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn },
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
      },
      token,
    });

    logger.info(`User login: ${email}`);
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_login: user.last_login,
      },
    });
  } catch (error) {
    next(error);
  }
};
