import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Ensure this is your Turso client instance

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const studentName = url.searchParams.get("studentName");

    if (!studentName) {
      return NextResponse.json({ error: "Student name is required" }, { status: 400 });
    }

    // Query: Join Attendance and classes table to get class name along with timestamp.
    const result = await db.execute({
      sql: `
        SELECT a.timestamp, c.name AS className
        FROM Attendance a
        JOIN classes c ON a.classId = c.id
        WHERE a.studentName = ?
        ORDER BY a.timestamp DESC
      `,
      args: [studentName],
    });

    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch attendance", details: error }, { status: 500 });
  }
}
