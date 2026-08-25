import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('Digital Assets & Transactions API', () => {
  it('GET /api/v1/assets should return list of tokenized assets', async () => {
    const res = await request(app).get('/api/v1/assets');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('GET /api/v1/assets/holdings should return holdings summary', async () => {
    const res = await request(app).get('/api/v1/assets/holdings');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalPortfolioValue).toBeGreaterThan(0);
  });

  it('GET /api/v1/transactions should return transaction ledger with pagination', async () => {
    const res = await request(app).get('/api/v1/transactions?page=1&limit=5');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.meta.page).toBe(1);
    expect(res.body.meta.limit).toBe(5);
  });

  it('GET /api/v1/dashboard/summary should return executive KPI metrics', async () => {
    const res = await request(app).get('/api/v1/dashboard/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.kpi).toBeDefined();
    expect(res.body.data.systemHealth).toBeDefined();
  });
});
