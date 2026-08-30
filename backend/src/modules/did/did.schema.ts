import { z } from 'zod';

export const createDIDSchema = z.object({
  userId: z.string().optional(),
  email: z.string().email('Invalid email address').optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  name: z.string().optional(),
  role: z.string().optional().default('User'),
  department: z.string().optional().default('Engineering'),
  employeeId: z.string().optional(),
  did: z.string().optional(),
  walletAddress: z.string().optional(),
  publicKey: z.string().optional(),
  documentJson: z.any().optional(),
});

export const challengeSchema = z.object({
  did: z.string().optional(),
  email: z.string().optional(),
  identifier: z.string().optional(),
  password: z.string().optional(),
});

export const authenticateSchema = z.object({
  nonce: z.string().min(1, 'Nonce is required'),
  signature: z.string().min(1, 'Signature is required'),
  did: z.string().optional(),
});

export const verifyDIDSchema = z.object({
  did: z.string().min(1, 'DID is required'),
});

export const revokeDIDSchema = z.object({
  did: z.string().min(1, 'DID is required'),
  reason: z.string().optional(),
});
