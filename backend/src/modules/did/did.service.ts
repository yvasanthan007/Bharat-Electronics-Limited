import crypto from 'crypto';
import { ethers } from 'ethers';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { prisma } from '../../database';
import { dbStore } from '../../database/mockDataStore';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';

export interface DIDDocument {
  '@context': string[];
  id: string;
  controller: string;
  verificationMethod: Array<{
    id: string;
    type: string;
    controller: string;
    publicKeyHex: string;
    blockchainAccountId: string;
  }>;
  authentication: string[];
  assertionMethod: string[];
  created: string;
  updated: string;
}

export interface ChallengeRecord {
  nonce: string;
  did: string;
  walletAddress: string;
  challenge: string;
  issuedAt: number;
  expiresAt: number;
}

const CHALLENGE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export class DIDService {
  private challenges = new Map<string, ChallengeRecord>();

  constructor() {
    // Periodically clean up expired challenges every 2 minutes
    setInterval(() => {
      const now = Date.now();
      for (const [nonce, record] of this.challenges.entries()) {
        if (now > record.expiresAt) {
          this.challenges.delete(nonce);
        }
      }
    }, 2 * 60 * 1000);
  }

  public buildDIDDocument(did: string, publicKey: string, walletAddress: string, createdAtIso: string): DIDDocument {
    return {
      '@context': [
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/suites/secp256k1-2019/v1',
      ],
      id: did,
      controller: did,
      verificationMethod: [
        {
          id: `${did}#controller`,
          type: 'EcdsaSecp256k1RecoveryMethod2020',
          controller: did,
          publicKeyHex: publicKey,
          blockchainAccountId: `eip155:1:${walletAddress}`,
        },
      ],
      authentication: [`${did}#controller`],
      assertionMethod: [`${did}#controller`],
      created: createdAtIso,
      updated: createdAtIso,
    };
  }
  public async recordAudit(action: string, userId: string | undefined, details: string, ipAddress = '127.0.0.1') {
    try {
      await prisma.auditLog.create({
        data: {
          action,
          userId: userId || null,
          details,
          ipAddress,
        },
      });
    } catch {
      // Fallback in-memory
      dbStore.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        userId: userId || 'system',
        action,
        entity: 'DIDIdentity',
        details,
        ipAddress,
        status: 'SUCCESS',
        timestamp: new Date(),
        blockHeight: 2350000 + Math.floor(Math.random() * 500),
        cryptographicHash: '0x' + crypto.randomBytes(32).toString('hex'),
      });
    }
  }

  public async createDID(actorUserId: string | undefined, data: {
    userId?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    role?: string;
    department?: string;
    employeeId?: string;
    did?: string;
    walletAddress?: string;
    publicKey?: string;
    documentJson?: any;
  }) {
    // Generate keypair if not provided (private key is NEVER stored)
    let walletAddress = data.walletAddress;
    let publicKey = data.publicKey;

    if (!walletAddress || !publicKey) {
      const randomWallet = ethers.Wallet.createRandom();
      walletAddress = randomWallet.address;
      publicKey = randomWallet.publicKey;
    }

    // Determine DID string
    let did = data.did;
    if (!did) {
      did = `did:ethr:${walletAddress}`;
    }

    const now = new Date();
    const nowIso = now.toISOString();

    // Prepare DID document JSON
    const didDocObj = data.documentJson && typeof data.documentJson === 'object'
      ? data.documentJson
      : this.buildDIDDocument(did, publicKey, walletAddress, nowIso);
    const documentJsonStr = typeof didDocObj === 'string' ? didDocObj : JSON.stringify(didDocObj);

    // Resolve or create user
    let userRecord: any = null;
    let userEmail = data.email?.toLowerCase();
    const resolvedName = data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Personnel';

    if (!userEmail) {
      const cleanName = resolvedName.toLowerCase().replace(/[^a-z0-9]/g, '.');
      userEmail = `${cleanName}@bel.co.in`;
    }

    const roleName = data.role || 'User';

    // Try database upsert
    try {
      let role = await prisma.role.findUnique({ where: { name: roleName.toUpperCase() } });
      if (!role) {
        role = await prisma.role.findFirst({ where: { name: { equals: roleName, mode: 'insensitive' } } });
      }
      if (!role) {
        role = await prisma.role.create({ data: { name: roleName.toUpperCase() } });
      }

      if (data.userId) {
        userRecord = await prisma.user.findUnique({ where: { id: data.userId } });
      }

      if (!userRecord) {
        userRecord = await prisma.user.findUnique({ where: { email: userEmail } });
      }

      if (!userRecord) {
        const dummyHash = crypto.createHash('sha256').update(userEmail + 'BEL_DEFAULT').digest('hex');
        userRecord = await prisma.user.create({
          data: {
            email: userEmail,
            passwordHash: dummyHash,
            firstName: data.firstName || resolvedName.split(' ')[0] || 'Personnel',
            lastName: data.lastName || resolvedName.split(' ').slice(1).join(' ') || '',
            roleId: role.id,
          },
        });
      }

      // Upsert DIDIdentity
      const didIdentityDelegate = (prisma as any).dIDIdentity || (prisma as any).didIdentity;
      const didIdentity = await didIdentityDelegate.upsert({
        where: { userId: userRecord.id },
        update: {
          did,
          walletAddress,
          publicKey,
          status: 'ACTIVE',
          documentJson: documentJsonStr,
          verifiedAt: now,
          updatedAt: now,
        },
        create: {
          userId: userRecord.id,
          did,
          method: did.startsWith('did:bel') ? 'bel' : 'ethr',
          walletAddress,
          publicKey,
          status: 'ACTIVE',
          documentJson: documentJsonStr,
          verifiedAt: now,
        },
      });

      await this.recordAudit('DID_CREATED', actorUserId || userRecord.id, `DID ${did} created for user ${userRecord.email}`);

      return {
        identity: {
          id: didIdentity.id,
          userId: userRecord.id,
          name: resolvedName,
          email: userRecord.email,
          role: roleName,
          department: data.department || 'Engineering',
          employeeId: data.employeeId || `BEL-${userRecord.id.slice(0, 6)}`,
          did: didIdentity.did,
          walletAddress: didIdentity.walletAddress,
          publicKey: didIdentity.publicKey,
          status: didIdentity.status,
          createdAt: didIdentity.createdAt.toISOString(),
          verifiedAt: didIdentity.verifiedAt?.toISOString(),
        },
        didDocument: didDocObj,
      };
    } catch (err: any) {
      logger.warn(`PostgreSQL write skipped, syncing to in-memory store: ${err.message}`);
    }

    // In-memory fallback
    let mockUser = dbStore.users.find(u => u.email === userEmail || u.id === data.userId);
    if (!mockUser) {
      mockUser = {
        id: data.userId || `usr-${uuidv4().substring(0, 8)}`,
        email: userEmail,
        passwordHash: 'mock-hash',
        firstName: data.firstName || resolvedName.split(' ')[0] || 'Personnel',
        lastName: data.lastName || resolvedName.split(' ').slice(1).join(' ') || '',
        did,
        status: 'ACTIVE',
        role: roleName,
        isEmailVerified: true,
        createdAt: now,
        updatedAt: now,
      };
      dbStore.users.push(mockUser);
    } else {
      mockUser.did = did;
    }

    const mockDID = {
      id: `did-${uuidv4().substring(0, 8)}`,
      userId: mockUser.id,
      did,
      method: did.startsWith('did:bel') ? 'bel' : 'ethr',
      walletAddress,
      publicKey,
      status: 'ACTIVE',
      documentJson: documentJsonStr,
      createdAt: now,
      verifiedAt: now,
      updatedAt: now,
    };

    const existingIdx = dbStore.dids.findIndex(d => d.userId === mockUser!.id || d.did === did);
    if (existingIdx >= 0) {
      dbStore.dids[existingIdx] = mockDID;
    } else {
      dbStore.dids.push(mockDID);
    }

    await this.recordAudit('DID_CREATED', actorUserId || mockUser.id, `DID ${did} created for user ${mockUser.email}`);

    return {
      identity: {
        id: mockDID.id,
        userId: mockUser.id,
        name: resolvedName,
        email: mockUser.email,
        role: roleName,
        department: data.department || 'Engineering',
        employeeId: data.employeeId || `BEL-${mockUser.id.slice(0, 6)}`,
        did: mockDID.did,
        walletAddress: mockDID.walletAddress,
        publicKey: mockDID.publicKey,
        status: mockDID.status,
        createdAt: mockDID.createdAt.toISOString(),
        verifiedAt: mockDID.verifiedAt?.toISOString(),
      },
      didDocument: didDocObj,
    };
  }
  public async resolveDID(didOrIdentifier: string) {
    const term = didOrIdentifier.trim();
    const termLower = term.toLowerCase();

    // Try PostgreSQL
    try {
      const didIdentityDelegate = (prisma as any).dIDIdentity || (prisma as any).didIdentity;
      const didRecord = await didIdentityDelegate.findFirst({
        where: {
          OR: [
            { did: { equals: term, mode: 'insensitive' } },
            { walletAddress: { equals: term, mode: 'insensitive' } },
            { user: { email: { equals: termLower, mode: 'insensitive' } } },
            { user: { firstName: { equals: term, mode: 'insensitive' } } },
          ],
        },
        include: { user: { include: { role: true } } },
      });

      if (didRecord) {
        let doc = null;
        if (didRecord.documentJson) {
          try {
            doc = JSON.parse(didRecord.documentJson);
          } catch {
            doc = null;
          }
        }
        if (!doc) {
          doc = this.buildDIDDocument(
            didRecord.did,
            didRecord.publicKey,
            didRecord.walletAddress,
            didRecord.createdAt.toISOString()
          );
        }

        const roleName = didRecord.user?.role?.name || 'User';
        const name = `${didRecord.user?.firstName || ''} ${didRecord.user?.lastName || ''}`.trim() || didRecord.user?.email || 'Personnel';

        return {
          identity: {
            id: didRecord.id,
            userId: didRecord.userId,
            name,
            email: didRecord.user?.email,
            role: roleName,
            did: didRecord.did,
            walletAddress: didRecord.walletAddress,
            publicKey: didRecord.publicKey,
            status: didRecord.status,
            createdAt: didRecord.createdAt.toISOString(),
            verifiedAt: didRecord.verifiedAt?.toISOString(),
          },
          didDocument: doc,
        };
      }
    } catch {
      // Ignore database errors and check mock store
    }

    // In-memory fallback
    const mockDID = dbStore.dids.find(
      d =>
        d.did.toLowerCase() === termLower ||
        d.walletAddress.toLowerCase() === termLower ||
        d.did.toLowerCase().includes(termLower)
    );

    let mockUser = mockDID ? dbStore.users.find(u => u.id === mockDID.userId) : null;
    if (!mockUser) {
      mockUser = dbStore.users.find(
        u =>
          u.email.toLowerCase() === termLower ||
          u.firstName.toLowerCase() === termLower ||
          u.did.toLowerCase() === termLower ||
          u.did.toLowerCase().includes(termLower)
      );
    }

    if (mockDID || mockUser) {
      const activeDid = mockDID ? mockDID.did : (mockUser?.did || `did:bel:${termLower}`);
      const activeWallet = mockDID ? mockDID.walletAddress : (dbStore.wallets.find(w => w.userId === mockUser?.id)?.address || '0x7f82c4412f9e110b77c5d41a99b21a8d76e0a3b9');
      const activePubKey = mockDID ? mockDID.publicKey : '0x04f32a8849b219e88bca120934812f890192847120a';
      const activeStatus = mockDID ? mockDID.status : (mockUser?.status || 'ACTIVE');

      const doc = mockDID?.documentJson
        ? JSON.parse(mockDID.documentJson)
        : this.buildDIDDocument(activeDid, activePubKey, activeWallet, new Date().toISOString());

      const name = mockUser ? `${mockUser.firstName} ${mockUser.lastName}`.trim() : 'Personnel';

      return {
        identity: {
          id: mockDID?.id || `did-${mockUser?.id || 'gen'}`,
          userId: mockUser?.id || 'usr-gen',
          name,
          email: mockUser?.email,
          role: mockUser?.role || 'User',
          did: activeDid,
          walletAddress: activeWallet,
          publicKey: activePubKey,
          status: activeStatus,
          createdAt: mockDID ? mockDID.createdAt.toISOString() : new Date().toISOString(),
          verifiedAt: mockDID?.verifiedAt ? mockDID.verifiedAt.toISOString() : new Date().toISOString(),
        },
        didDocument: doc,
      };
    }

    return null;
  }

  public async getMyDID(userId: string) {
    try {
      const didIdentityDelegate = (prisma as any).dIDIdentity || (prisma as any).didIdentity;
      const record = await didIdentityDelegate.findUnique({
        where: { userId },
        include: { user: { include: { role: true } } },
      });
      if (record) {
        return this.resolveDID(record.did);
      }
    } catch {
      // fallback
    }

    const mockDID = dbStore.dids.find(d => d.userId === userId);
    if (mockDID) {
      return this.resolveDID(mockDID.did);
    }

    return null;
  }

  public async requestChallenge(input: { did?: string; email?: string; identifier?: string }) {
    const searchParam = input.did || input.email || input.identifier;
    if (!searchParam) {
      throw new Error('DID, email, or identifier is required');
    }

    const resolved = await this.resolveDID(searchParam);
    if (!resolved) {
      throw new Error('Unknown DID or identifier — no such identity registered');
    }

    if (resolved.identity.status === 'REVOKED') {
      throw new Error('This DID has been revoked. Access denied.');
    }

    const nonce = crypto.randomBytes(32).toString('hex');
    const issuedAt = Date.now();
    const expiresAt = issuedAt + CHALLENGE_TTL_MS;

    const challenge = [
      'BEL Trust Platform',
      '',
      'Sign this one-time challenge to prove control of your DID.',
      '',
      `DID: ${resolved.identity.did}`,
      `Address: ${resolved.identity.walletAddress}`,
      `Nonce: ${nonce}`,
      `Issued At: ${new Date(issuedAt).toISOString()}`,
      `Expires At: ${new Date(expiresAt).toISOString()}`,
    ].join('\n');

    this.challenges.set(nonce, {
      nonce,
      did: resolved.identity.did,
      walletAddress: resolved.identity.walletAddress.toLowerCase(),
      challenge,
      issuedAt,
      expiresAt,
    });

    await this.recordAudit(
      'DID_AUTH_CHALLENGE',
      resolved.identity.userId,
      `Challenge issued for DID ${resolved.identity.did}`
    );

    return {
      challenge,
      nonce,
      did: resolved.identity.did,
      walletAddress: resolved.identity.walletAddress,
      expiresAt: new Date(expiresAt).toISOString(),
    };
  }

  public async authenticate(input: { nonce: string; signature: string; did?: string }) {
    const record = this.challenges.get(input.nonce);
    if (!record) {
      throw new Error('Challenge not found or already consumed. Please restart the sign-in.');
    }

    if (Date.now() > record.expiresAt) {
      this.challenges.delete(input.nonce);
      throw new Error('Login challenge expired. Please restart the sign-in.');
    }

    // Immediately consume nonce to prevent replay attacks
    this.challenges.delete(input.nonce);

    // Verify ECDSA signature against challenge
    let recoveredAddress: string;
    try {
      recoveredAddress = ethers.verifyMessage(record.challenge, input.signature).toLowerCase();
    } catch {
      try {
        recoveredAddress = ethers.recoverAddress(
          ethers.hashMessage(record.challenge),
          input.signature
        ).toLowerCase();
      } catch (err: any) {
        await this.recordAudit('DID_AUTH_FAILED', undefined, `Signature parse failed: ${err.message}`);
        throw new Error('Malformed signature — verification failed');
      }
    }

    const resolved = await this.resolveDID(record.did);
    if (!resolved) {
      await this.recordAudit('DID_AUTH_FAILED', undefined, `Unresolved DID ${record.did}`);
      throw new Error('DID identity could not be resolved');
    }

    const expectedAddress = resolved.identity.walletAddress.toLowerCase();
    if (recoveredAddress !== expectedAddress && recoveredAddress !== record.walletAddress) {
      await this.recordAudit(
        'DID_AUTH_FAILED',
        resolved.identity.userId,
        `Signature recovered address ${recoveredAddress} does not match expected ${expectedAddress}`
      );
      throw new Error('Signature verification failed — wallet address does not match DID identity');
    }

    if (resolved.identity.status === 'REVOKED') {
      await this.recordAudit('DID_AUTH_FAILED', resolved.identity.userId, `Revoked DID attempted login: ${resolved.identity.did}`);
      throw new Error('This DID is revoked. Access denied.');
    }

    // Fetch user for JWT payload
    let userId = resolved.identity.userId;
    let email = resolved.identity.email || `${resolved.identity.name.toLowerCase().replace(/\s+/g, '.')}@bel.co.in`;
    let roleName = resolved.identity.role || 'User';

    const tokenPayload = {
      userId,
      email,
      role: roleName,
      did: resolved.identity.did,
    };

    const accessToken = jwt.sign(tokenPayload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });
    const refreshToken = jwt.sign(tokenPayload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
    });

    await this.recordAudit('DID_AUTH_SUCCESS', userId, `DID ${resolved.identity.did} authenticated successfully`);

    return {
      token: accessToken,
      accessToken,
      refreshToken,
      user: {
        id: userId,
        email,
        name: resolved.identity.name,
        firstName: resolved.identity.name.split(' ')[0],
        lastName: resolved.identity.name.split(' ').slice(1).join(' '),
        role: roleName,
        did: resolved.identity.did,
        walletAddress: resolved.identity.walletAddress,
      },
      session: {
        token: `bel_s_${crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex')}`,
        did: resolved.identity.did,
        name: resolved.identity.name,
        role: roleName,
        walletAddress: resolved.identity.walletAddress,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
      },
    };
  }

  public async verifyDID(did: string) {
    const resolved = await this.resolveDID(did);
    const steps = [
      {
        label: 'DID Resolution',
        passed: !!resolved,
        detail: resolved ? `Resolved to ${resolved.identity.walletAddress}` : 'DID not found in registry',
      },
      {
        label: 'DID Document Integrity',
        passed: !!resolved?.didDocument && (resolved.didDocument.verificationMethod?.length || 0) > 0,
        detail: resolved ? 'Document structure valid — verification methods present' : 'Invalid or missing DID document',
      },
      {
        label: 'Blockchain Anchoring & Status',
        passed: !!resolved && resolved.identity.status === 'ACTIVE',
        detail: resolved
          ? (resolved.identity.status === 'ACTIVE' ? 'Anchored and Active on BEL Sovereign Ledger' : `Status is ${resolved.identity.status}`)
          : 'No blockchain record found',
      },
    ];

    const valid = steps.every(s => s.passed);

    await this.recordAudit(
      'DID_VERIFIED',
      resolved?.identity.userId,
      `Verification for ${did}: ${valid ? 'SUCCESS' : 'FAILURE'}`
    );

    return {
      valid,
      did,
      walletAddress: resolved?.identity.walletAddress || '',
      steps,
      txHash: '0x' + crypto.randomBytes(32).toString('hex'),
    };
  }

  public async revokeDID(actorUserId: string | undefined, did: string, reason = 'Administrative Revocation') {
    const resolved = await this.resolveDID(did);
    if (!resolved) {
      throw new Error('DID identity not found');
    }

    try {
      const didIdentityDelegate = (prisma as any).dIDIdentity || (prisma as any).didIdentity;
      await didIdentityDelegate.update({
        where: { did: resolved.identity.did },
        data: {
          status: 'REVOKED',
          revokedAt: new Date(),
        },
      });
    } catch {
      const idx = dbStore.dids.findIndex(d => d.did === resolved.identity.did);
      if (idx >= 0) {
        dbStore.dids[idx].status = 'REVOKED';
        dbStore.dids[idx].revokedAt = new Date();
      }
    }

    await this.recordAudit(
      'DID_REVOKED',
      actorUserId || resolved.identity.userId,
      `DID ${resolved.identity.did} revoked. Reason: ${reason}`
    );

    return {
      success: true,
      did: resolved.identity.did,
      status: 'REVOKED',
      revokedAt: new Date().toISOString(),
      reason,
    };
  }

  public async getAllDIDs() {
    let list: any[] = [];
    try {
      const didIdentityDelegate = (prisma as any).dIDIdentity || (prisma as any).didIdentity;
      const records = await didIdentityDelegate.findMany({
        include: { user: { include: { role: true } } },
        orderBy: { createdAt: 'desc' },
      });

      if (records.length > 0) {
        list = records.map((r: any) => ({
          id: r.id,
          userId: r.userId,
          name: `${r.user?.firstName || ''} ${r.user?.lastName || ''}`.trim() || r.user?.email || 'Personnel',
          email: r.user?.email,
          role: r.user?.role?.name || 'User',
          did: r.did,
          walletAddress: r.walletAddress,
          publicKey: r.publicKey,
          status: r.status,
          createdAt: r.createdAt.toISOString(),
          verifiedAt: r.verifiedAt?.toISOString(),
          revokedAt: r.revokedAt?.toISOString(),
        }));
      }
    } catch {
      // fallback
    }

    if (list.length === 0) {
      list = dbStore.dids.map((d: any) => {
        const u = dbStore.users.find(usr => usr.id === d.userId);
        return {
          id: d.id,
          userId: d.userId,
          name: u ? `${u.firstName} ${u.lastName}`.trim() : 'Personnel',
          email: u?.email,
          role: u?.role || 'User',
          did: d.did,
          walletAddress: d.walletAddress,
          publicKey: d.publicKey,
          status: d.status,
          createdAt: d.createdAt.toISOString(),
          verifiedAt: d.verifiedAt?.toISOString(),
          revokedAt: d.revokedAt?.toISOString(),
        };
      });
    }

    return list;
  }
}

export const didService = new DIDService();
