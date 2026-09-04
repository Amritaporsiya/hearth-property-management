import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

export type Role = 'MANAGER' | 'CONTRACTOR';
export type Status = 'REPORTED' | 'TRIAGED' | 'SCHEDULED' | 'RESOLVED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export function openDatabase(path = process.env.DATABASE_PATH ?? './data/hearth.db') {
  const filename = path === ':memory:' ? path : resolve(path);
  if (filename !== ':memory:') mkdirSync(dirname(filename), { recursive: true });
  const db = new DatabaseSync(filename);
  db.exec('PRAGMA foreign_keys = ON');
  db.exec('PRAGMA journal_mode = WAL');
  migrate(db);
  return db;
}

export function migrate(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL COLLATE NOCASE UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('MANAGER','CONTRACTOR')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS units (
      id INTEGER PRIMARY KEY,
      unit_number TEXT NOT NULL UNIQUE,
      address TEXT NOT NULL,
      monthly_rent_cents INTEGER NOT NULL CHECK(monthly_rent_cents >= 0),
      tenant_name TEXT NOT NULL,
      archived_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS rent_payments (
      id INTEGER PRIMARY KEY,
      unit_id INTEGER NOT NULL REFERENCES units(id),
      amount_cents INTEGER NOT NULL CHECK(amount_cents > 0),
      rent_month TEXT NOT NULL CHECK(rent_month GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]'),
      received_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      recorded_by INTEGER NOT NULL REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS maintenance_requests (
      id INTEGER PRIMARY KEY,
      unit_id INTEGER NOT NULL REFERENCES units(id),
      description TEXT NOT NULL CHECK(length(description) BETWEEN 3 AND 2000),
      priority TEXT NOT NULL CHECK(priority IN ('LOW','MEDIUM','HIGH','URGENT')),
      status TEXT NOT NULL DEFAULT 'REPORTED' CHECK(status IN ('REPORTED','TRIAGED','SCHEDULED','RESOLVED')),
      created_by INTEGER NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      resolved_at TEXT
    );
    CREATE TABLE IF NOT EXISTS request_assignments (
      request_id INTEGER NOT NULL REFERENCES maintenance_requests(id) ON DELETE CASCADE,
      contractor_id INTEGER NOT NULL REFERENCES users(id),
      assigned_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      assigned_by INTEGER NOT NULL REFERENCES users(id),
      PRIMARY KEY(request_id, contractor_id)
    );
    CREATE TABLE IF NOT EXISTS request_events (
      id INTEGER PRIMARY KEY,
      request_id INTEGER NOT NULL REFERENCES maintenance_requests(id) ON DELETE CASCADE,
      actor_id INTEGER NOT NULL REFERENCES users(id),
      event_type TEXT NOT NULL CHECK(event_type IN ('CREATED','STATUS_CHANGED','ASSIGNED','UNASSIGNED','NOTE')),
      old_value TEXT,
      new_value TEXT,
      body TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS alert_dismissals (
      unit_id INTEGER NOT NULL REFERENCES units(id),
      rent_month TEXT NOT NULL,
      dismissed_by INTEGER NOT NULL REFERENCES users(id),
      dismissed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY(unit_id, rent_month)
    );
    CREATE INDEX IF NOT EXISTS idx_payments_month_unit ON rent_payments(rent_month, unit_id);
    CREATE INDEX IF NOT EXISTS idx_requests_filters ON maintenance_requests(status, priority, unit_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_assignments_contractor ON request_assignments(contractor_id, request_id);
    CREATE INDEX IF NOT EXISTS idx_events_request ON request_events(request_id, created_at, id);

    CREATE TRIGGER IF NOT EXISTS prevent_event_update
    BEFORE UPDATE ON request_events BEGIN SELECT RAISE(ABORT, 'Maintenance history is immutable'); END;
    CREATE TRIGGER IF NOT EXISTS prevent_event_delete
    BEFORE DELETE ON request_events BEGIN SELECT RAISE(ABORT, 'Maintenance history is immutable'); END;
  `);
}
