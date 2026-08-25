import { Request, Response, NextFunction } from 'express';
import { didService } from './did.service';
import { successResponse, errorResponse } from '../../utils/response';
import { prisma } from '../../database';

export class DIDController {
  /**
   * POST /auth/did/challenge
   * Initiates login: checks username/password, retrieves user DID, generates single-use challenge
   */
  async requestChallenge(req: Request, res: Response, _next: NextFunction) {
    try {
      const { email, username, password } = req.body;
      const userIdentifier = email || username;

      if (!userIdentifier || !password) {
        return res.status(400).json(errorResponse('Email/username and password are required'));
      }

      const result = await didService.generateLoginChallenge(userIdentifier, password);
      res.json(successResponse(result, 'DID challenge generated successfully'));
    } catch (error: any) {
      return res.status(400).json(errorResponse(error.message || 'Failed to generate DID challenge'));
    }
  }

  /**
   * POST /auth/did/verify
   * Completes login: verifies cryptographic signature from user's wallet against user's DID
   */
  async verifyChallenge(req: Request, res: Response, _next: NextFunction) {
    try {
      const { nonce, signature, email } = req.body;

      if (!nonce || !signature) {
        return res.status(400).json(errorResponse('Nonce and cryptographic signature are required'));
      }

      const result = await didService.verifyLoginChallenge(nonce, signature, email);
      res.json(successResponse(result, 'DID verified successfully. Session created.'));
    } catch (error: any) {
      return res.status(401).json(errorResponse(error.message || 'DID verification failed'));
    }
  }

  /**
   * POST /admin/users/:userId/did
   * Admin-only: provisions a new unique DID for an existing user account
   */
  async provisionDID(req: Request, res: Response, _next: NextFunction) {
    try {
      const userId = String(req.params.userId);
      const { customDID, publicKey, walletAddress } = req.body;
      const adminUser = (req as any).user;

      const result = await didService.provisionUserDID({
        userId,
        adminUserId: adminUser?.userId || 'admin',
        adminEmail: adminUser?.email || 'admin@bel.com',
        customDID,
        publicKey,
        walletAddress,
      });

      res.status(201).json(successResponse(result, 'DID provisioned and linked to user successfully'));
    } catch (error: any) {
      return res.status(400).json(errorResponse(error.message || 'Failed to provision DID'));
    }
  }

  /**
   * GET /admin/users/:userId/did
   * Retrieves DID info for a user (without private keys)
   */
  async getUserDID(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = String(req.params.userId);
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          did: true,
          didPublicKey: true,
          didStatus: true,
          didCreatedAt: true,
          didCreatedBy: true,
          role: { select: { name: true } },
        },
      });

      if (!user) {
        return res.status(404).json(errorResponse('User not found'));
      }

      res.json(successResponse(user));
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * POST /admin/users/:userId/did/deactivate
   * Admin-only: deactivates or revokes a user's DID
   */
  async deactivateDID(req: Request, res: Response, _next: NextFunction) {
    try {
      const userId = String(req.params.userId);
      const adminUser = (req as any).user;

      const result = await didService.deactivateUserDID(
        userId,
        adminUser?.userId || 'admin',
        adminUser?.email || 'admin@bel.com'
      );

      res.json(successResponse(result, 'DID deactivated successfully'));
    } catch (error: any) {
      return res.status(400).json(errorResponse(error.message || 'Failed to deactivate DID'));
    }
  }
}
