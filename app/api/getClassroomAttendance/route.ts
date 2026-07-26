import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSchema } from "@/lib/ensureSchema";

/**
 * Classroom attendance records for a class.
 * - Teacher report: `?classId=...` (optionally `&date=YYYY-MM-DD`).
 * - Student "did I mark today?" check: `&email=...&date=...`.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");
    const email = searchParams.get("email");
    const date = searchParams.get("date");

    if (!classId) {
      return NextResponse.json({ error: "Class ID required" }, { status: 400 });
    }

    await ensureSchema();

    let sql =
      "SELECT id, email, name, sessionDate, timestamp FROM ClassroomAttendance WHERE classId = ?";
    const args: (string | null)[] = [classId];

    if (email) {
      sql += " AND email = ?";
      args.push(email.trim().toLowerCase());
    }
    if (date) {
      sql += " AND sessionDate = ?";
      args.push(date.slice(0, 10));
    }
    sql += " ORDER BY sessionDate DESC, timestamp DESC";

    const result = await db.execute({ sql, args });

    return NextResponse.json({ records: result.rows }, { status: 200 });
  } catch (error) {
    console.error("Error fetching classroom attendance:", error);
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}
