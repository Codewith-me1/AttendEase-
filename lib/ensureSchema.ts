import { db } from "./db";

/**
 * Idempotently creates the Google-Classroom-style tables and the `joinCode`
 * column used by the new class-group / announcement features.
 *
 * This runs at runtime (on first use) instead of via a Prisma migration so it
 * works against the remote Turso database without needing migration access.
 * Everything here is safe to run repeatedly and never touches the existing
 * `classes` / `Attendance` data.
 */

let ready: Promise<void> | null = null;

async function run() {
  // Members that have self-joined a class by entering their email (no login).
  await db.execute(`
    CREATE TABLE IF NOT EXISTS ClassMembers (
      id       TEXT NOT NULL PRIMARY KEY,
      classId  TEXT NOT NULL,
      email    TEXT NOT NULL,
      name     TEXT,
      joinedAt TEXT NOT NULL
    );
  `);
  // One membership row per (class, email).
  await db.execute(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_classmembers_class_email
      ON ClassMembers (classId, email);
  `);

  // Announcements a teacher posts to a class.
  await db.execute(`
    CREATE TABLE IF NOT EXISTS Announcements (
      id        TEXT NOT NULL PRIMARY KEY,
      classId   TEXT NOT NULL,
      title     TEXT,
      message   TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );
  `);
  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_announcements_class
      ON Announcements (classId);
  `);

  // Daily attendance for students who joined via the classroom. Kept fully
  // separate from the QR-based `Attendance` table so it has its own report and
  // never interferes with the existing flow. `sessionDate` (YYYY-MM-DD) models
  // one persistent class with a fresh session each day — a student can mark
  // once per day, and it "refreshes" automatically the next day.
  await db.execute(`
    CREATE TABLE IF NOT EXISTS ClassroomAttendance (
      id          TEXT NOT NULL PRIMARY KEY,
      classId     TEXT NOT NULL,
      email       TEXT NOT NULL,
      name        TEXT,
      sessionDate TEXT NOT NULL,
      timestamp   TEXT NOT NULL
    );
  `);
  // One mark per (class, student, day) — this is what enforces the daily reset.
  await db.execute(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_classroom_attendance_unique
      ON ClassroomAttendance (classId, email, sessionDate);
  `);
  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_classroom_attendance_class
      ON ClassroomAttendance (classId);
  `);

  // Add a short join code to the existing classes table. SQLite has no
  // "ADD COLUMN IF NOT EXISTS", so this throws "duplicate column" on later
  // runs — which we intentionally ignore.
  try {
    await db.execute(`ALTER TABLE classes ADD COLUMN joinCode TEXT;`);
  } catch {
    /* column already exists — expected on subsequent runs */
  }

  // Enforce unique codes across classes. SQLite allows many NULLs under a
  // unique index, so classes without a code yet are fine.
  try {
    await db.execute(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_classes_joincode
        ON classes (joinCode);
    `);
  } catch {
    /* ignore — index may already exist */
  }
}

/**
 * Ensures the classroom schema exists. The work is done once per server
 * instance and cached; callers just `await ensureSchema()`.
 */
export function ensureSchema(): Promise<void> {
  if (!ready) {
    ready = run().catch((err) => {
      // Reset so a transient failure can be retried on the next request.
      ready = null;
      throw err;
    });
  }
  return ready;
}
