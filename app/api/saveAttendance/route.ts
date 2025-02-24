import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Import Turso client

export async function POST(req: Request) {
  try {
    const { classId, studentName } = await req.json();

    if (!classId || !studentName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Insert attendance into Turso database
    await db.execute({
      sql: "INSERT INTO Attendance (id, classId, studentName, timestamp) VALUES (?, ?, ?, ?)",
      args: [crypto.randomUUID(), classId, studentName, new Date().toISOString()],
    });

    return NextResponse.json(
      { message: "Attendance marked successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving attendance:", error);
    return NextResponse.json(
      { error: "Failed to save attendance" },
      { status: 500 }
    );
  }
}
