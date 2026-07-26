import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { db } from "@/lib/db";
import { ensureSchema } from "@/lib/ensureSchema";

/**
 * Teacher: post an announcement to a class. The announcement is stored (so it
 * shows in every member's classroom feed) and, best-effort, emailed to each
 * member individually — mirroring Google Classroom's behaviour.
 */
export async function POST(req: Request) {
  try {
    const { classId, title, message } = await req.json();

    if (!classId || !message || !String(message).trim()) {
      return NextResponse.json(
        { error: "Class ID and message are required" },
        { status: 400 }
      );
    }

    await ensureSchema();

    // Confirm the class exists and grab its name for the email.
    const classResult = await db.execute({
      sql: "SELECT name FROM classes WHERE id = ? LIMIT 1",
      args: [classId],
    });
    if (classResult.rows.length === 0) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }
    const className = classResult.rows[0].name as string;

    // Store the announcement.
    await db.execute({
      sql: `INSERT INTO Announcements (id, classId, title, message, createdAt)
            VALUES (?, ?, ?, ?, ?)`,
      args: [
        crypto.randomUUID(),
        classId,
        (title && String(title).trim()) || null,
        String(message).trim(),
        new Date().toISOString(),
      ],
    });

    // Fetch member emails to notify them individually.
    const membersResult = await db.execute({
      sql: "SELECT email FROM ClassMembers WHERE classId = ?",
      args: [classId],
    });
    const emails = membersResult.rows
      .map((r) => r.email as string)
      .filter(Boolean);

    // Best-effort email fan-out. Never fail the request if email is
    // misconfigured or a send bounces — the announcement is already saved.
    let emailed = 0;
    if (emails.length > 0 && process.env.SMTP_HOST) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT),
          secure: true,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
          tls: { rejectUnauthorized: false },
        });

        const subject = title
          ? `[${className}] ${title}`
          : `New announcement in ${className}`;

        const results = await Promise.allSettled(
          emails.map((to) =>
            transporter.sendMail({
              from: `"${className}" <${process.env.SMTP_USER}>`,
              to,
              subject,
              text: message,
            })
          )
        );
        emailed = results.filter((r) => r.status === "fulfilled").length;
      } catch (mailError) {
        console.error("Announcement email fan-out failed:", mailError);
      }
    }

    return NextResponse.json(
      { success: true, notified: emailed, totalMembers: emails.length },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating announcement:", error);
    return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 });
  }
}
