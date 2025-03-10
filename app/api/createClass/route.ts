import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Import the Turso client

export async function POST(req: Request) {
  try {
    const { name, teacherId } = await req.json();

    if (!name || !teacherId) {
      return NextResponse.json(
        { error: "Class name and teacherId are required"+name+teacherId },
        { status: 400 }
      );
    }

    const classId = crypto.randomUUID(); // Generate unique ID

    // Insert new class into the Turso database
    await db.execute({
      sql: "INSERT INTO classes (id, name, createdAt, teacherId) VALUES (?, ?, ?, ?)",
      args: [classId, name, new Date().toISOString(), teacherId],
    });

    return NextResponse.json(
      { message: "Class created successfully", classId },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating class:", error);
    return NextResponse.json(
      { error: "Failed to create class" },
      { status: 500 }
    );
  }
}
