import { NextResponse } from "next/server";
import { getClassByCode } from "@/lib/classroom";

/**
 * Public: resolve a class join code to its class info.
 * Used by the student "join" and "classroom" pages (no login required).
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ error: "Class code is required" }, { status: 400 });
    }

    const cls = await getClassByCode(code);
    if (!cls) {
      return NextResponse.json({ error: "No class found for this code" }, { status: 404 });
    }

    return NextResponse.json(cls, { status: 200 });
  } catch (error) {
    console.error("Error resolving class code:", error);
    return NextResponse.json({ error: "Failed to resolve class code" }, { status: 500 });
  }
}
