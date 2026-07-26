import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Import the Turso client
import { ensureClassCode } from "@/lib/classroom";

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

    // Insert new class into the Turso database (unchanged from the original
    // behaviour, so class creation can never break).
    await db.execute({
      sql: "INSERT INTO classes (id, name, createdAt, teacherId) VALUES (?, ?, ?, ?)",
      args: [classId, name, new Date().toISOString(), teacherId],
    });

    // Attach a Google-Classroom-style join code. Done separately and
    // best-effort so a code failure never prevents the class from being
    // created.
    let joinCode: string | null = null;
    try {
      joinCode = await ensureClassCode(classId);
    } catch (codeError) {
      console.error("Failed to generate join code:", codeError);
    }

    return NextResponse.json(
      { message: "Class created successfully", classId, joinCode },
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
