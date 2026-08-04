PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS service_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

INSERT OR IGNORE INTO service_config (key, value, updated_at)
VALUES
  ('daily_global_limit', '100', '2026-08-04T00:00:00.000Z'),
  ('daily_domain_limit', '3', '2026-08-04T00:00:00.000Z');

CREATE TABLE IF NOT EXISTS audit_jobs (
  id TEXT PRIMARY KEY,
  origin TEXT NOT NULL,
  hostname TEXT NOT NULL,
  origin_hash TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'completed', 'partial', 'failed')),
  notice_version TEXT NOT NULL,
  consent_accepted_at TEXT NOT NULL,
  ruleset_version TEXT NOT NULL,
  scanner_version TEXT NOT NULL,
  report_json TEXT,
  failure_code TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS audit_jobs_dedupe_idx
  ON audit_jobs (origin_hash, ruleset_version, scanner_version, created_at DESC);
CREATE INDEX IF NOT EXISTS audit_jobs_status_updated_idx
  ON audit_jobs (status, updated_at);
CREATE INDEX IF NOT EXISTS audit_jobs_expiry_idx
  ON audit_jobs (expires_at);

CREATE TABLE IF NOT EXISTS job_access_tokens (
  job_id TEXT NOT NULL REFERENCES audit_jobs(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (job_id, token_hash)
);

CREATE INDEX IF NOT EXISTS job_access_tokens_expiry_idx
  ON job_access_tokens (expires_at);

CREATE TABLE IF NOT EXISTS audit_rate_events (
  day TEXT NOT NULL,
  event_id TEXT PRIMARY KEY,
  origin_hash TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS audit_rate_events_global_idx
  ON audit_rate_events (day);
CREATE INDEX IF NOT EXISTS audit_rate_events_domain_idx
  ON audit_rate_events (day, origin_hash);

CREATE TRIGGER IF NOT EXISTS audit_rate_global_guard
BEFORE INSERT ON audit_rate_events
WHEN (
  SELECT COUNT(*) FROM audit_rate_events WHERE day = NEW.day
) >= CAST((
  SELECT value FROM service_config WHERE key = 'daily_global_limit'
) AS INTEGER)
BEGIN
  SELECT RAISE(ABORT, 'audit_global_daily_limit');
END;

CREATE TRIGGER IF NOT EXISTS audit_rate_domain_guard
BEFORE INSERT ON audit_rate_events
WHEN (
  SELECT COUNT(*) FROM audit_rate_events
  WHERE day = NEW.day AND origin_hash = NEW.origin_hash
) >= CAST((
  SELECT value FROM service_config WHERE key = 'daily_domain_limit'
) AS INTEGER)
BEGIN
  SELECT RAISE(ABORT, 'audit_domain_daily_limit');
END;

CREATE TABLE IF NOT EXISTS signature_nonces (
  nonce TEXT PRIMARY KEY,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS signature_nonces_created_idx
  ON signature_nonces (created_at);
