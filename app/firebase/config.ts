
import { initializeApp ,getApps, getApp} from "firebase/app";
import { getAuth, GoogleAuthProvider,signInWithPopup } from "firebase/auth";
import { getFirestore } from "firebase/firestore";



const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECTID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDERID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APPID,

};



// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig):getApp();
const provider = new GoogleAuthProvider
const auth = getAuth(app)
const db = getFirestore(app)



export {app,provider,signInWithPopup,auth,db}