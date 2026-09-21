import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const uploadsDir = path.join(dataDir, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const dbPath = path.join(dataDir, "ekyama.db");

// Reuse a single connection across hot reloads in dev.
declare global {
  var __ekyamaDb: Database.Database | undefined;
}

export const db: Database.Database = global.__ekyamaDb ?? new Database(dbPath);
if (process.env.NODE_ENV !== "production") global.__ekyamaDb = db;

db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS cases (
  code TEXT PRIMARY KEY,
  pin_hash TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'UG',
  language TEXT NOT NULL DEFAULT 'en',
  category TEXT,
  urgency TEXT NOT NULL DEFAULT 'unassessed',
  status TEXT NOT NULL DEFAULT 'received',
  reporter_role TEXT,
  narrative TEXT,
  district TEXT,
  has_audio INTEGER NOT NULL DEFAULT 0,
  audio_path TEXT,
  triage_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_code TEXT NOT NULL,
  sender TEXT NOT NULL, -- 'survivor' | 'counsellor' | 'system'
  body TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (case_code) REFERENCES cases(code)
);

CREATE TABLE IF NOT EXISTS status_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_code TEXT NOT NULL,
  status TEXT NOT NULL,
  note TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (case_code) REFERENCES cases(code)
);
`);

export { uploadsDir };
