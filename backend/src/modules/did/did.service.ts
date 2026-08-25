import crypto from 'crypto';
import { ethers } from 'ethers';
import { prisma } from '../../database';
import { didRegistryContract } from './did-registry.contract';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';

export interface ChallengeSession {
  nonce: string;
  challenge: string;
  userId: string;
  email: string;
  did: string;
  publicKey?: string;
  walletAddress: string;
  issuedAt: number;
  expiresAt: number;
  used: boolean;
}

const CHALLENGE_TTL_MS = 5 * 60 * 1000; // 5 minutes

class DIDService {
  private activeChallenges: Map<string, ChallengeSession> = new Map();

  /**
   * Generates a single-use, expiring challenge for the user's DID
   */
  async generateLoginChallenge(email: string, password: string): Promise<{
    challenge: string;
    nonce: string;
    did: string;
    user: {
      id: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
      role: string;
    };
  }> {
    // 1. Verify user credentials
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const bcrypt = await import('bcrypt');
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      throw new Error('Invalid email or password');
    }

    // 2. Retrieve linked DID
    if (!user.did) {
      throw new Error('No DID is provisioned for this account. Please contact an Administrator.');
    }

    if (user.didStatus !== 'ACTIVE') {
      throw new Error(`Your DID has status: ${user.didStatus}. Access is restricted.`);
    }

    // 3. Generate one-time cryptographic challenge
    const nonce = crypto.randomBytes(32).toString('hex');
    const issuedAt = Date.now();
    const expiresAt = issuedAt + CHALLENGE_TTL_MS;

    // Determine wallet address from DID (e.g. did:ethr:0x123... or did:trustchain:0x123...)
    const rawAddress = user.did.includes('0x')
      ? user.did.substring(user.did.indexOf('0x'))
      : user.did;

    const challenge = [
      'BEL Trust Platform - Secure DID Authentication',
      '',
      'Sign this one-time challenge to verify control of your registered DID key.',
      '',
      `DID: ${user.did}`,
      `User: ${user.email}`,
      `Nonce: ${nonce}`,
      `Timestamp: ${new Date(issuedAt).toISOString()}`,
      `Expires: ${new Date(expiresAt).toISOString()}`,
    ].join('\n');

    this.activeChallenges.set(nonce, {
      nonce,
      challenge,
      userId: user.id,
      email: user.email,
      did: user.did,
      publicKey: user.didPublicKey || undefined,
      walletAddress: rawAddress.toLowerCase(),
      issuedAt,
      expiresAt,
      used: false,
    });

