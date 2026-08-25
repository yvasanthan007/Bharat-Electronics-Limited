import { Request, Response, NextFunction } from 'express';
import { successResponse, errorResponse } from '../../utils/response';
import { prisma } from '../../database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, firstName, lastName } = req.body;
      const existingUser = await prisma.user.findUnique({ where: { email } });
      
      if (existingUser) {
        return res.status(400).json(errorResponse('Email is already registered'));
      }

      const passwordHash = await bcrypt.hash(password, 10);
      
      // Default to USER role
      let role = await prisma.role.findUnique({ where: { name: 'USER' } });
      if (!role) {
        role = await prisma.role.create({ data: { name: 'USER' } });
      }

      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          firstName,
          lastName,
          roleId: role.id
        }
      });

      res.status(201).json(successResponse({ user: { id: user.id, email: user.email } }, 'Registered successfully'));
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const user = await prisma.user.findUnique({ where: { email } });
      
      if (!user) {
        return res.status(400).json(errorResponse('Invalid email or password'));
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.status(400).json(errorResponse('Invalid email or password'));
      }

      const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as any });
      const refreshToken = jwt.sign({ userId: user.id }, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN as any });

      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      });

      res.json(successResponse({ token, refreshToken }, 'Login successful'));
    } catch (error) {
      next(error);
    }
  }
  
  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json(errorResponse('Refresh token required'));
      }

      const tokenEntry = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
      if (!tokenEntry || tokenEntry.expiresAt < new Date()) {
        return res.status(401).json(errorResponse('Invalid or expired refresh token'));
      }

      const decoded: any = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
      
      const newAccessToken = jwt.sign({ userId: decoded.userId }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as any });
      
      res.json(successResponse({ accessToken: newAccessToken }, 'Token refreshed successfully'));
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) {
        await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
      }
      res.json(successResponse(null, 'Logged out successfully'));
    } catch (error) {
      next(error);
    }
  }
}
