// /app/api/assignStudentsToClass/route.ts
import { NextResponse } from "next/server";
import { assignStudentToClass } from "@/app/firebase/adminDb";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { classId, studentIds } = body;

    if (!classId || !Array.isArray(studentIds)) {
      return NextResponse.json({ message: "Missing data" }, { status: 400 });
    }

    const result = await assignStudentToClass(classId,studentIds);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Error assigning students to class:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
