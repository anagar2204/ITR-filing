import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';
import { query, run, get } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  fullName: Joi.string().min(2).required(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{9,14}$/).optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      throw new AppError(error.details[0].message, 400);
    }

    const { email, password, fullName, phone } = value;

    // Check if user exists
    const existing = get('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      throw new AppError('Email already registered', 400);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const userId = uuidv4();
    run(
      'INSERT INTO users (id, email, password_hash, full_name, phone) VALUES (?, ?, ?, ?, ?)',
      [userId, email, passwordHash, fullName, phone || null]
    );

    logger.info(`User registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: { userId, email, fullName }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      throw new AppError(error.details[0].message, 400);
    }

    const { email, password } = value;

    // Get user
    const user: any = get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );

    logger.info(`User logged in: ${email}`);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user: any = get(
      'SELECT id, email, full_name, phone, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    next(error);
  }
};
