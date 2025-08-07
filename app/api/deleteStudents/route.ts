import { NextResponse } from "next/server";
import { adminDb } from "@/app/firebase/admin"; // make sure this points to your admin Firestore instance

export async function POST(req: Request) {
  try {
    const { studentIds } = await req.json();

    if (!studentIds || !Array.isArray(studentIds)) {
      return NextResponse.json(
        { error: "studentIds must be a valid array." },
        { status: 400 }
      );
    }

    const batch = adminDb.batch();
    const usersRef = adminDb.collection("users");

    for (const id of studentIds) {
      const studentDoc = usersRef.doc(id);
      batch.delete(studentDoc);
    }

    await batch.commit();

    return NextResponse.json({ message: "Selected students deleted successfully" });
  } catch (error) {
    console.error("Error deleting students:", error);
    return NextResponse.json({ error: "Failed to delete students" }, { status: 500 });
  }
}
