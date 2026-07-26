import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSchema } from "@/lib/ensureSchema";
import { getClassByCode } from "@/lib/classroom";

/**
 * Public: list announcements for a class, addressed either by `classId`
 * (teacher view) or by `code` (student view). No login required.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let classId = searchParams.get("classId");
    const code = searchParams.get("code");

    if (!classId && code) {
      const cls = await getClassByCode(code);
      if (!cls) {
        return NextResponse.json({ error: "No class found for this code" }, { status: 404 });
      }
      classId = cls.id as string;
    }

    if (!classId) {
      return NextResponse.json({ error: "classId or code is required" }, { status: 400 });
    }

    await ensureSchema();

    const result = await db.execute({
      sql: "SELECT id, title, message, createdAt FROM Announcements WHERE classId = ? ORDER BY createdAt DESC",
      args: [classId],
    });

    return NextResponse.json({ classId, announcements: result.rows }, { status: 200 });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 });
  }
}
