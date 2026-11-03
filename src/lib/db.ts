import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS items (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  published_at TEXT NOT NULL,
  raw_text TEXT NOT NULL,
  topic TEXT NOT NULL,
  class_label TEXT NOT NULL,
  fetched_at TEXT NOT NULL,
  resolved_at TEXT
);
-- Nullable relation for future partner agents: an item simply has zero rows here.
CREATE TABLE IF NOT EXISTS partner_runs (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  partner TEXT NOT NULL,
  status TEXT NOT NULL,
  payload TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS decisions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id TEXT NOT NULL UNIQUE REFERENCES items(id) ON DELETE CASCADE,
  input TEXT NOT NULL,
  decision TEXT NOT NULL,
  reason TEXT NOT NULL,
  actionable INTEGER NOT NULL,
  deadline TEXT,
  suggested_action TEXT,
  stage TEXT NOT NULL,
  model TEXT NOT NULL,
  created_at TEXT NOT NULL,
  overridden INTEGER NOT NULL DEFAULT 0,
  override_kind TEXT,
  override_at TEXT
);
CREATE TABLE IF NOT EXISTS embeddings (
  item_id TEXT PRIMARY KEY REFERENCES items(id) ON DELETE CASCADE,
  model TEXT NOT NULL,
  vector TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS store_profile (id INTEGER PRIMARY KEY CHECK (id = 1), data TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  started_at TEXT NOT NULL,
  finished_at TEXT,
  items_read INTEGER NOT NULL DEFAULT 0,
  items_surfaced INTEGER NOT NULL DEFAULT 0,
  failures TEXT NOT NULL DEFAULT '[]'
);
CREATE TABLE IF NOT EXISTS page_hashes (url TEXT PRIMARY KEY, hash TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
`;

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;
  const file = process.env.PEACHTREE_DB ?? path.join(process.cwd(), 'data', 'peachtree.db');
  if (file !== ':memory:') fs.mkdirSync(path.dirname(file), { recursive: true });
  db = new Database(file);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(SCHEMA);
  return db;
}

/** Empties every table. Used by the daily demo reset and tests. */
export function wipeDb(): void {
  const d = getDb();
  d.exec(`DELETE FROM partner_runs; DELETE FROM embeddings; DELETE FROM decisions; DELETE FROM items;
          DELETE FROM store_profile; DELETE FROM runs; DELETE FROM page_hashes; DELETE FROM meta;`);
}

export function getMeta(key: string): string | null {
  const row = getDb().prepare('SELECT value FROM meta WHERE key = ?').get(key) as { value: string } | undefined;
  return row?.value ?? null;
}

export function setMeta(key: string, value: string): void {
  getDb().prepare('INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(key, value);
}
