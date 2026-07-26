import { NextResponse } from "next/server";
import { ensureClassCode } from "@/lib/classroom";

/**
 * Teacher: fetch (or lazily generate) the join code for a class.
 * Used by the classroom panel so existing classes created before this feature
 * still get a code the first time they're opened.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");

    if (!classId) {
      return NextResponse.json({ error: "Class ID required" }, { status: 400 });
    }

    const code = await ensureClassCode(classId);
    if (!code) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    return NextResponse.json({ code }, { status: 200 });
  } catch (error) {
    console.error("Error ensuring class code:", error);
    return NextResponse.json({ error: "Failed to get class code" }, { status: 500 });
  }
}
