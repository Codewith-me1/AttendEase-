import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Import Turso client

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");

    if (!classId) {
      return NextResponse.json({ error: "Class ID required" }, { status: 400 });
    }

    // Fetch class name from Turso database
    const result = await db.execute({
      sql: "SELECT name FROM classes WHERE id = ?",
      args: [classId],
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    return NextResponse.json({ name: result.rows[0].name }, { status: 200 });
  } catch (error) {
    console.error("Error fetching class name:", error);
    return NextResponse.json({ error: "Failed to fetch class name" }, { status: 500 });
  }
}
