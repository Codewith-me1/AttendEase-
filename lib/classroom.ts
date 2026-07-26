import { db } from "./db";
import { ensureSchema } from "./ensureSchema";

// Human-friendly alphabet: no 0/O/1/I/L to avoid confusion when typing a code.
const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/** Generate a short, human-friendly class join code (like Google Classroom). */
export function generateJoinCode(length = 6): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CODE_CHARS[bytes[i] % CODE_CHARS.length];
  }
  return code;
}

/** Basic email shape validation (kept intentionally lenient). */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Ensure a class has a join code, generating a unique one if it doesn't.
 * Returns the code, or null if the class doesn't exist.
 */
export async function ensureClassCode(classId: string): Promise<string | null> {
  await ensureSchema();

  const existing = await db.execute({
    sql: "SELECT joinCode FROM classes WHERE id = ? LIMIT 1",
    args: [classId],
  });

  if (existing.rows.length === 0) return null;

  const current = existing.rows[0].joinCode as string | null;
  if (current) return current;

  // Generate a code, retrying on the (rare) unique-index collision.
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateJoinCode();
    try {
      await db.execute({
        sql: "UPDATE classes SET joinCode = ? WHERE id = ?",
        args: [code, classId],
      });
      return code;
    } catch {
      /* code collided with another class — try a new one */
    }
  }

  return null;
}

/** Resolve a class by its join code. Codes are matched case-insensitively. */
export async function getClassByCode(code: string) {
  await ensureSchema();
  const result = await db.execute({
    sql: "SELECT id, name, joinCode FROM classes WHERE joinCode = ? LIMIT 1",
    args: [code.trim().toUpperCase()],
  });
  return result.rows.length ? result.rows[0] : null;
}
