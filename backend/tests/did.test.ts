import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { ethers } from 'ethers';

const app = createApp();

describe('DID API Module', () => {
  const unique = () => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  it('POST /api/v1/did/create should create a DID identity', async () => {
    const wallet = ethers.Wallet.createRandom();
    const email = `test.did.create.${unique()}@bel.co.in`;

    const res = await request(app)
      .post('/api/v1/did/create')
      .send({
        name: 'DID Create Test',
        email,
        role: 'User',
        walletAddress: wallet.address,
        publicKey: wallet.publicKey,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.identity.did).toBeDefined();
    expect(res.body.data.identity.walletAddress.toLowerCase()).toBe(wallet.address.toLowerCase());
  });

  it('POST /api/v1/did/challenge should return a challenge for a registered DID', async () => {
    const wallet = ethers.Wallet.createRandom();
    const email = `test.challenge.${unique()}@bel.co.in`;

    await request(app)
      .post('/api/v1/did/create')
      .send({
        name: 'Challenge Test',
        email,
        role: 'User',
        walletAddress: wallet.address,
        publicKey: wallet.publicKey,
      });

    const res = await request(app)
      .post('/api/v1/did/challenge')
      .send({ did: `did:ethr:${wallet.address}` });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.challenge).toBeDefined();
    expect(res.body.data.nonce).toBeDefined();
    expect(res.body.data.did).toBe(`did:ethr:${wallet.address}`);
  });

  it('POST /api/v1/did/authenticate should verify a valid signature and return JWT', async () => {
    const wallet = ethers.Wallet.createRandom();
    const email = `test.auth.${unique()}@bel.co.in`;

    await request(app)
      .post('/api/v1/did/create')
      .send({
        name: 'Auth Test',
        email,
        role: 'User',
        walletAddress: wallet.address,
        publicKey: wallet.publicKey,
      });

    const challengeRes = await request(app)
      .post('/api/v1/did/challenge')
      .send({ did: `did:ethr:${wallet.address}` });

    const { challenge, nonce } = challengeRes.body.data;
    const signature = await wallet.signMessage(challenge);

    const authRes = await request(app)
      .post('/api/v1/did/authenticate')
      .send({ nonce, signature });

    expect(authRes.status).toBe(200);
    expect(authRes.body.success).toBe(true);
    expect(authRes.body.data.token).toBeDefined();
    expect(authRes.body.data.user.did).toBe(`did:ethr:${wallet.address}`);
  });

  it('POST /api/v1/did/authenticate should reject a replayed nonce', async () => {
    const wallet = ethers.Wallet.createRandom();
    const email = `test.replay.${unique()}@bel.co.in`;

    await request(app)
      .post('/api/v1/did/create')
      .send({
        name: 'Replay Test',
        email,
        role: 'User',
        walletAddress: wallet.address,
        publicKey: wallet.publicKey,
      });

    const challengeRes = await request(app)
      .post('/api/v1/did/challenge')
      .send({ did: `did:ethr:${wallet.address}` });

    const { challenge, nonce } = challengeRes.body.data;
    const signature = await wallet.signMessage(challenge);

    const firstAuth = await request(app)
      .post('/api/v1/did/authenticate')
      .send({ nonce, signature });

    expect(firstAuth.status).toBe(200);
    expect(firstAuth.body.success).toBe(true);

    const replayAuth = await request(app)
      .post('/api/v1/did/authenticate')
      .send({ nonce, signature });

    expect(replayAuth.status).toBe(401);
    expect(replayAuth.body.success).toBe(false);
    expect(replayAuth.body.message).toMatch(/already been used|already consumed/i);
  });

  it('POST /api/v1/did/authenticate should reject an invalid signature', async () => {
    const wallet = ethers.Wallet.createRandom();
    const email = `test.invalidsig.${unique()}@bel.co.in`;

    await request(app)
      .post('/api/v1/did/create')
      .send({
        name: 'Invalid Sig Test',
        email,
        role: 'User',
        walletAddress: wallet.address,
        publicKey: wallet.publicKey,
      });

    const challengeRes = await request(app)
      .post('/api/v1/did/challenge')
      .send({ did: `did:ethr:${wallet.address}` });

    const { nonce } = challengeRes.body.data;

    const authRes = await request(app)
      .post('/api/v1/did/authenticate')
      .send({ nonce, signature: '0xinvalid' });

    expect(authRes.status).toBe(401);
    expect(authRes.body.success).toBe(false);
  });
});
