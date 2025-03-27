import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Ensure this is your Turso client instance

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const studentId = url.searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json({ error: "Student Id is required" }, { status: 400 });
    }

    // Query: Join Attendance and classes table to get class name along with timestamp.
    const result = await db.execute({
      sql: `
        SELECT a.timestamp, c.name AS className
        FROM Attendance a
        JOIN classes c ON a.classId = c.id
        WHERE a.studentId = ?
        ORDER BY a.timestamp DESC
      `,
      args: [studentId],
    });

    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch attendance", details: error }, { status: 500 });
  }
}
