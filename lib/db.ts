import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// On Vercel (and other read-only-filesystem serverless hosts), the project
// directory isn't writable — only /tmp is, and it's wiped whenever the
// serverless function gets a fresh instance (a redeploy, a cold start after
// idle, or just routine instance recycling). That makes this a genuine
// demo deployment: data submitted stays visible while the same warm
// instance keeps serving requests, but can reset without warning. A real
// deployment needs a hosted database (e.g. Turso/libSQL) and blob storage
// for audio instead — see README "Known limitations".
//
// We don't rely on a host-specific env var (e.g. process.env.VERCEL) to
// detect this, since whether that's set can depend on project settings
// that vary per deployment. Instead we just try the normal project-local
// path first and fall back to /tmp if it isn't writable — this works on
// Vercel, any other read-only-filesystem host, and plain local dev alike.
function resolveDataDir(): string {
  const preferred = path.join(process.cwd(), "data");
  try {
    fs.mkdirSync(preferred, { recursive: true });
    fs.accessSync(preferred, fs.constants.W_OK);
    return preferred;
  } catch {
    const fallback = path.join("/tmp", "ekyama-data");
    fs.mkdirSync(fallback, { recursive: true });
    return fallback;
  }
}

const dataDir = resolveDataDir();

const uploadsDir = path.join(dataDir, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const dbPath = path.join(dataDir, "ekyama.db");

// Reuse a single connection for the lifetime of this process — across dev
// hot reloads, and across requests served by the same warm serverless
// instance.
declare global {
  var __ekyamaDb: Database.Database | undefined;
}

export const db: Database.Database = global.__ekyamaDb ?? new Database(dbPath);
global.__ekyamaDb = db;

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
