
import { adminDb } from "./admin";

export const Likes = async (uid:string) => {
  try {
    const docRef = adminDb.collection("users").doc(uid);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return docSnap.data()?.Liked || [];
    } else {
      console.error("No document found for user:", uid);
      throw new Error("User document not found");
    }
  } catch (error) {
    console.error("Error fetching user likes:", error);
    throw error;
  }
};


export const getUserWatchlist = async (userId:string) => {
  const docRef = adminDb.collection( "users").doc(userId);
  const docSnap = await docRef.get();

  if (docSnap.exists) {
    return docSnap.data()?.Watchlist || []; 
  } else {
    throw new Error("User document not found");
  }

};



export const getStudents = async () => {
  try {
    const usersRef = adminDb.collection("users"); // Reference to "users" collection
    const snapshot = await usersRef.where("role", "==", "student").get();

    if (snapshot.empty) {
      throw new Error("No students found");
    }

    const students = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return students;
  } catch (error) {
    console.error("Error fetching students:", error);
    throw new Error("Failed to retrieve students");
  }
};

import { FieldValue } from "firebase-admin/firestore";

export async function assignStudentToClass(classId: string, studentIds: string[]) {
  const batch = adminDb.batch(); // Use batch for multiple updates

  try {
    for (const studentId of studentIds) {
      const studentRef = adminDb.collection("users").doc(studentId);
      
      batch.update(studentRef, {
        classIds: FieldValue.arrayUnion(classId), // ✅ Append classId to array
      });
    }

    await batch.commit(); // Execute all updates
    console.log(`Successfully assigned ${studentIds.length} students to class ${classId}`);
    return { success: true };
  } catch (error) {
    console.error("Error assigning students to class:", error);
    return { success: false, message: "Assignment failed" };
  }
}