    return {
      challenge,
      nonce,
      did: user.did,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role.name,
      },
    };
  }

  /**
   * Verifies the cryptographic signature of the challenge against the DID's registered public key
   */
  async verifyLoginChallenge(nonce: string, signature: string, email?: string): Promise<{
    token: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
      role: string;
      did: string;
    };
  }> {
    const record = this.activeChallenges.get(nonce);
    if (!record) {
      throw new Error('Challenge not found or already consumed. Please restart login.');
    }

    if (record.used) {
      this.activeChallenges.delete(nonce);
      throw new Error('Challenge has already been used (replay attack prevented).');
    }

    if (Date.now() > record.expiresAt) {
      this.activeChallenges.delete(nonce);
      throw new Error('Challenge expired. Please request a new challenge.');
    }

    // Mark as consumed immediately to prevent replay
    record.used = true;
    this.activeChallenges.delete(nonce);

    // Cryptographic signature recovery
    let recoveredAddress: string;
    try {
      recoveredAddress = ethers.verifyMessage(record.challenge, signature).toLowerCase();
    } catch (err: any) {
      // Record failed verification in audit log
      await this.recordAuditLog(record.userId, 'DID_VERIFICATION_FAILED', {
        did: record.did,
        reason: 'Malformed signature',
        error: err?.message,
      });
      throw new Error('Invalid cryptographic signature.');
    }

    // Verify recovered address matches the registered DID wallet address / public key
    const expectedAddress = record.walletAddress.toLowerCase();
    const isMatched =
      recoveredAddress === expectedAddress ||
      (record.publicKey &&
        ethers.computeAddress(record.publicKey).toLowerCase() === recoveredAddress);

    if (!isMatched) {
      await this.recordAuditLog(record.userId, 'DID_VERIFICATION_FAILED', {
        did: record.did,
        expectedSigner: expectedAddress,
        actualSigner: recoveredAddress,
        reason: 'Signer does not control registered private key',
      });
      throw new Error('DID verification failed: Signature does not match the DID public key registered to this account.');
    }

    // Fetch fresh user data with role
    const user = await prisma.user.findUnique({
      where: { id: record.userId },
      include: { role: true },
    });

    if (!user) {
      throw new Error('User not found.');
    }

    if (user.didStatus !== 'ACTIVE') {
      throw new Error(`DID is not active (${user.didStatus}). Login rejected.`);
    }

    // Record success audit log
    await this.recordAuditLog(user.id, 'DID_VERIFICATION_SUCCESS', {
      did: user.did,
      role: user.role.name,
      verifiedAddress: recoveredAddress,
    });

    // Create session / JWT tokens
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role.name, did: user.did },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as any }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, role: user.role.name },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRES_IN as any }
    );

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role.name,
        did: user.did!,
      },
    };
  }

  /**
   * Provision a DID for an existing user (Admin Only)
   */
  async provisionUserDID(params: {
    userId: string;
    adminUserId: string;
    adminEmail: string;
    customDID?: string;
    publicKey?: string;
    walletAddress?: string;
  }): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      include: { role: true },
    });

    if (!user) {
      throw new Error('Target user not found');
    }

    // Generate DID and Public Key if not provided
    let did = params.customDID;
    let publicKey = params.publicKey;
    let walletAddress = params.walletAddress;

    if (!did || !publicKey || !walletAddress) {
      const generatedWallet = ethers.Wallet.createRandom();
      walletAddress = generatedWallet.address;
      publicKey = generatedWallet.publicKey;
      did = `did:trustchain:${walletAddress}`;
    }

    const now = new Date();

    // 1. Update User in database (NEVER store private key!)
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        did,
        didPublicKey: publicKey,
        didStatus: 'ACTIVE',
        didCreatedAt: now,
        didCreatedBy: params.adminEmail || params.adminUserId,
      },
      include: { role: true },
    });

    // 2. Anchor on DID Registry smart contract
    const onChain = await didRegistryContract.registerDID({
      did,
      publicKey,
      ownerAddress: walletAddress,
      role: user.role.name,
    });

    // 3. Record in Audit Log
    await this.recordAuditLog(params.adminUserId, 'DID_CREATED', {
      targetUserId: user.id,
      targetUserEmail: user.email,
      targetDID: did,
      txHash: onChain.txHash,
      blockNumber: String(onChain.blockNumber),
      createdBy: params.adminEmail,
    });

    return {
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role.name,
        did: updatedUser.did,
        didPublicKey: updatedUser.didPublicKey,
        didStatus: updatedUser.didStatus,
        didCreatedAt: updatedUser.didCreatedAt,
        didCreatedBy: updatedUser.didCreatedBy,
      },
      onChain,
    };
  }

  /**
   * Deactivate a user's DID (Admin Only)
   */
  async deactivateUserDID(userId: string, adminUserId: string, adminEmail: string): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.did) {
      throw new Error('User has no active DID');
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { didStatus: 'DEACTIVATED' },
      include: { role: true },
    });

    // Update on-chain DID status
    let txHash: string | undefined;
    try {
      const result = await didRegistryContract.deactivateDID(user.did);
      txHash = result.txHash;
    } catch {
      /* continue */
    }

    // Record in Audit Log
    await this.recordAuditLog(adminUserId, 'DID_DEACTIVATED', {
      targetUserId: user.id,
      targetUserEmail: user.email,
      targetDID: user.did,
      txHash: txHash || '0x_simulated',
      deactivatedBy: adminEmail,
    });

    return {
      success: true,
      user: {
        id: updated.id,
        email: updated.email,
        did: updated.did,
        didStatus: updated.didStatus,
      },
      txHash,
    };
  }

  private async recordAuditLog(userId: string | null, action: string, details: Record<string, any>) {
    try {
      await prisma.auditLog.create({
        data: {
          userId,
          action,
          details: JSON.stringify(details),
        },
      });
    } catch {
      /* audit logging errors must not throw */
    }
  }
}

export const didService = new DIDService();
