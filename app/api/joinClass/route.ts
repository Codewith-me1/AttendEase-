import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSchema } from "@/lib/ensureSchema";
import { getClassByCode, isValidEmail } from "@/lib/classroom";

/**
 * Public: a student joins a class group by entering the class code and their
 * email — no login or signup. Re-joining with the same email is a no-op.
 */
export async function POST(req: Request) {
  try {
    const { code, email, name } = await req.json();

    if (!code || !email) {
      return NextResponse.json(
        { error: "Class code and email are required" },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    if (!isValidEmail(cleanEmail)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }

    const cls = await getClassByCode(code);
    if (!cls) {
      return NextResponse.json(
        { error: "No class found for this code. Please check the code and try again." },
        { status: 404 }
      );
    }

    await ensureSchema();

    // INSERT OR IGNORE keeps re-joins idempotent thanks to the unique
    // (classId, email) index.
    await db.execute({
      sql: `INSERT OR IGNORE INTO ClassMembers (id, classId, email, name, joinedAt)
            VALUES (?, ?, ?, ?, ?)`,
      args: [
        crypto.randomUUID(),
        cls.id as string,
        cleanEmail,
        (name && String(name).trim()) || cleanEmail.split("@")[0],
        new Date().toISOString(),
      ],
    });

    return NextResponse.json(
      {
        success: true,
        classId: cls.id,
        name: cls.name,
        joinCode: cls.joinCode,
        email: cleanEmail,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error joining class:", error);
    return NextResponse.json({ error: "Failed to join class" }, { status: 500 });
  }
}
