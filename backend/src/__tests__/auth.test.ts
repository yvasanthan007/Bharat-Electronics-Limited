import request from 'supertest';
import app from '../../app';

describe('Auth Endpoints', () => {
  it('POST /api/v1/auth/login with bad credentials → 400', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@test.com', password: 'wrongpass' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/auth/refresh-token without token → 400', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh-token')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
