import crypto from 'crypto';
import { redis } from '../plugins/redis';

const OTP_TTL_SECONDS = 300; // 5 minutes
const MAX_ATTEMPTS = 3;

interface OtpRecord {
  hash: string;
  attempts: number;
}

function redisKey(phone: string): string {
  return `otp:${phone}`;
}

function hashCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

export async function createOtp(phone: string): Promise<string> {
  const code = String(crypto.randomInt(100_000, 999_999));
  const record: OtpRecord = { hash: hashCode(code), attempts: 0 };
  await redis.setex(redisKey(phone), OTP_TTL_SECONDS, JSON.stringify(record));
  return code;
}

export type OtpResult = 'ok' | 'invalid' | 'expired' | 'max_attempts';

export async function verifyOtp(phone: string, code: string): Promise<OtpResult> {
  const raw = await redis.get(redisKey(phone));
  if (!raw) return 'expired';

  const record: OtpRecord = JSON.parse(raw);

  if (record.attempts >= MAX_ATTEMPTS) {
    await redis.del(redisKey(phone));
    return 'max_attempts';
  }

  if (hashCode(code) !== record.hash) {
    record.attempts += 1;
    const ttl = await redis.ttl(redisKey(phone));
    await redis.setex(redisKey(phone), Math.max(ttl, 1), JSON.stringify(record));
    return 'invalid';
  }

  await redis.del(redisKey(phone));
  return 'ok';
}
