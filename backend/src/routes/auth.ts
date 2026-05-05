import { FastifyPluginAsync } from 'fastify';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod';
import { query, queryOne, withTransaction } from '../db/pool';
import { createOtp, verifyOtp } from '../services/otp';
import { sendSms } from '../services/sms';
import type { User } from '../types';
import config from '../config';

// ── Validation schemas ───────────────────────────────────────────────────────

const egyptianPhone = z
  .string()
  .regex(/^\+201[0125]\d{8}$/, 'رقم الهاتف يجب أن يكون بالصيغة: +201XXXXXXXXX');

const registerSchema = z.object({
  phone:     egyptianPhone,
  full_name: z.string().min(3, 'الاسم يجب أن يكون 3 حروف على الأقل').max(255),
  password:  z
    .string()
    .min(8, 'كلمة السر يجب أن تكون 8 حروف على الأقل')
    .regex(/[A-Z]/, 'يجب أن تحتوي على حرف كبير واحد على الأقل')
    .regex(/[0-9]/, 'يجب أن تحتوي على رقم واحد على الأقل'),
  role: z.enum(['bidder', 'stable', 'jockey']),
});

const loginSchema = z.object({
  phone:    egyptianPhone,
  password: z.string().min(1),
});

const sendOtpSchema = z.object({
  phone: egyptianPhone,
});

const verifyOtpSchema = z.object({
  phone: egyptianPhone,
  code:  z.string().length(6).regex(/^\d{6}$/, 'الكود يجب أن يكون 6 أرقام'),
});

