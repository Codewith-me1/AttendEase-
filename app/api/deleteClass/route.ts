// app/api/deleteClass/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { classId, teacherId } = await req.json();

    if (!classId || !teacherId) {
      return NextResponse.json(
        { error: "classId and teacherId are required" },
        { status: 400 }
      );
    }

    await db.execute({
      sql: "DELETE FROM classes WHERE id = ? AND teacherId = ?",
      args: [classId, teacherId],
    });

    return NextResponse.json({ message: "Class deleted successfully" });
  } catch (error) {
    console.error("Error deleting class:", error);
    return NextResponse.json({ error: "Failed to delete class" }, { status: 500 });
  }
}
