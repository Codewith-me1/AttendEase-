import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSchema } from "@/lib/ensureSchema";

/**
 * Teacher: list the members (self-joined students) of a class.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");

    if (!classId) {
      return NextResponse.json({ error: "Class ID required" }, { status: 400 });
    }

    await ensureSchema();

    const result = await db.execute({
      sql: "SELECT id, email, name, joinedAt FROM ClassMembers WHERE classId = ? ORDER BY joinedAt DESC",
      args: [classId],
    });

    return NextResponse.json({ members: result.rows }, { status: 200 });
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
  }
}
