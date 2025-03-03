"use client";

import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth, signInWithPopup } from "@/app/firebase/config";
import { useState, useEffect, useRef, CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { saveUserData } from "../../firebase/database";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { createUserInFirestore } from "@/app/firebase/database";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Alert from "@/app/components/popup/alert";
import { setCookie } from "nookies";
import { GithubAuthProvider, GoogleAuthProvider } from "firebase/auth";
import {
  BiHappyHeartEyes,
  BiLockAlt,
  BiMailSend,
  BiUser,
} from "react-icons/bi";
import { Eye, EyeClosed } from "lucide-react";
import { AuthProvider } from "firebase/auth";

const StudentRegister = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    genres: [],
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [createUserWithEmailAndPassword, user, loading, error] =
    useCreateUserWithEmailAndPassword(auth);
  const router = useRouter();
  const [password, TogglePassword] = useState(false);
  const boxRef = useRef(null);
  const [passwordError, setPasswordError] = useState("");

  const validatePassword = (password: string) => {
    const minLength = /.{8,}/;
    const uppercase = /[A-Z]/;
    const lowercase = /[a-z]/;
    const number = /[0-9]/;
    const specialChar = /[!@#$%^&*]/;

    if (!minLength.test(password))
      return "Password must be at least 8 characters long.";
    if (!uppercase.test(password))
      return "Password must contain at least one uppercase letter.";
    if (!lowercase.test(password))
      return "Password must contain at least one lowercase letter.";
    if (!number.test(password))
      return "Password must contain at least one number.";
    if (!specialChar.test(password))
      return "must contain at least one (!@#$%^&*).";

    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [e.target.name]: e.target.value });

    if (name === "password") {
      const error = validatePassword(value);
      setPasswordError(error);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(
        formData.email,
        formData.password
      );
      const registeredUser = userCredential?.user;

      if (!registeredUser) {
        throw new Error("User registration failed");
      }

      const idToken = await registeredUser?.getIdToken();

      if (idToken) {
        setCookie(null, "auth-token", idToken, {
          path: "/",
          maxAge: 60 * 60 * 24,
        });

        await createUserInFirestore(registeredUser, "student", formData.name);
        router.push("/");
        console.log("Account Created");
      } else {
        throw new Error("Failed to retrieve ID token");
      }
    } catch (error: any) {
      console.log(error);
      setErrorMessage(error.message);
    }
  };

  const handleProviderLogin = async (provider: AuthProvider) => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Get the authentication token
      const idToken = await user.getIdToken();

      // Set cookie with auth token
      setCookie(null, "auth-token", idToken, {
        path: "/",
        maxAge: 60 * 60 * 24, // 1 day
      });

      await createUserInFirestore(
        user,
        "student",
        user.displayName || user.email?.split("@")[0]
      );

      router.push("/Authenticated/teacher");
    } catch (error: any) {
      setErrorMessage(error.message);
    }
  };
  useEffect(() => {
    if (user) {
      saveUserData(
        {
          email: user.user.email,
          createdAt: new Date(),
        },
        user?.user.uid || "" // Provide a fallback
      );
      router.push("/");
    }
  }, [user, router]);

  return (
    <div className="relative  space-y-8 w-full">
      <div className="p-[1px] rounded-2xl border-2 border-[#0000] [background:padding-box_var(--bg-color),border-box_var(--border-color)]">
        <div className="space-y-4">
          <div className="relative">
            <BiUser className="absolute top-8 left-4 transform -translate-y-1/2 text-gray-400 text-xl" />
            <input
              name="name"
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-4 bg-[#363a54] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
            />
          </div>
          <div className="relative">
            <BiMailSend className="absolute top-8 left-4 transform -translate-y-1/2 text-gray-400 text-xl" />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-4 bg-[#363a54] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
            />
          </div>
          <div className="relative">
            {password === true ? (
              <EyeClosed
                onClick={() => {
                  TogglePassword(!password);
                }}
                className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400 text-xl"
              />
            ) : (
              <Eye
                onClick={() => {
                  TogglePassword(!password);
                }}
                className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400 text-xl"
              />
            )}

            <input
              type={password === true ? "password" : "text"}
              name="password"
              placeholder="Password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-4 bg-[#363a54] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
            />
            {passwordError && (
              <p className="text-red-500 text-sm">{passwordError}</p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <Button
            onClick={handleSignup}
            className="w-full text-white bg-purple-500 text-lg"
          >
            {loading ? "Signing up..." : "Register"}
          </Button>
        </div>
        {/* <div className="providerLogin flex justify-between gap-[1rem] mt-4">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center glassyEffect"
            onClick={() => handleProviderLogin(new GoogleAuthProvider())}
          >
            <Image
              src="/icons/google.svg"
              alt="Google Icon"
              width={20}
              height={20}
              className="w-5 h-5 mr-2"
            />
            Google
          </Button>

          <Button
            variant="outline"
            className="w-full flex items-center justify-center glassyEffect"
            onClick={() => handleProviderLogin(new GithubAuthProvider())}
          >
            <Image
              src="/icons/github.svg"
              alt="GitHub Icon"
              width={20}
              height={20}
              className="w-5 h-5 mr-2"
            />
            GitHub
          </Button>
        </div> */}

        {errorMessage && <Alert page="Signup" error={errorMessage} />}
      </div>
    </div>
  );
};

export default StudentRegister;
