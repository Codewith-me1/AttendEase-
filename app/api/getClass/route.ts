import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db"; 

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Class ID is required" }, { status: 400 });
  }

  try {
    const result = await db.execute({
      sql: "SELECT * FROM classes WHERE id = ? LIMIT 1",
      args: [id], // ✅ Pass the id as a parameter
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error) {
    console.error("Error fetching class:", error);
    return NextResponse.json({ error: "Failed to fetch class" }, { status: 500 });
  }
}