const refreshSchema = z.object({
  refresh_token: z.string().min(10),
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function generateRefreshToken(): string {
  return crypto.randomBytes(48).toString('hex'); // 96 hex chars
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function publicUser(u: User) {
  return {
    id:         u.id,
    phone:      u.phone,
    full_name:  u.full_name,
    role:       u.role,
    kyc_status: u.kyc_status,
  };
}

// ── Routes ───────────────────────────────────────────────────────────────────

const authRoutes: FastifyPluginAsync = async (fastify) => {

  // POST /auth/register
  fastify.post('/auth/register', async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    }
    const { phone, full_name, password, role } = parsed.data;

    const existing = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE phone = $1',
      [phone]
    );
    if (existing) {
      return reply.code(409).send({ error: 'PHONE_TAKEN', message: 'رقم الهاتف مسجل مسبقاً' });
    }

    const passwordHash = await bcrypt.hash(password, config.BCRYPT_ROUNDS);

    const user = await withTransaction(async (client) => {
      const { rows: [u] } = await client.query<User>(
        `INSERT INTO users (phone, full_name, role, is_active)
         VALUES ($1, $2, $3, false)
         RETURNING id, phone, full_name, role, kyc_status, is_active, created_at`,
        [phone, full_name, role]
      );
      await client.query(
        `INSERT INTO user_passwords (user_id, password_hash) VALUES ($1, $2)`,
        [u.id, passwordHash]
      );
      await client.query(`INSERT INTO wallets (user_id) VALUES ($1)`, [u.id]);
      return u;
    });

    const code = await createOtp(phone);
    await sendSms(phone, `كود التحقق من خيّال: ${code}. صالح لمدة 5 دقائق.`);

    return reply.code(201).send({
      message:  'تم إنشاء الحساب. أدخل كود التحقق المرسل على هاتفك.',
      user_id:  user.id,
    });
  });


  // POST /auth/send-otp
  fastify.post('/auth/send-otp', async (request, reply) => {
    const parsed = sendOtpSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    }
    const { phone } = parsed.data;

    const code = await createOtp(phone);
    await sendSms(phone, `كود التحقق من خيّال: ${code}. صالح لمدة 5 دقائق.`);

    return reply.send({ message: 'تم إرسال كود التحقق.', expires_in: 300 });
  });


  // POST /auth/verify-otp  →  activates account + issues tokens
  fastify.post('/auth/verify-otp', async (request, reply) => {
    const parsed = verifyOtpSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    }
    const { phone, code } = parsed.data;

    const result = await verifyOtp(phone, code);
    if (result === 'expired')      return reply.code(400).send({ error: 'OTP_EXPIRED',      message: 'انتهت صلاحية الكود. اطلب كوداً جديداً.' });
    if (result === 'invalid')      return reply.code(400).send({ error: 'OTP_INVALID',      message: 'الكود غير صحيح.' });
    if (result === 'max_attempts') return reply.code(429).send({ error: 'OTP_MAX_ATTEMPTS', message: 'تجاوزت الحد الأقصى للمحاولات. اطلب كوداً جديداً.' });

    const user = await queryOne<User>(
      `UPDATE users SET is_active = true, updated_at = NOW()
       WHERE phone = $1
       RETURNING id, phone, full_name, role, kyc_status, is_active`,
      [phone]
    );
    if (!user) return reply.code(404).send({ error: 'USER_NOT_FOUND' });

    const accessToken    = fastify.jwt.sign({ sub: user.id, role: user.role, kyc: user.kyc_status }, { expiresIn: '24h' });
    const refreshToken   = generateRefreshToken();
    const refreshHash    = hashToken(refreshToken);

    await query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '30 days')`,
      [user.id, refreshHash]
    );

    return reply.send({
      access_token:  accessToken,
      refresh_token: refreshToken,
      user:          publicUser(user),
    });
  });


  // POST /auth/login
  fastify.post('/auth/login', async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() });
    }
    const { phone, password } = parsed.data;

    const user = await queryOne<User & { password_hash: string }>(
      `SELECT u.id, u.phone, u.full_name, u.role, u.kyc_status,
              u.is_active, u.is_banned, u.ban_reason,
              p.password_hash
       FROM users u
       JOIN user_passwords p ON p.user_id = u.id
       WHERE u.phone = $1`,
      [phone]
    );

    // Use constant-time compare even when user not found to prevent phone enumeration
    const dummyHash = '$2b$10$abcdefghijklmnopqrstuuabcdefghijklmnopqrstuuabcdefghij';
    const passwordMatch = await bcrypt.compare(password, user?.password_hash ?? dummyHash);

    if (!user || !passwordMatch) {
      return reply.code(401).send({ error: 'INVALID_CREDENTIALS', message: 'رقم الهاتف أو كلمة السر غير صحيحة' });
    }
    if (!user.is_active) {
      return reply.code(403).send({ error: 'ACCOUNT_NOT_VERIFIED', message: 'أكمل التحقق من رقم هاتفك أولاً' });
    }
    if (user.is_banned) {
      return reply.code(403).send({ error: 'ACCOUNT_BANNED', message: 'تم إيقاف حسابك', reason: user.ban_reason });
    }

    const accessToken  = fastify.jwt.sign({ sub: user.id, role: user.role, kyc: user.kyc_status }, { expiresIn: '24h' });
    const refreshToken = generateRefreshToken();
    const refreshHash  = hashToken(refreshToken);

    await query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '30 days')`,
      [user.id, refreshHash]
    );

    return reply.send({
      access_token:  accessToken,
      refresh_token: refreshToken,
      user:          publicUser(user),
    });
  });


  // POST /auth/refresh-token
  fastify.post('/auth/refresh-token', async (request, reply) => {
    const parsed = refreshSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'VALIDATION_ERROR' });
    }
    const tokenHash = hashToken(parsed.data.refresh_token);

    const tokenRow = await queryOne<{ user_id: string; expires_at: Date }>(
      `SELECT user_id, expires_at FROM refresh_tokens
       WHERE token_hash = $1 AND revoked_at IS NULL`,
      [tokenHash]
    );
    if (!tokenRow) {
      return reply.code(401).send({ error: 'INVALID_REFRESH_TOKEN' });
    }
    if (new Date() > tokenRow.expires_at) {
      await query(`UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1`, [tokenHash]);
      return reply.code(401).send({ error: 'REFRESH_TOKEN_EXPIRED' });
    }

    const user = await queryOne<User>(
      `SELECT id, role, kyc_status FROM users
       WHERE id = $1 AND is_active = true AND is_banned = false`,
      [tokenRow.user_id]
    );
    if (!user) return reply.code(401).send({ error: 'UNAUTHORIZED' });

    const accessToken = fastify.jwt.sign(
      { sub: user.id, role: user.role, kyc: user.kyc_status },
      { expiresIn: '24h' }
    );

    return reply.send({ access_token: accessToken });
  });


  // POST /auth/logout  (requires auth)
  fastify.post('/auth/logout', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const parsed = refreshSchema.safeParse(request.body);
    if (parsed.success) {
      const tokenHash = hashToken(parsed.data.refresh_token);
      await query(
        `UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1`,
        [tokenHash]
      );
    }
    return reply.send({ message: 'تم تسجيل الخروج بنجاح.' });
  });

};

export default authRoutes;
