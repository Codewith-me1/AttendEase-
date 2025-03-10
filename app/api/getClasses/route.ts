import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Import the Turso client

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("userId");

    if (!teacherId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Fetch classes for the specific teacher
    const result = await db.execute({
      sql: "SELECT * FROM classes WHERE teacherId = ? ORDER BY createdAt DESC",
      args: [teacherId],
    });

    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error("Error fetching classes:", error);
    return NextResponse.json({ error: "Failed to fetch classes" }, { status: 500 });
  }
}
