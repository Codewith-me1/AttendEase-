import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const { to, subject, text } = await req.json();
    console.log(to,text,subject)

    // Validate required fields
    if (!to || !subject || !text) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Configure the nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true, // true for port 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false, // Ignore self-signed certificates
      },
    });

    // Send the email
    await transporter.sendMail({
      from: `"Attendance App" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
    });

    // Return a success response
    return NextResponse.json({ message: `Email sent successfully to ${to}` }, { status: 200 });
  } catch (error:any) {
    console.error("Email sending error:", error);

    // Return an error response
    return NextResponse.json(
      { error: `Error sending email: ${error.message}` },
      { status: 500 }
    );
  }
}
