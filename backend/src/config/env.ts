import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.string().default('4000'),
  DATABASE_URL: z.string(),
  REDIS_URL: z.string(),
  JWT_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
});

const envParseResult = envSchema.safeParse(process.env);

if (!envParseResult.success) {
  console.error('❌ Invalid environmental variables:', envParseResult.error.format());
  process.exit(1);
}

export const env = envParseResult.data;
