# 🐎 خيّال — Khayal

Egypt's official digital platform for horse auctions, racing, and betting.

---

## What is Khayal?

Khayal digitizes Egypt's horse industry end-to-end:

- **Live Auctions** — real-time bidding with escrow, anti-sniping, and transparent history
- **Parimutuel Betting** — pool-based race betting with live odds and instant payouts
- **National Horse Registry** — every horse gets a digital ID (`EG-2024-00421`) with full lineage, ownership, and medical history
- **Government Dashboard** — real-time oversight, fraud detection, immutable audit logs, and financial reports for regulators
- **Egyptian Payments** — Paymob, Vodafone Cash, Fawry, InstaPay, bank transfer

---

## Monorepo Structure

```
khayal/
├── app/                   # React Native screens (Expo Router)
│   ├── (tabs)/            # Bottom tabs: home, races, auctions, bets, profile
│   ├── auction/[id].tsx   # Live bidding screen
│   ├── race/[id].tsx      # Race detail + live odds
│   ├── bet/[raceId].tsx   # Place a bet
│   ├── race/live/[id].tsx # Live race tracker
│   ├── horse/[id].tsx     # Horse registry profile
│   ├── auth/              # Login, register, OTP, KYC
│   ├── wallet.tsx         # Deposit / withdraw
│   ├── search.tsx         # Global search
│   └── notifications.tsx
│
├── backend/               # Fastify REST API (Node.js + TypeScript)
│   └── src/
│       ├── routes/        # auth, auctions, races, bets, wallet, horses
│       ├── services/      # otp, sms, parimutuel, escrow
│       ├── plugins/       # jwt, redis
│       └── db/            # pg Pool + query helpers
│
├── constants/             # Shared constants
│   ├── theme.ts           # Design tokens (colors, typography)
│   └── betting.ts         # Parimutuel formulas + mock race data
│
└── db/
    └── schema.sql         # Full PostgreSQL schema (24 tables)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile | React Native 0.81 + Expo SDK 54 |
| Routing | Expo Router v6 (file-based) |
| Language | TypeScript (throughout) |
| Font | Cairo — Arabic Google Font |
| Backend | Node.js + Fastify v4 |
| Database | PostgreSQL 16 |
| Cache / OTP | Redis (ioredis) |
| Auth | JWT access tokens (24h) + refresh tokens (30d) |
| Real-time | Socket.io *(coming)* |
| SMS / OTP | Akedly — [akedly.io](https://akedly.io/) |
| Payments | Paymob, Vodafone Cash, Fawry, InstaPay |
| Admin ERP | Next.js *(planned — Phase 2)* |

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Redis 7+

### 1. Mobile App

```bash
npm install
npx expo start --port 8082
```

Scan the QR code with **Expo Go** on your phone.

### 2. Backend API

```bash
cd backend
cp .env.example .env     # fill in your values
npm install
npm run dev              # starts on http://localhost:3000
```

### 3. Database

```bash
psql -U postgres -d khayal -f db/schema.sql
```

---

## Environment Variables

Copy `backend/.env.example` → `backend/.env` and fill in:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET` | At least 32 characters — keep private |
| `BCRYPT_ROUNDS` | Password hashing cost (default: 10) |
| `AKEDLY_API_KEY` | SMS OTP — get from app.akedly.io dashboard |
| `AKEDLY_SENDER` | Sender name displayed on SMS (e.g. `Khayal`) |

---

## API Reference

Base URL: `http://localhost:3000/api/v1`

### Auth

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Create account, send OTP to phone |
| `POST` | `/auth/send-otp` | Resend OTP |
| `POST` | `/auth/verify-otp` | Verify OTP → activate account + issue tokens |
| `POST` | `/auth/login` | Phone + password → access + refresh tokens |
| `POST` | `/auth/refresh-token` | Get new access token |
| `POST` | `/auth/logout` | Revoke refresh token |

> More routes in progress: `/wallet`, `/auctions`, `/races`, `/bets`, `/horses`

---

## Database

24 tables across 6 domains — full schema in [`db/schema.sql`](db/schema.sql)

| Domain | Tables |
|---|---|
| Users & Auth | `users`, `user_passwords`, `otp_codes`, `refresh_tokens`, `user_devices` |
| KYC | `kyc_submissions` |
| Horses | `horses`, `horse_ownership_history`, `horse_race_stats`, `horse_health_records`, `horse_documents` |
| Wallet | `wallets`, `transactions`, `payment_intents` |
| Auctions | `auctions`, `auction_bids`, `auction_settlements` |
| Races & Bets | `races`, `race_entries`, `race_officials`, `bets` |
| Profiles | `stable_profiles`, `jockey_profiles` |
| System | `notifications`, `audit_logs`, `fraud_alerts`, `platform_config` |

---

## Betting Engine

Khayal uses **Parimutuel** — the same pool-based system used by racetracks worldwide:

```
Commission:  15% of total pool (platform revenue)
Net pool:    85% split among winners proportionally

Odds   = (totalPool × 0.85 − horseBets) / horseBets
Payout = (betAmount / horseBets) × (totalPool × 0.85)
```

---

## Commission Structure

| Transaction | Fee |
|---|---|
| Auction sale | 3% of final price (from seller) |
| Auction listing | 500 EGP flat fee |
| Premium listing | 2,000 EGP |
| Race betting | 15% of pool |
| Horse registration | 1,000 EGP one-time |
| Annual renewal | 200 EGP / year |

---

## Roadmap

- [x] Mobile app — 20 screens
- [x] PostgreSQL schema — 24 tables
- [x] Auth API — register / OTP / login / refresh / logout
- [ ] Wallet API + Paymob integration
- [ ] Auctions API + Socket.io real-time
- [ ] Races + Betting API
- [ ] Horse registry API
- [ ] KYC document verification
- [ ] Push notifications (FCM)
- [ ] Government ERP dashboard (Next.js)
- [ ] iOS + Android store release

---

## License

Private — all rights reserved.
