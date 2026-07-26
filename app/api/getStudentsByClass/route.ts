import { NextResponse } from "next/server";
import { adminDb } from "@/app/firebase/admin";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const classId = searchParams.get("classId");

  if (!classId) {
    return NextResponse.json({ message: "Missing classId" }, { status: 400 });
  }

  try {
    const usersRef = adminDb.collection("users");
    const querySnapshot = await usersRef.where("classIds", "array-contains", classId).get();

    const students = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ students });
  } catch (error) {
    console.error("Error fetching students by class ID:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
