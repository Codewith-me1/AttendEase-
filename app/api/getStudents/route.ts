import { NextResponse } from "next/server";
import { adminDb } from "@/app/firebase/admin";

export async function GET() {
  try {
    const usersRef = adminDb.collection("users");
    const snapshot = await usersRef.where("role", "==", "student").get();

    if (snapshot.empty) {
      return NextResponse.json({ students: [] });
    }

    const students = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ students });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json({ error: "Failed to retrieve students" }, { status: 500 });
  }
}
