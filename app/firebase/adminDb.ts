
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
