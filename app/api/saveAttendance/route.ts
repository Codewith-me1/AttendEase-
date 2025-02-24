import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { classId, studentName } = await req.json();

    if (!classId || !studentName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await prisma.attendance.create({
      data: { classId, studentName },
    });

    return NextResponse.json({ message: "Attendance marked successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save attendance" }, { status: 500 });
  }
}
