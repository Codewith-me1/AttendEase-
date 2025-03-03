import { doc , getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, deleteField, Timestamp } from "firebase/firestore";

import { db } from './config'
import { User , updateProfile } from "firebase/auth";




interface UserData {
  
  email:string|null;
  createdAt:Date | null;
 

}




export const saveUserData  = async(userData:UserData,userId?:string)=>{

  if (!userId) {
    throw new Error("Invalid user ID");
  }

    try{ 
        await setDoc(doc(db, "users", userId), userData);
        console.log("User Added Successfully")
    }
    catch(error){
        console.log("There has been some error" + error)
    }

}



export const addLikeData = async (userId?:string, likedId?:string,type?:string) => {
  
  try {
    if (!userId) {
      throw new Error("Invalid user ID");
    }
  
    // Reference the specific user's document
    const userDocRef = doc(db, "users", userId);

    // Update the 'Liked' field in the user's document
    await updateDoc(userDocRef, {
      Liked: arrayUnion({ID:likedId,Type:type}), // Add the likedId to the "Liked" array field
    });

    console.log(`Successfully added ${likedId} to the Liked array`);
  } catch (error:any) {
    if (error.code === "not-found") {
      console.error("Document does not exist.");
    } else {
      console.error("Error updating document: ", error.message);
    }
  }
};



export const addGenreData = async (userId?:string, genreDataArray:[]=[]) => {
    try {
      if (!userId) {
        throw new Error("Invalid user ID");
      }
    
      // Use a batch update to add each genre individually to ensure no duplicates
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        genres: arrayUnion(...genreDataArray) // Spread array to add each item separately
      });
      console.log('Genres added successfully');
    } catch (error) {
      console.error("There was an error adding genres: ", error);
    }
  };


  interface Like{
    ID:string;
    Type:string;
  }


  
  export const removeLike = async (  likeId: string,  type: string,userId?: string) => {
    try {
      if (!userId) {
        throw new Error("Invalid user ID");
      }
  
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
  
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const likedArray: Like[] = userData.Liked || []; // Explicitly typing as `Like[]`
  
        const updatedLikes = likedArray.filter((like) => like.ID !== likeId || like.Type !== type);
  
        await updateDoc(userRef, {
          Liked: updatedLikes,
        });
  
        console.log(`Like with ID ${likeId} has been removed for user ${userId}`);
      } else {
        console.log("User not found");
      }
    } catch (error) {
      console.error("Error removing like:", error);
      throw new Error("Failed to remove like. Please try again.");
    }
  };
  



  export const getUserLikes = async (uid?:string) => {

    if (!uid) {
      throw new Error("Invalid user ID");
    }
  

    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
  
    if (!docSnap.exists()) {
      throw new Error("No such document!");
    }
    return docSnap.data().Liked || [];
  };



  export const createTeacherInFirestore = async (user:User,) => {
    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        
        createdAt: new Date().toISOString(),
      }, { merge: true }); // Merge to prevent overwriting existing data
      console.log("User added/updated in Firestore");
    } catch (error) {
      console.error("Error creating user in Firestore: ", error);
    }
  };

  export const createUserInFirestore = async (user: User, role: string,name:string|any) => {
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
  
      // ✅ Set default values if missing (for email/password users)
      // Default name from email
      const displayName = name || user.displayName || user.email?.split("@")[0];
      const photoURL = user.photoURL || "https://via.placeholder.com/150"; // Default avatar
  
      // ✅ If email/password signup, update Firebase profile
      if (!user.displayName) {
        await updateProfile(user, { displayName: name, photoURL });
      }
  
      // ✅ Save user data in Firestore
      await setDoc(userRef, {
        uid: user.uid,
        name:displayName,
        email: user.email,
        photoURL,
        role,
        createdAt: new Date().toISOString(),
      }, { merge: true }); // Merge to prevent overwriting existing data
      
      console.log("User added/updated in Firestore");
    } catch (error) {
      console.error("Error creating user in Firestore: ", error);
    }
  };


  



  export const createWatchlist = async (watchId: string, type: string, userId?: string) => {
    try {
        if (!userId) {
            throw new Error("Invalid user ID");
        }

        // Reference the specific user's document
        const userDocRef = doc(db, "users", userId);

        // Update the 'Watchlist' field in the user's document
        await updateDoc(userDocRef, {
            Watchlist: arrayUnion({ ID: watchId, Type: type }),
        });

        console.log(`Successfully added ${watchId} to the Watchlist`);
    } catch (error: any) {
        if (error.code === "not-found") {
            console.error("Document does not exist.");
        } else {
            console.error("Error updating document: ", error.message);
        }
    }
};

  


  

  interface WatchlistItem{
    ID:string;
    Type:string;
  }

  export const removeFromWatchlist = async ( watchlistId: string, type: string, userId?: string) => {
    try {
      if (!userId) {
        throw new Error("Invalid user ID");
      }
  
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
  
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const watchlist: WatchlistItem[] = userData.Watchlist || []; // Ensure it's an array
  
        const updatedWatchlist = watchlist.filter(
          (item) => item.ID !== watchlistId || item.Type !== type
        );
  
        await updateDoc(userRef, {
          Watchlist: updatedWatchlist,
        });
  
        console.log(`Item with ID ${watchlistId} has been removed from Watchlist for user ${userId}`);
      } else {
        console.log("User not found");
      }
    } catch (error) {
      console.error("Error removing item from Watchlist:", error);
      throw new Error("Failed to remove item from Watchlist. Please try again.");
    }
  };
  

  
export const getUserWatchlist = async (userId?:string) => {
  if (!userId) {
    throw new Error("Invalid user ID");
  }


  const docRef = doc(db, "users", userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data().Watchlist || []; 
  } else {
    throw new Error("User document not found");
  }
};



export const getUserData = async (userId?:string)=>{
  if(!userId){
    throw new Error("Invalid User Id ")

  }

  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  
  if (userSnap.exists()) {
    return userSnap.data() || []; 
  } else {
    throw new Error("User document not found");
  }


}