import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Import the Turso client

export async function GET(req: Request) {
  try {


    // Fetch classes for the specific teacher
    const result = await db.execute({
      sql: "SELECT * FROM classes ORDER BY createdAt DESC",
      args: [],
    });

    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error("Error fetching classes:", error);
    return NextResponse.json({ error: "Failed to fetch classes" }, { status: 500 });
  }
}
