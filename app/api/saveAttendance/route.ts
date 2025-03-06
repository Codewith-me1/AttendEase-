import { NextResponse } from "next/server";
import { db } from "@/lib/db";


export async function POST(req: Request) {
  try {
    const { classId, studentName, studentId } = await req.json();

    if (!classId || !studentName.trim()) {
      return NextResponse.json(
        { message: "Class ID or Student Name is missing!" },
        { status: 400 }
      );
    }

    // Insert attendance record into Turso database
    await db.execute({
      sql: `
        INSERT INTO Attendance (id, classId, studentId, studentName, timestamp) 
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP);
      `,
      args: [
        crypto.randomUUID(),
        classId,
        studentId || null, // Store NULL if no user is logged in
        studentName,
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking attendance:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
