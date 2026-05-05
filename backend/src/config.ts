import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string({ required_error: 'DATABASE_URL is required' }),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  BCRYPT_ROUNDS: z.coerce.number().default(10),
  AKEDLY_API_URL: z.string().default('https://api.akedly.io/v1/sms/send'),
  AKEDLY_API_KEY: z.string().default(''),
  AKEDLY_SENDER:  z.string().default('Khayal'),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export default parsed.data;
