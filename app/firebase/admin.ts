


import admin from "firebase-admin";

// Check if the Firebase Admin app is already initialized
if (!admin.apps.length) {
  admin.initializeApp({ 
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_PROJECTID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_ID?.replace(/\\n/g, "\n"),
    }),
  });
}

// Export the admin auth instance for use in other files
export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
// Optional: Export the entire admin instance if needed

export const setAdminClaim = async (uid:string) => {
  try {
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    console.log(`Admin claim added to user ${uid}`);
  } catch (error) {
    console.error("Error setting custom claims:", error);
    throw error;
  }
};

