// "use client";

// import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
// import { auth } from "@/app/firebase/config";
// import { useState, useEffect, useRef, CSSProperties } from "react";
// import { useRouter } from "next/navigation";
// import { saveUserData } from "../../firebase/database";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { createUserInFirestore } from "@/app/firebase/database";

// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";
// import Divider from "@/components/ui/divider";
// import Image from "next/image";
// import {
//   GoogleAuthProvider,
//   signInWithPopup,
//   GithubAuthProvider,
// } from "firebase/auth";
// import Alert from "@/app/components/popup/alert";
// import { setCookie } from "nookies";

// const MultiStepSignup = () => {
//   const [step, setStep] = useState(1);
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//     genres: [],
//   });

//   const [genres, setGenres] = useState<any[]>();
//   const boxRef = useRef(null);
//   const [errorMessage, setErrorMessage] = useState("");
//   const [createUserWithEmailAndPassword, user, loading, error] =
//     useCreateUserWithEmailAndPassword(auth);
//   const router = useRouter();

//   useEffect(() => {
//     const fetchGenres = async () => {
//       try {
//         const response = await fetch("/api/genres");
//         const data = await response.json();

//         setGenres(data.genres || []);
//       } catch (error) {
//         console.log("API ERROR" + error);
//       }
//     };
//     fetchGenres();
//   }, []);
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const handleGenreSelection = (genre: number) => {
//     setFormData((prevData) => {
//       const genres = prevData.genres.includes(genre)
//         ? prevData.genres.filter((g) => g !== genre)
//         : [...prevData.genres, genre];
//       return { ...prevData, genres };
//     });
//   };

//   const handleSignup = async () => {
//     try {
//       const userCredential = await createUserWithEmailAndPassword(
//         formData.email,
//         formData.password
//       );
//       const registeredUser = userCredential?.user;

//       // Fetch the auth token
//       const idToken = await registeredUser?.getIdToken();

//       // Set the auth token in cookies

//       setCookie(null, "auth-token", idToken, {
//         path: "/",
//         maxAge: 60 * 60 * 24, // 1 day
//       });

//       router.push("/");
//     } catch (error) {
//       setErrorMessage(error.message);
//     }
//   };
//   const handleProviderLogin = async (Provider) => {
//     const provider = new Provider();
//     try {
//       const result = await signInWithPopup(auth, provider);
//       const user = result.user;

//       // Get the authentication token
//       const idToken = await user.getIdToken();

//       // Set cookie with auth token
//       setCookie(null, "auth-token", idToken, {
//         path: "/",
//         maxAge: 60 * 60 * 24, // 1 day
//       });

//       await createUserInFirestore(user);

//       router.push("/");
//     } catch (error) {
//       setErrorMessage(error.message);
//     }
//   };

//   useEffect(() => {
//     if (user) {
//       saveUserData(user.user.uid, {
//         email: user.user.email,
//         genres: formData.genres,
//         createdAt: new Date(),
//       });
//       router.push("/");
//     }
//   }, [user, router, formData.genres]);

//   const nextStep = () => step < 3 && setStep(step + 1);
//   const prevStep = () => step > 1 && setStep(step - 1);

//   const renderStep = () => {
//     switch (step) {
//       case 1:
//         return (
//           <div>
//             <h2 className="text-xl font-bold">Step 1: Enter Your Details</h2>
//             <div className="space-y-4 mt-4">
//               <div>
//                 <Label htmlFor="email">Email</Label>
//                 <Input
//                   id="email"
//                   name="email"
//                   type="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   className="border-[#ffffff33]"
//                   required
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="password">Password</Label>
//                 <Input
//                   id="password"
//                   name="password"
//                   type="password"
//                   value={formData.password}
//                   onChange={handleChange}
//                   className="border-[#ffffff33]"
//                   required
//                 />
//               </div>
//             </div>
//             <Divider className="pt-5 text-center text-primary">
//               OR CONTINUE WITH
//             </Divider>

//             <div className="providerLogin flex justify-between gap-[1rem] mt-4">
//               <Button
//                 variant="outline"
//                 className="w-full flex items-center justify-center glassyEffect"
//                 onClick={() => handleProviderLogin(GoogleAuthProvider)}
//               >
//                 <Image
//                   src="/icons/google.svg"
//                   alt="Google Icon"
//                   width={20}
//                   height={20}
//                   className="w-5 h-5 mr-2"
//                 />
//                 Google
//               </Button>

//               <Button
//                 variant="outline"
//                 className="w-full flex items-center justify-center glassyEffect"
//                 onClick={() => handleProviderLogin(GithubAuthProvider)}
//               >
//                 <Image
//                   src="/icons/github.svg"
//                   alt="GitHub Icon"
//                   width={20}
//                   height={20}
//                   className="w-5 h-5 mr-2"
//                 />
//                 GitHub
//               </Button>
//             </div>
//           </div>
//         );
//       case 2:
//         return (
//           <div>
//             <h2 className="text-xl font-bold">Step 2: Select Your Genres</h2>
//             <div className="flex flex-wrap mt-4 gap-3">
//               {genres?.map((genre) => (
//                 <Button
//                   key={genre.id}
//                   className={
//                     formData.genres.includes(genre.id) ? "" : "customBtn"
//                   }
//                   onClick={() => handleGenreSelection(genre.id)}
//                   variant="secondary"
//                 >
//                   {genre.name}
//                 </Button>
//               ))}
//             </div>
//           </div>
//         );
//       case 3:
//         return (
//           <div>
//             <h2 className="text-xl font-bold">Step 3: Review & Submit</h2>
//             <div className="mt-4 space-y-2">
//               <p>
//                 <strong>Email:</strong> {formData.email}
//               </p>
//               <p>
//                 <strong>Genres:</strong>{" "}
//                 {formData.genres
//                   .map((genreId) => {
//                     const genre = genres?.find((g) => g.id === genreId);
//                     return genre ? genre.name : null;
//                   })
//                   .filter(Boolean) // Remove null values if any ID doesn't match
//                   .join(", ")}
//               </p>
//             </div>
//             <div className="mt-6">
//               <Button
//                 onClick={handleSignup}
//                 disabled={loading}
//                 className="w-full text-white"
//               >
//                 {loading ? "Signing up..." : "Submit"}
//               </Button>
//             </div>
//           </div>
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="flex justify-center bg-[#1c1e31] min-h-screen">
//       <div className="w-[50%] flex flex-col items-center bg-[#1c1e31] p-10 justify-center">
//         <div className="text-center mt-10">
//           <h1 className="text-3xl">Welcome!</h1>
//           <p className="mt-5">How About You Quickly Enter Your Details</p>
//         </div>
//         <div className="h-[90%] mt-10">
//           <div
//             ref={boxRef}
//             style={
//               {
//                 "--angle": "0deg",
//                 "--border-color":
//                   "linear-gradient(var(--angle), #ffffff, #4b4b4b)",
//                 "--bg-color": "linear-gradient(#1c1e31, #4b4b4b)",
//               } as CSSProperties
//             }
//             className="h-[90%] w-[30rem] p-[1px] rounded-2xl flex flex-col justify-center border-2 border-[#0000] [background:padding-box_var(--bg-color),border-box_var(--border-color)]"
//           >
//             <Card className="h-full pt-5">
//               <CardHeader>
//                 <CardTitle className="text-2xl">Create Your Account</CardTitle>
//                 <CardDescription>
//                   Follow the steps to create your account
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 {renderStep()}

//                 <div className="flex justify-between mt-4">
//                   {step > 1 && (
//                     <Button className="text-white mt-5" onClick={prevStep}>
//                       Back
//                     </Button>
//                   )}
//                   {step < 3 && (
//                     <Button onClick={nextStep} className="text-white mt-5">
//                       Next
//                     </Button>
//                   )}
//                 </div>
//                 {errorMessage && <Alert page="Signup" error={errorMessage} />}
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MultiStepSignup;
import React from "react";

const Page = () => {
  return <div>Page</div>;
};

export default Page;
