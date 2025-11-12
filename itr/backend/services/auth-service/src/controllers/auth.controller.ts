import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';
import { setCache, deleteCache } from '../config/redis';
import { AppError } from '../middlewares/errorHandler';
import { AuthRequest } from '../middlewares/authenticate';
import { logger } from '../utils/logger';

const SALT_ROUNDS = 10;

const generateTokens = (userId: string, email: string, sessionId: string) => {
  const accessToken = jwt.sign({ userId, email, sessionId }, process.env.JWT_SECRET!, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ userId, sessionId }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, fullName, phone } = req.body;

    const existingUser = await query('SELECT user_id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      throw new AppError('Email already registered', 400);
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await query(
      `INSERT INTO users (email, password_hash, full_name, phone, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING user_id, email, full_name, email_verified`,
      [email, passwordHash, fullName, phone || null]
    );

    const user = result.rows[0];

    logger.info('User registered', { userId: user.user_id });

    res.status(201).json({
      success: true,
      data: { userId: user.user_id, email: user.email, fullName: user.full_name, emailVerified: user.email_verified },
      message: 'Registration successful',
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const result = await query(
      'SELECT user_id, email, password_hash, full_name, status FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      throw new AppError('Invalid credentials', 401);
    }

    const user = result.rows[0];

    if (user.status !== 'active') {
      throw new AppError('Account suspended', 403);
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      throw new AppError('Invalid credentials', 401);
    }

    const sessionId = uuidv4();
    const { accessToken, refreshToken } = generateTokens(user.user_id, user.email, sessionId);

    await setCache(`session:${sessionId}`, JSON.stringify({ userId: user.user_id }), 604800);

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        expiresIn: 3600,
        user: { userId: user.user_id, email: user.email, fullName: user.full_name },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization!.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { sessionId: string };
    await deleteCache(`session:${decoded.sessionId}`);

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string; sessionId: string };

    const result = await query('SELECT email FROM users WHERE user_id = $1', [decoded.userId]);
    if (result.rows.length === 0) {
      throw new AppError('Invalid token', 401);
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId, result.rows[0].email, decoded.sessionId);

    res.json({
      success: true,
      data: { accessToken, refreshToken: newRefreshToken, expiresIn: 3600 },
    });
  } catch (error) {
    next(error);
  }
};
