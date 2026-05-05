import { FastifyRequest, FastifyReply } from 'fastify';

// ── Domain enums ────────────────────────────────────────────────────────────

export type UserRole =
  | 'bidder'
  | 'stable'
  | 'jockey'
  | 'race_admin'
  | 'auction_admin'
  | 'finance_admin'
  | 'government'
  | 'super_admin';

export type KycStatus = 'none' | 'pending' | 'verified' | 'rejected';

export type AuctionStatus = 'draft' | 'live' | 'ended' | 'cancelled';

export type RaceStatus = 'upcoming' | 'live' | 'finished' | 'cancelled';

export type BetStatus = 'active' | 'won' | 'lost' | 'cancelled' | 'refunded';

export type TransactionType =
  | 'deposit'
  | 'withdrawal'
  | 'bid_hold'
  | 'bid_release'
  | 'bid_win'
  | 'bet_place'
  | 'bet_payout'
  | 'commission'
  | 'refund'
  | 'registration_fee';

// ── DB row shapes ────────────────────────────────────────────────────────────

export interface User {
  id: string;
  phone: string;
  email: string | null;
  full_name: string;
  role: UserRole;
  kyc_status: KycStatus;
  is_active: boolean;
  is_banned: boolean;
  ban_reason: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: string; // pg returns NUMERIC as string
  on_hold: string;
  currency: string;
  updated_at: Date;
}

export interface RefreshTokenRow {
  id: string;
  user_id: string;
  token_hash: string;
  device_id: string | null;
  expires_at: Date;
  revoked_at: Date | null;
  created_at: Date;
}

// ── JWT ─────────────────────────────────────────────────────────────────────

export interface JwtPayload {
  sub: string;       // user id
  role: UserRole;
  kyc: KycStatus;
}

// ── Fastify augmentation ─────────────────────────────────────────────────────

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtPayload;
    user: JwtPayload;
  }
}
