import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== "POST") {
    res.statusCode = 405; // Method Not Allowed
    res.setHeader("Allow", ["POST"]);
    return res.json({ error: "Method not allowed" });
  }

  const { to, subject, text } = req.body;

  if (!to || !subject || !text) {
    res.statusCode = 400; // Bad Request
    return res.json({ error: "Missing required fields" });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true, // Use `true` for 465, `false` for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Your App" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
    });

    res.statusCode = 200; // OK
    return res.json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Email sending error:", error);
    res.statusCode = 500; // Internal Server Error
    return res.json({ error: "Error sending email" });
  }
}
