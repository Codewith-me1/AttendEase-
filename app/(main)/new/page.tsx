// "use client";

// import SendEmail from "@/app/components/email/email";
// import React, { useEffect, useState } from "react";
// import { auth } from "@/app/firebase/config";
// import { getUserData } from "@/app/firebase/database";
// import { useRouter } from "next/navigation";

// const Page = () => {
//   const [user, setUser] = useState<any>(null);
//   const [userId, setUserId] = useState("");
//   const router = useRouter();
//   useEffect(() => {
//     const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
//       if (currentUser) {
//         setUser(currentUser);

//         // ✅ Retrieve user role from Firestore
//         const userData = await getUserData(currentUser.uid);
//         console.log(userData);
//         setUserId(userData.uid);
//       } else {
//         router.push("/Authenticated/teacher");
//       }
//     });

//     return () => unsubscribe();
//   }, [router]);

//   return (
//     <div>
//       <SendEmail userId={userId} />
//     </div>
//   );
// };

// export default Page;

import React from "react";

const page = () => {
  return <div>page</div>;
};

export default page;
