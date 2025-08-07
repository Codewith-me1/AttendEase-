import { NextResponse } from "next/server";
import { adminDb } from "@/app/firebase/admin";// Adjust import based on your project setup

export async function DELETE() {
  try {
    const usersRef = adminDb.collection("users");
    const snapshot = await usersRef.where("role", "==", "student").get();

    if (snapshot.empty) {
      return NextResponse.json({ message: "No student records found." });
    }

    const batch = adminDb.batch();

    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    return NextResponse.json({ message: "All student records deleted successfully." });
  } catch (error) {
    console.error("Error deleting all students:", error);
    return NextResponse.json(
      { error: "Failed to delete student records." },
      { status: 500 }
    );
  }
}
