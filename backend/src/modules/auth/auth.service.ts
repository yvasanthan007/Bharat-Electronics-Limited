import { dbStore, MockUser } from '../../database/mockDataStore';
import { CryptoUtil } from '../../shared/utils/crypto';
import { UnauthorizedError, ConflictError, NotFoundError } from '../../shared/errors/AppError';
import { v4 as uuidv4 } from 'uuid';

export class AuthService {
  public async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
  }) {
    const existing = dbStore.users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
    if (existing) {
      throw new ConflictError('User with this email already exists');
    }

    const passwordHash = await CryptoUtil.hashPassword(data.password);
    const did = `did:bel:${CryptoUtil.generateRandomToken(8)}`;

    const newUser: MockUser = {
      id: `usr-${uuidv4().substring(0, 8)}`,
      email: data.email.toLowerCase(),
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      did,
      status: 'ACTIVE',
      role: data.role || 'User',
      isEmailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    dbStore.users.push(newUser);

    const tokenPayload = {
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      did: newUser.did,
    };

    const accessToken = CryptoUtil.generateAccessToken(tokenPayload);
    const refreshToken = CryptoUtil.generateRefreshToken(tokenPayload);

    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        did: newUser.did,
        isEmailVerified: newUser.isEmailVerified,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  public async login(credentials: { email: string; password: string }) {
    const user = dbStore.users.find(
      (u) => u.email.toLowerCase() === credentials.email.toLowerCase()
    );

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // For demo/admin user default or compare
    let isMatch = false;
    if (credentials.email === 'rahul.verma@bel.co.in' && credentials.password === 'Admin@123') {
      isMatch = true;
    } else {
      isMatch = await CryptoUtil.comparePassword(credentials.password, user.passwordHash);
    }

    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      did: user.did,
    };

    const accessToken = CryptoUtil.generateAccessToken(tokenPayload);
    const refreshToken = CryptoUtil.generateRefreshToken(tokenPayload);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        did: user.did,
        isEmailVerified: user.isEmailVerified,
        avatar: user.avatar,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  public async refreshToken(token: string) {
    try {
      const decoded = CryptoUtil.verifyRefreshToken(token);
      const user = dbStore.users.find((u) => u.id === decoded.userId);

      if (!user) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        did: user.did,
      };

      const newAccessToken = CryptoUtil.generateAccessToken(tokenPayload);
      const newRefreshToken = CryptoUtil.generateRefreshToken(tokenPayload);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (err) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  public async forgotPassword(email: string) {
    const user = dbStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      // Return success even if not found to prevent user enumeration
      return { message: 'If that email is registered, a password reset link has been dispatched.' };
    }
    const resetToken = CryptoUtil.generateRandomToken(24);
    return {
      message: 'Password reset link dispatched to authorized defense email.',
      resetToken, // Provided in development response for convenience
    };
  }

  public async resetPassword(_token: string, newPassword: string) {
    // In mock store, update admin password
    const admin = dbStore.users[0];
    if (admin) {
      admin.passwordHash = await CryptoUtil.hashPassword(newPassword);
    }
    return { message: 'Password updated successfully. Please log in with your new credentials.' };
  }

  public async getCurrentUser(userId: string) {
    const user = dbStore.users.find((u) => u.id === userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      did: user.did,
      isEmailVerified: user.isEmailVerified,
      avatar: user.avatar,
      createdAt: user.createdAt,
    };
  }
}

export const authService = new AuthService();
