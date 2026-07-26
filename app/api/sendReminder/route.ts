import { NextResponse } from "next/server";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER!;

const client = twilio(accountSid, authToken);

export async function POST(req: Request) {
  try {
    const { phoneNumber, studentName } = await req.json();

    if (!phoneNumber || !studentName) {
      return NextResponse.json({ message: "Missing data" }, { status: 400 });
    }

    const message = await client.messages.create({
      body: `Hi ${studentName}, you missed today’s class. Please make sure to attend next time. Contact your teacher if needed.`,
      from: twilioNumber,
      to:  phoneNumber,
    });

    return NextResponse.json({ success: true, sid: message.sid });
  } catch (error: any) {
    console.error("Twilio error:", error);
    return NextResponse.json(
      { message: "Failed to send SMS" },
      { status: 500 }
    );
  }
}
