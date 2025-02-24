// "use client";

// import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
// import { auth } from "@/app/firebase/config";
// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { saveUserData } from "../../firebase/database";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { setCookie } from "nookies";
// import Alert from "@/app/components/popup/alert";

// const Register = () => {
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//   });
//   const [errorMessage, setErrorMessage] = useState("");
//   const [createUserWithEmailAndPassword, user, loading] =
//     useCreateUserWithEmailAndPassword(auth);
//   const router = useRouter();

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const handleSignup = async () => {
//     try {
//       const userCredential = await createUserWithEmailAndPassword(
//         formData.email,
//         formData.password
//       );
//       const registeredUser = userCredential?.user;
//       const idToken = await registeredUser?.getIdToken();

//       setCookie(null, "auth-token", idToken, {
//         path: "/",
//         maxAge: 60 * 60 * 24, // 1 day
//       });

//       router.push("/");
//     } catch (error) {
//       setErrorMessage(error.message);
//     }
//   };

//   useEffect(() => {
//     if (user) {
//       saveUserData(user.user.uid, {
//         email: user.user.email,
//         createdAt: new Date(),
//       });
//       router.push("/");
//     }
//   }, [user, router]);

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
//       <div className="w-full max-w-md p-6 bg-white shadow-md rounded-lg">
//         <h2 className="text-2xl font-bold text-center mb-4">Register</h2>
//         <div className="space-y-4">
//           <div>
//             <Label htmlFor="email">Email</Label>
//             <Input
//               id="email"
//               name="email"
//               type="email"
//               value={formData.email}
//               onChange={handleChange}
//               required
//             />
//           </div>
//           <div>
//             <Label htmlFor="password">Password</Label>
//             <Input
//               id="password"
//               name="password"
//               type="password"
//               value={formData.password}
//               onChange={handleChange}
//               required
//             />
//           </div>
//         </div>
//         <Button
//           onClick={handleSignup}
//           disabled={loading}
//           className="w-full mt-4"
//         >
//           {loading ? "Signing up..." : "Register"}
//         </Button>
//         {errorMessage && <Alert page="Signup" error={errorMessage} />}
//       </div>
//     </div>
//   );
// };

// export default Register;
