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
}

export function closeDb() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
