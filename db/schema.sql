-- ============================================================
-- خيّال Platform — PostgreSQL Schema
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM (
  'bidder',       -- regular user
  'stable',       -- horse owner / stable manager
  'jockey',       -- licensed rider
  'race_admin',   -- race official / judge
  'auction_admin',-- auction moderator
  'finance_admin',-- financial reports only
  'government',   -- read-only government observer
  'super_admin'   -- full access
);

CREATE TYPE kyc_status AS ENUM ('none', 'pending', 'verified', 'rejected');

CREATE TYPE auction_status AS ENUM ('draft', 'live', 'ended', 'cancelled');

CREATE TYPE race_status AS ENUM ('upcoming', 'live', 'finished', 'cancelled');

CREATE TYPE bet_status AS ENUM ('active', 'won', 'lost', 'cancelled', 'refunded');

CREATE TYPE transaction_type AS ENUM (
  'deposit',
  'withdrawal',
  'bid_hold',      -- funds frozen when bid placed
  'bid_release',   -- funds released when outbid
  'bid_win',       -- funds transferred to seller after auction
  'bet_place',     -- funds deducted when bet placed
  'bet_payout',    -- winnings credited after race
  'commission',    -- platform fee deducted
  'refund',
  'registration_fee'
);

CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'reversed');

CREATE TYPE horse_sex AS ENUM ('stallion', 'mare', 'gelding', 'colt', 'filly');

CREATE TYPE payment_provider AS ENUM ('paymob', 'fawry', 'vodafone_cash', 'instapay', 'bank_transfer');


-- ============================================================
-- USERS & AUTH
-- ============================================================

CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone           VARCHAR(15)  UNIQUE NOT NULL,  -- +201XXXXXXXXX
  email           VARCHAR(255) UNIQUE,
  full_name       VARCHAR(255) NOT NULL,
  role            user_role    NOT NULL DEFAULT 'bidder',
  kyc_status      kyc_status   NOT NULL DEFAULT 'none',
  is_active       BOOLEAN      NOT NULL DEFAULT true,
  is_banned       BOOLEAN      NOT NULL DEFAULT false,
  ban_reason      TEXT,
  banned_by       UUID         REFERENCES users(id),
  banned_at       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE user_passwords (
  user_id         UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  password_hash   TEXT        NOT NULL,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- OTP codes stored in Redis in production; this table is for audit trail only
CREATE TABLE otp_codes (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  phone       VARCHAR(15) NOT NULL,
  code_hash   TEXT        NOT NULL,  -- hashed, never store plain
  expires_at  TIMESTAMPTZ NOT NULL,
  used        BOOLEAN     NOT NULL DEFAULT false,
  attempts    SMALLINT    NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE refresh_tokens (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT        NOT NULL UNIQUE,
  device_id   TEXT,
  expires_at  TIMESTAMPTZ NOT NULL,
  revoked_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_devices (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id   TEXT        NOT NULL,
  platform    VARCHAR(10),             -- 'ios', 'android'
  push_token  TEXT,                    -- FCM / APNs token
  last_seen   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, device_id)
);


-- ============================================================
-- KYC / IDENTITY VERIFICATION
-- ============================================================

CREATE TABLE kyc_submissions (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status                kyc_status  NOT NULL DEFAULT 'pending',
  national_id_front_url TEXT,
  national_id_back_url  TEXT,
  selfie_url            TEXT,
  extra_document_url    TEXT,       -- business license, stable docs, jockey license
  rejection_reason      TEXT,
  reviewed_by           UUID        REFERENCES users(id),
  reviewed_at           TIMESTAMPTZ,
  submitted_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- HORSES — National Registry
-- ============================================================

CREATE TABLE horses (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  horse_id            VARCHAR(20) UNIQUE NOT NULL,  -- EG-2024-00421
  name_ar             VARCHAR(255) NOT NULL,
  name_en             VARCHAR(255),
  sex                 horse_sex   NOT NULL,
  breed               VARCHAR(255),
  color               VARCHAR(100),
  date_of_birth       DATE,
  country_of_birth    VARCHAR(100) NOT NULL DEFAULT 'Egypt',

  -- Pedigree (self-referencing)
  sire_id             UUID        REFERENCES horses(id),  -- father
  dam_id              UUID        REFERENCES horses(id),  -- mother

  -- Current state
  current_owner_id    UUID        REFERENCES users(id),
  current_stable_id   UUID        REFERENCES users(id),

  -- Approval
  is_active           BOOLEAN     NOT NULL DEFAULT true,
  is_approved         BOOLEAN     NOT NULL DEFAULT false,
  approved_by         UUID        REFERENCES users(id),
  approved_at         TIMESTAMPTZ,
  registration_fee_paid BOOLEAN   NOT NULL DEFAULT false,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sequence for generating horse_id numbers
CREATE SEQUENCE horse_serial_seq START 1;

CREATE TABLE horse_ownership_history (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  horse_id          UUID        NOT NULL REFERENCES horses(id),
  owner_id          UUID        NOT NULL REFERENCES users(id),
  acquired_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  transferred_at    TIMESTAMPTZ,                   -- NULL = current owner
  acquisition_price NUMERIC(12,2),
  transfer_type     VARCHAR(50) NOT NULL,          -- 'auction', 'direct', 'initial', 'inheritance'
  auction_id        UUID,                          -- FK set after auctions table exists
  notes             TEXT
);

CREATE TABLE horse_race_stats (
  horse_id          UUID        PRIMARY KEY REFERENCES horses(id) ON DELETE CASCADE,
  total_races       INT         NOT NULL DEFAULT 0,
  wins              INT         NOT NULL DEFAULT 0,
  places            INT         NOT NULL DEFAULT 0,  -- 2nd or 3rd
  earnings_total    NUMERIC(14,2) NOT NULL DEFAULT 0,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE horse_health_records (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  horse_id      UUID        NOT NULL REFERENCES horses(id),
  record_type   VARCHAR(100) NOT NULL,  -- 'checkup', 'vaccination', 'treatment', 'surgery'
  description   TEXT        NOT NULL,
  vet_name      VARCHAR(255),
  record_date   DATE        NOT NULL,
  document_url  TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE horse_documents (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  horse_id      UUID        NOT NULL REFERENCES horses(id),
  document_type VARCHAR(100) NOT NULL,  -- 'certificate', 'photo', 'dna', 'passport', 'pedigree'
  url           TEXT        NOT NULL,
  uploaded_by   UUID        REFERENCES users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- WALLET & TRANSACTIONS
-- ============================================================

CREATE TABLE wallets (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID          UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  balance     NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  on_hold     NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (on_hold >= 0), -- escrowed
  currency    VARCHAR(3)    NOT NULL DEFAULT 'EGP',
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE transactions (
  id                UUID                NOT NULL DEFAULT gen_random_uuid(),
  wallet_id         UUID                NOT NULL REFERENCES wallets(id),
  type              transaction_type    NOT NULL,
  amount            NUMERIC(14,2)       NOT NULL,  -- positive = credit, negative = debit
  balance_after     NUMERIC(14,2)       NOT NULL,  -- wallet balance snapshot
  on_hold_after     NUMERIC(14,2)       NOT NULL,  -- on_hold snapshot
  status            transaction_status  NOT NULL DEFAULT 'completed',
  reference_type    VARCHAR(50),                   -- 'auction', 'bet', 'payment_intent'
  reference_id      UUID,                          -- polymorphic ID
  description_ar    TEXT,
  payment_intent_id UUID,
  created_at        TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

CREATE TABLE payment_intents (
  id              UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID             NOT NULL REFERENCES users(id),
  wallet_id       UUID             NOT NULL REFERENCES wallets(id),
  amount          NUMERIC(14,2)    NOT NULL,
  currency        VARCHAR(3)       NOT NULL DEFAULT 'EGP',
  direction       VARCHAR(10)      NOT NULL CHECK (direction IN ('deposit', 'withdrawal')),
  provider        payment_provider NOT NULL,
  provider_ref    TEXT,            -- Paymob order ID / Fawry ref / etc
  status          VARCHAR(20)      NOT NULL DEFAULT 'pending',
  webhook_raw     JSONB,           -- raw webhook payload stored for audit
  created_at      TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ
);


-- ============================================================
-- AUCTIONS
-- ============================================================

CREATE TABLE auctions (
  id                UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  horse_id          UUID            NOT NULL REFERENCES horses(id),
  seller_id         UUID            NOT NULL REFERENCES users(id),
  title_ar          TEXT,
  description_ar    TEXT,

  -- Pricing
  start_price       NUMERIC(12,2)   NOT NULL,
  min_increment     NUMERIC(12,2)   NOT NULL DEFAULT 1000,
  current_bid       NUMERIC(12,2),
  current_winner_id UUID            REFERENCES users(id),
  bid_count         INT             NOT NULL DEFAULT 0,

  -- Status & timing
  status            auction_status  NOT NULL DEFAULT 'draft',
  is_premium        BOOLEAN         NOT NULL DEFAULT false,
  starts_at         TIMESTAMPTZ     NOT NULL,
  ends_at           TIMESTAMPTZ     NOT NULL,
  extended_count    SMALLINT        NOT NULL DEFAULT 0,

  -- Fees
  commission_rate   NUMERIC(5,4)    NOT NULL DEFAULT 0.03,
  listing_fee_paid  BOOLEAN         NOT NULL DEFAULT false,
  premium_fee_paid  BOOLEAN         NOT NULL DEFAULT false,

  -- Approval
  approved_by       UUID            REFERENCES users(id),
  approved_at       TIMESTAMPTZ,

  created_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TABLE auction_bids (
  id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id            UUID          NOT NULL REFERENCES auctions(id),
  bidder_id             UUID          NOT NULL REFERENCES users(id),
  amount                NUMERIC(12,2) NOT NULL,
  is_winning            BOOLEAN       NOT NULL DEFAULT false,
  escrow_transaction_id UUID          REFERENCES transactions(id),
  created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);


-- ============================================================
-- RACES & BETTING
-- ============================================================

CREATE TABLE races (
  id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar             VARCHAR(255)  NOT NULL,
  name_en             VARCHAR(255),
  venue               VARCHAR(255),
  distance_meters     INT,
  race_class          VARCHAR(50),   -- 'G1', 'G2', 'conditions', 'handicap'
  status              race_status   NOT NULL DEFAULT 'upcoming',
  betting_opens_at    TIMESTAMPTZ,
  betting_closes_at   TIMESTAMPTZ,   -- usually = starts_at
  starts_at           TIMESTAMPTZ   NOT NULL,
  finished_at         TIMESTAMPTZ,
  total_pool          NUMERIC(14,2) NOT NULL DEFAULT 0,
  commission_rate     NUMERIC(5,4)  NOT NULL DEFAULT 0.15,
  results_entered_by  UUID          REFERENCES users(id),
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE race_entries (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  race_id         UUID          NOT NULL REFERENCES races(id),
  horse_id        UUID          NOT NULL REFERENCES horses(id),
  jockey_id       UUID          REFERENCES users(id),
  saddle_number   SMALLINT      NOT NULL,
  weight_kg       NUMERIC(5,2),
  total_bets      NUMERIC(14,2) NOT NULL DEFAULT 0,
  finish_position SMALLINT,              -- NULL until race ends
  finish_time_ms  INT,                   -- milliseconds
  is_scratched    BOOLEAN       NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  UNIQUE (race_id, saddle_number),
  UNIQUE (race_id, horse_id)
);

CREATE TABLE bets (
  id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  race_id               UUID          NOT NULL REFERENCES races(id),
  race_entry_id         UUID          NOT NULL REFERENCES race_entries(id),
  bettor_id             UUID          NOT NULL REFERENCES users(id),
  amount                NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  status                bet_status    NOT NULL DEFAULT 'active',
  odds_at_placement     NUMERIC(10,4),  -- snapshot of parimutuel odds when bet was placed
  payout_amount         NUMERIC(12,2),  -- calculated and set after race finishes
  bet_transaction_id    UUID          REFERENCES transactions(id),
  payout_transaction_id UUID          REFERENCES transactions(id),
  placed_at             TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  settled_at            TIMESTAMPTZ
);


-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        VARCHAR(100) NOT NULL,
  title_ar    TEXT        NOT NULL,
  body_ar     TEXT        NOT NULL,
  data        JSONB,                  -- {auctionId, raceId, amount, ...}
  is_read     BOOLEAN     NOT NULL DEFAULT false,
  sent_push   BOOLEAN     NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- AUDIT LOG — immutable, append-only
-- ============================================================

CREATE TABLE audit_logs (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id      UUID        REFERENCES users(id),  -- NULL = system action
  action        VARCHAR(100) NOT NULL,
  entity_type   VARCHAR(50)  NOT NULL,   -- 'auction','bid','bet','horse','user','transaction'
  entity_id     UUID        NOT NULL,
  old_data      JSONB,
  new_data      JSONB,
  ip_address    INET,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prevent any updates or deletes on audit_logs
CREATE RULE audit_log_no_update AS ON UPDATE TO audit_logs DO INSTEAD NOTHING;
CREATE RULE audit_log_no_delete AS ON DELETE TO audit_logs DO INSTEAD NOTHING;


-- ============================================================
-- STABLE & JOCKEY PROFILES
-- ============================================================

CREATE TABLE stable_profiles (
  user_id           UUID        PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  stable_name_ar    VARCHAR(255) NOT NULL,
  stable_name_en    VARCHAR(255),
  license_number    VARCHAR(100) UNIQUE,
  license_expiry    DATE,
  governorate       VARCHAR(100),          -- Cairo, Giza, Alexandria, etc.
  address           TEXT,
  capacity          SMALLINT,              -- max horses the stable holds
  logo_url          TEXT,
  is_premium        BOOLEAN     NOT NULL DEFAULT false,
  premium_expires_at TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE jockey_profiles (
  user_id           UUID        PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  license_number    VARCHAR(100) UNIQUE NOT NULL,
  license_expiry    DATE        NOT NULL,
  nationality       VARCHAR(100) NOT NULL DEFAULT 'Egyptian',
  weight_kg         NUMERIC(5,2),
  height_cm         NUMERIC(5,2),
  date_of_birth     DATE,
  total_races       INT         NOT NULL DEFAULT 0,
  total_wins        INT         NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- RACE OFFICIALS (JUDGES)
-- ============================================================

CREATE TABLE race_officials (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  race_id     UUID        NOT NULL REFERENCES races(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES users(id),
  role        VARCHAR(50) NOT NULL DEFAULT 'judge',  -- 'judge', 'steward', 'starter'
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (race_id, user_id)
);


-- ============================================================
-- AUCTION SETTLEMENTS
-- ============================================================

-- Tracks the post-auction escrow release flow (confirm receipt → sign → transfer)
CREATE TYPE settlement_status AS ENUM (
  'pending',          -- auction just ended, waiting for confirmation
  'receipt_confirmed',-- buyer confirmed horse received
  'signed',           -- digital contract signed by both parties
  'completed',        -- funds transferred to seller
  'disputed',         -- dispute raised, funds frozen
  'refunded'          -- auction cancelled / dispute resolved in buyer's favour
);

CREATE TABLE auction_settlements (
  id                    UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id            UUID              UNIQUE NOT NULL REFERENCES auctions(id),
  winner_id             UUID              NOT NULL REFERENCES users(id),
  seller_id             UUID              NOT NULL REFERENCES users(id),
  final_amount          NUMERIC(12,2)     NOT NULL,   -- winning bid
  commission_amount     NUMERIC(12,2)     NOT NULL,   -- platform fee
  seller_receives       NUMERIC(12,2)     NOT NULL,   -- final_amount - commission
  status                settlement_status NOT NULL DEFAULT 'pending',
  receipt_confirmed_at  TIMESTAMPTZ,
  contract_signed_at    TIMESTAMPTZ,
  completed_at          TIMESTAMPTZ,
  dispute_reason        TEXT,
  dispute_opened_at     TIMESTAMPTZ,
  dispute_resolved_at   TIMESTAMPTZ,
  seller_transaction_id UUID              REFERENCES transactions(id),
  created_at            TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);


-- ============================================================
-- FRAUD ALERTS
-- ============================================================

CREATE TYPE fraud_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE fraud_alert_status AS ENUM ('open', 'reviewing', 'resolved', 'false_positive');

CREATE TABLE fraud_alerts (
  id              UUID               PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type      VARCHAR(100)       NOT NULL,
  -- Types: 'multi_account_device', 'suspicious_bid_pattern', 'unusual_bet_speed',
  --        'rapid_login_failures', 'ip_velocity', 'large_withdrawal_post_win'
  severity        fraud_severity     NOT NULL,
  status          fraud_alert_status NOT NULL DEFAULT 'open',
  user_id         UUID               REFERENCES users(id),
  related_entity_type VARCHAR(50),   -- 'auction', 'race', 'bet', 'transaction'
  related_entity_id   UUID,
  details         JSONB              NOT NULL,   -- rule-specific data (IPs, amounts, timestamps)
  auto_action     VARCHAR(100),                 -- 'account_suspended', 'bet_blocked', null
  reviewed_by     UUID               REFERENCES users(id),
  reviewed_at     TIMESTAMPTZ,
  resolution_note TEXT,
  created_at      TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ        NOT NULL DEFAULT NOW()
);


-- ============================================================
-- PLATFORM CONFIG
-- ============================================================

-- Key-value store for configurable platform settings
-- Never hardcode commission rates or fees in application code
CREATE TABLE platform_config (
  key         VARCHAR(100) PRIMARY KEY,
  value       TEXT         NOT NULL,
  value_type  VARCHAR(20)  NOT NULL DEFAULT 'string',  -- 'string', 'number', 'boolean', 'json'
  description TEXT,
  updated_by  UUID         REFERENCES users(id),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Seed default values
INSERT INTO platform_config (key, value, value_type, description) VALUES
  ('auction.commission_rate',      '0.03',    'number',  'Seller commission on final auction price'),
  ('auction.listing_fee_egp',      '500',     'number',  'Flat fee to list an auction'),
  ('auction.premium_listing_egp',  '2000',    'number',  'Premium featured listing fee'),
  ('auction.anti_snipe_seconds',   '30',      'number',  'Seconds before end that trigger timer extension'),
  ('betting.commission_rate',      '0.15',    'number',  'Platform cut from each race pool'),
  ('betting.max_bet_pool_pct',     '0.10',    'number',  'Max single bet as % of total pool (anti-fraud)'),
  ('betting.max_bets_per_minute',  '3',       'number',  'IP rate limit for bet placement'),
  ('horse.registration_fee_egp',   '1000',    'number',  'One-time horse registration fee'),
  ('horse.renewal_fee_egp',        '200',     'number',  'Annual horse registration renewal'),
  ('wallet.min_deposit_egp',       '100',     'number',  'Minimum wallet deposit amount'),
  ('wallet.max_withdrawal_egp',    '50000',   'number',  'Max single withdrawal (KYC required above this)'),
  ('kyc.required_above_egp',       '10000',   'number',  'Withdrawal limit requiring verified KYC');


-- ============================================================
-- INDEXES
-- ============================================================

-- Users
CREATE INDEX idx_users_phone         ON users(phone);
CREATE INDEX idx_users_role          ON users(role);
CREATE INDEX idx_users_kyc_status    ON users(kyc_status) WHERE kyc_status = 'pending';

-- OTP
CREATE INDEX idx_otp_phone_active    ON otp_codes(phone, expires_at) WHERE used = false;

-- Refresh tokens
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id) WHERE revoked_at IS NULL;

-- Horses
CREATE INDEX idx_horses_horse_id     ON horses(horse_id);
CREATE INDEX idx_horses_owner        ON horses(current_owner_id);
CREATE INDEX idx_horses_pending      ON horses(is_approved) WHERE is_approved = false;
CREATE INDEX idx_horse_ownership     ON horse_ownership_history(horse_id);

-- Wallets & transactions
CREATE INDEX idx_transactions_wallet ON transactions(wallet_id, created_at DESC);
CREATE INDEX idx_transactions_ref    ON transactions(reference_type, reference_id);
CREATE INDEX idx_payment_intents_user ON payment_intents(user_id, created_at DESC);

-- Auctions
CREATE INDEX idx_auctions_status     ON auctions(status);
CREATE INDEX idx_auctions_live       ON auctions(ends_at) WHERE status = 'live';
CREATE INDEX idx_auctions_seller     ON auctions(seller_id);
CREATE INDEX idx_auction_bids_auction ON auction_bids(auction_id, created_at DESC);
CREATE INDEX idx_auction_bids_bidder  ON auction_bids(bidder_id);

-- Races & bets
CREATE INDEX idx_races_status        ON races(status);
CREATE INDEX idx_races_starts_at     ON races(starts_at);
CREATE INDEX idx_race_entries_race   ON race_entries(race_id);
CREATE INDEX idx_bets_race           ON bets(race_id);
CREATE INDEX idx_bets_bettor         ON bets(bettor_id, placed_at DESC);
CREATE INDEX idx_bets_entry          ON bets(race_entry_id);
CREATE INDEX idx_bets_active         ON bets(status) WHERE status = 'active';

-- Notifications
CREATE INDEX idx_notifications_user  ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE is_read = false;

-- Audit
CREATE INDEX idx_audit_entity        ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_actor         ON audit_logs(actor_id);
CREATE INDEX idx_audit_created       ON audit_logs(created_at DESC);

-- Fraud alerts
CREATE INDEX idx_fraud_alerts_status   ON fraud_alerts(status) WHERE status IN ('open', 'reviewing');
CREATE INDEX idx_fraud_alerts_user     ON fraud_alerts(user_id);
CREATE INDEX idx_fraud_alerts_severity ON fraud_alerts(severity, created_at DESC);

-- Race officials
CREATE INDEX idx_race_officials_race   ON race_officials(race_id);
CREATE INDEX idx_race_officials_user   ON race_officials(user_id);

-- Auction settlements
CREATE INDEX idx_settlements_status    ON auction_settlements(status);
CREATE INDEX idx_settlements_winner    ON auction_settlements(winner_id);

-- Profiles
CREATE INDEX idx_stable_premium        ON stable_profiles(is_premium) WHERE is_premium = true;


-- ============================================================
-- TRIGGERS — auto-update updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at          BEFORE UPDATE ON users          FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER horses_updated_at         BEFORE UPDATE ON horses         FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER auctions_updated_at       BEFORE UPDATE ON auctions       FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER races_updated_at          BEFORE UPDATE ON races          FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER wallets_updated_at           BEFORE UPDATE ON wallets             FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER user_passwords_updated_at    BEFORE UPDATE ON user_passwords      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER stable_profiles_updated_at   BEFORE UPDATE ON stable_profiles     FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER jockey_profiles_updated_at   BEFORE UPDATE ON jockey_profiles     FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER auction_settlements_updated  BEFORE UPDATE ON auction_settlements  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER fraud_alerts_updated_at      BEFORE UPDATE ON fraud_alerts         FOR EACH ROW EXECUTE FUNCTION set_updated_at();
