import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSchema } from "@/lib/ensureSchema";
import { isValidEmail } from "@/lib/classroom";

/**
 * Public: list all classes a student email has joined.
 * Powers the student classroom home (no login required).
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!isValidEmail(cleanEmail)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    await ensureSchema();

    const result = await db.execute({
      sql: `SELECT c.id, c.name, c.joinCode, m.joinedAt
            FROM ClassMembers m
            JOIN classes c ON c.id = m.classId
            WHERE m.email = ?
            ORDER BY m.joinedAt DESC`,
      args: [cleanEmail],
    });

    return NextResponse.json({ classes: result.rows }, { status: 200 });
  } catch (error) {
    console.error("Error fetching student classes:", error);
    return NextResponse.json({ error: "Failed to fetch classes" }, { status: 500 });
  }
}
