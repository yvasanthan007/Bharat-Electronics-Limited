import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../../config/environment';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  did?: string | null;
}

export class CryptoUtil {
  public static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  }

  public static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  public static generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.accessExpiration as any,
    });
  }

  public static generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiration as any,
    });
  }

  public static verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, config.jwt.secret) as TokenPayload;
  }

  public static verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
  }

  public static generateSha256Hash(data: string | object): string {
    const content = typeof data === 'string' ? data : JSON.stringify(data);
    return '0x' + crypto.createHash('sha256').update(content).digest('hex');
  }

  public static generateRandomToken(bytes = 32): string {
    return crypto.randomBytes(bytes).toString('hex');
  }
}
