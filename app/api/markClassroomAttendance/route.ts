import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSchema } from "@/lib/ensureSchema";
import { getClassByCode, isValidEmail } from "@/lib/classroom";

/** Server-side fallback for "today" as a local YYYY-MM-DD string. */
function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Public: a joined student marks their attendance for today's session from the
 * classroom — no login. Thanks to the unique (classId, email, sessionDate)
 * index this is idempotent per day and automatically "refreshes" the next day.
 */
export async function POST(req: Request) {
  try {
    const { code, classId: classIdInput, email, name, sessionDate } = await req.json();

    if ((!code && !classIdInput) || !email) {
      return NextResponse.json(
        { error: "Class (code or id) and email are required" },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    if (!isValidEmail(cleanEmail)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }

    await ensureSchema();

    // Resolve the class id (via code if that's what we were given).
    let classId = classIdInput as string | undefined;
    let className: string | null = null;
    if (!classId && code) {
      const cls = await getClassByCode(code);
      if (!cls) {
        return NextResponse.json({ error: "No class found for this code" }, { status: 404 });
      }
      classId = cls.id as string;
      className = cls.name as string;
    }

    // Only allow marking if the student is actually a member of the class.
    const member = await db.execute({
      sql: "SELECT name FROM ClassMembers WHERE classId = ? AND email = ? LIMIT 1",
      args: [classId as string, cleanEmail],
    });
    if (member.rows.length === 0) {
      return NextResponse.json(
        { error: "You must join this class before marking attendance." },
        { status: 403 }
      );
    }

    const day = (sessionDate && String(sessionDate).slice(0, 10)) || todayDate();
    const displayName =
      (name && String(name).trim()) ||
      (member.rows[0].name as string | null) ||
      cleanEmail.split("@")[0];

    const result = await db.execute({
      sql: `INSERT OR IGNORE INTO ClassroomAttendance (id, classId, email, name, sessionDate, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        crypto.randomUUID(),
        classId as string,
        cleanEmail,
        displayName,
        day,
        new Date().toISOString(),
      ],
    });

    const alreadyMarked = result.rowsAffected === 0;

    return NextResponse.json(
      { success: true, alreadyMarked, sessionDate: day, className },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error marking classroom attendance:", error);
    return NextResponse.json({ error: "Failed to mark attendance" }, { status: 500 });
  }
}
