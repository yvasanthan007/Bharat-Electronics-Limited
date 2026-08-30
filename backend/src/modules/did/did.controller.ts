import { Request, Response, NextFunction } from 'express';
import { didService } from './did.service';
import { successResponse, errorResponse } from '../../utils/response';

export class DIDController {
  async createDID(req: Request, res: Response, next: NextFunction) {
    try {
      const actorUserId = (req as any).user?.userId;
      const result = await didService.createDID(actorUserId, req.body);
      res.status(201).json(successResponse(result, 'DID identity created successfully'));
    } catch (error: any) {
      next(error);
    }
  }

  async getMyDID(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json(errorResponse('Unauthorized'));
      }
      const result = await didService.getMyDID(userId);
      if (!result) {
        return res.status(404).json(errorResponse('DID identity not found for current user'));
      }
      res.json(successResponse(result));
    } catch (error: any) {
      next(error);
    }
  }

  async getDID(req: Request, res: Response, next: NextFunction) {
    try {
      const didParam = String(req.params.did || '');
      const result = await didService.resolveDID(didParam);
      if (!result) {
        return res.status(404).json(errorResponse(`DID identity '${didParam}' not found`));
      }
      res.json(successResponse(result));
    } catch (error: any) {
      next(error);
    }
  }

  async challenge(req: Request, res: Response, _next: NextFunction) {
    try {
      const result = await didService.requestChallenge(req.body);
      res.json(successResponse(result, 'Challenge generated successfully'));
    } catch (error: any) {
      res.status(400).json(errorResponse(error.message || 'Failed to generate challenge'));
    }
  }

  async authenticate(req: Request, res: Response, _next: NextFunction) {
    try {
      const result = await didService.authenticate(req.body);
      res.json(successResponse(result, 'DID authenticated successfully'));
    } catch (error: any) {
      res.status(401).json(errorResponse(error.message || 'Authentication failed'));
    }
  }

  async verify(req: Request, res: Response, next: NextFunction) {
    try {
      const did = req.body.did || req.query.did;
      if (!did) {
        return res.status(400).json(errorResponse('DID is required for verification'));
      }
      const result = await didService.verifyDID(String(did));
      res.json(successResponse(result, result.valid ? 'DID verified successfully' : 'DID verification failed'));
    } catch (error: any) {
      next(error);
    }
  }

  async revoke(req: Request, res: Response, next: NextFunction) {
    try {
      const actorUserId = (req as any).user?.userId;
      const { did, reason } = req.body;
      if (!did) {
        return res.status(400).json(errorResponse('DID is required for revocation'));
      }
      const result = await didService.revokeDID(actorUserId, did, reason);
      res.json(successResponse(result, 'DID revoked successfully'));
    } catch (error: any) {
      next(error);
    }
  }

  async getAllDIDs(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await didService.getAllDIDs();
      res.json(successResponse(result));
    } catch (error: any) {
      next(error);
    }
  }
}
