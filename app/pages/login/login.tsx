"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth, signInWithPopup } from "../../firebase/config";
import { useRouter } from "next/navigation";
import Alert from "@/app/components/popup/alert";
import {
  AuthProvider,
  GithubAuthProvider,
  GoogleAuthProvider,
} from "firebase/auth";
import { setCookie } from "nookies";
import { BiLockAlt, BiUser } from "react-icons/bi";
import Image from "next/image";

export default function Login() {
  const [signInWithEmailAndPassword, user, loading, error] =
    useSignInWithEmailAndPassword(auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const cleanErrorMessage = (message: string) =>
    message.replace(/Firebase: Error|\(auth\/|\)/g, "").trim();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(email, password);
      if (userCredential) {
        const token = await userCredential.user.getIdToken();
        setCookie(null, "auth-token", token, {
          path: "/",
          maxAge: 60 * 60 * 24,
        });
        router.push("/Authenticated/teacher");
      }
    } catch (loginError: any) {
      setErrorMessage(cleanErrorMessage(loginError.message));
    }
  };

  const handleProviderLogin = async (provider: AuthProvider) => {
    try {
      const userCredentials = await signInWithPopup(auth, provider);
      if (userCredentials) {
        const token = await userCredentials.user.getIdToken();
        setCookie(null, "auth-token", token, {
          path: "/",
          maxAge: 60 * 60 * 24,
        });
        router.push("/");
      }
    } catch (error: any) {
      setErrorMessage(cleanErrorMessage(error.message));
    }
  };

  return (
    <div className="relative space-y-8 w-full">
      <div className="space-y-4 mt-5 w-full max-w-md">
        <div className="relative">
          <BiUser className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400 text-xl" />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-[#363a54] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
            required
            placeholder="Email"
          />
        </div>
        <div className="relative">
          <BiLockAlt className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400 text-xl" />

          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-[#363a54] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
            required
            placeholder="Password"
          />
        </div>
        <Button
          type="submit"
          onClick={handleLogin}
          className="w-full text-white mt-5 text-lg bg-purple-500"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </Button>

        <div className="flex justify-between gap-4 mt-4">
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
        </div>
        {errorMessage && <Alert page="Login" error={errorMessage} />}
      </div>
    </div>
  );
}
