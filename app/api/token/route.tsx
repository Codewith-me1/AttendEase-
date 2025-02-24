// /app/api/auth/validateToken.ts
import { adminAuth } from "@/app/firebase/admin";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "No token provided" }, { status: 400 });
  }

  try {
    await adminAuth.verifyIdToken(token);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Token validation error:", error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
