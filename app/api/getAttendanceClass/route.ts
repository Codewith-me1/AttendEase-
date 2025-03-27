import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Import the Turso client

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");

    if (!classId) {
      return NextResponse.json({ error: "Class ID required" }, { status: 400 });
    }

    const result = await db.execute({
      sql: "SELECT * FROM attendance WHERE classId = ? ORDER BY timestamp DESC",
      args: [classId],
    });

    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}
