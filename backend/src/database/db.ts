import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { config } from '../config/index.js';

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!dbInstance) {
    dbInstance = new Database(config.dbPath);
    // Performance optimizations for SQLite in Developer OS
    dbInstance.pragma('journal_mode = WAL');
    dbInstance.pragma('foreign_keys = ON');
    dbInstance.pragma('synchronous = NORMAL');
    dbInstance.pragma('cache_size = -64000'); // 64MB cache
    
    initSchema(dbInstance);
    runMigrations(dbInstance);
  }
  return dbInstance;
}

export function initSchema(db: Database.Database) {
  const schemaPath = path.resolve(__dirname, 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schemaSql);
  }
}

export function runMigrations(db: Database.Database) {
  const columnsToAdd = [
    "ALTER TABLE users ADD COLUMN subscription_status TEXT DEFAULT 'PENDING_PAYMENT'",
    "ALTER TABLE users ADD COLUMN stripe_customer_id TEXT",
    "ALTER TABLE users ADD COLUMN stripe_session_id TEXT",
    "ALTER TABLE users ADD COLUMN plan_id TEXT DEFAULT 'CADET_PRO_990'",
    "ALTER TABLE users ADD COLUMN last_login_at TEXT",
    "ALTER TABLE users ADD COLUMN login_count INTEGER DEFAULT 1",
    "ALTER TABLE users ADD COLUMN streak_days INTEGER DEFAULT 1",
    "ALTER TABLE users ADD COLUMN total_time_spent_min INTEGER DEFAULT 45"
  ];

  for (const sql of columnsToAdd) {
    try {
      db.exec(sql);
    } catch {}
  }
  migrateEnrollments(db);
  migrateAuthTokens(db);
  migrateSchoolExtras(db);
}

// Phase 2 (flag FF_ENROLLMENT_GUARD): per-course access. Idempotent; undo with scripts/rollback-enrollments.sql
export function migrateEnrollments(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS enrollments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, REVOKED, REFUNDED
      source TEXT NOT NULL DEFAULT 'PURCHASE', -- PURCHASE, ACCESS_CODE, ADMIN, LEGACY_SUBSCRIPTION
      order_id TEXT,
      granted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME,
      revoked_at DATETIME,
      UNIQUE(user_id, course_id)
    );
    CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id, status);
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      amount_cents INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'BRL',
      status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, PAID, REFUNDED, FAILED
      provider TEXT NOT NULL,
      provider_ref TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(provider, provider_ref)
    );
    CREATE TABLE IF NOT EXISTS access_codes (
      code TEXT PRIMARY KEY,
      course_id TEXT NOT NULL,
      max_uses INTEGER NOT NULL DEFAULT 1,
      used_count INTEGER NOT NULL DEFAULT 0,
      expires_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS preview_lessons (code TEXT PRIMARY KEY);
    INSERT OR IGNORE INTO preview_lessons (code) VALUES ('00.01');
    -- legacy paying users keep access
    INSERT OR IGNORE INTO enrollments (id, user_id, course_id, status, source)
      SELECT 'legacy_' || id, id, 'course_devos_fullstack', 'ACTIVE', 'LEGACY_SUBSCRIPTION'
      FROM users WHERE subscription_status = 'ACTIVE';
  `);
}

export function closeDb() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

// Phase 4: password reset + email verification tokens. Idempotent; undo with scripts/rollback-auth-tokens.sql
export function migrateAuthTokens(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS auth_tokens (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      kind TEXT NOT NULL, -- RESET, VERIFY
      expires_at TEXT NOT NULL,
      used_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_auth_tokens_user ON auth_tokens(user_id, kind);
  `);
}

// Phase 5: audit log, consents (RGPD / 14-day withdrawal), lesson notes, certificates, refund lookup.
// Idempotent; undo with scripts/rollback-school-extras.sql
export function migrateSchoolExtras(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT, actor_id TEXT, action TEXT NOT NULL, target TEXT, meta_json TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS consents (
      id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL, kind TEXT NOT NULL, course_id TEXT,
      accepted_at TEXT DEFAULT CURRENT_TIMESTAMP, ip TEXT);
    CREATE TABLE IF NOT EXISTS lesson_notes (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL, lesson_id TEXT NOT NULL, body TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP);
    CREATE INDEX IF NOT EXISTS idx_notes_user_lesson ON lesson_notes(user_id, lesson_id);
    CREATE TABLE IF NOT EXISTS certificates (
      code TEXT PRIMARY KEY, user_id TEXT NOT NULL, course_id TEXT NOT NULL, issued_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, course_id));
    CREATE TABLE IF NOT EXISTS payment_refs (payment_intent TEXT PRIMARY KEY, order_id TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS tutor_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL, feedback_id TEXT, reason TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
  `);
}
