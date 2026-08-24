import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('Authentication API Module', () => {
  it('POST /api/v1/auth/login should authenticate valid admin credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'rahul.verma@bel.co.in',
        password: 'Admin@123',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tokens.accessToken).toBeDefined();
    expect(res.body.data.user.role).toBe('Administrator');
  });

  it('POST /api/v1/auth/login should reject invalid credentials with 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'rahul.verma@bel.co.in',
        password: 'WrongPassword!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/auth/register should validate schema and create new user', async () => {
    const randomEmail = `test.eng.${Date.now()}@bel.co.in`;
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: randomEmail,
        password: 'SecurePassword123!',
        firstName: 'Ankit',
        lastName: 'Patel',
        role: 'Engineer',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(randomEmail);
  });
});
