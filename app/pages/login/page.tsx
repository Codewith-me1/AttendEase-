"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth, signInWithPopup } from "..//..//firebase/config";
import { useEffect } from "react";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import Divider from "@/components/ui/divider";
import Image from "next/image";
import { CSSProperties } from "react";
import Alert from "@/app/components/popup/alert";
import { GithubAuthProvider, GoogleAuthProvider } from "firebase/auth";
import { setCookie } from "nookies";

export default function Component() {
  const [signInWithEmailAndPassword, user, loading, error] =
    useSignInWithEmailAndPassword(auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  // Helper function to clean up Firebase error messages
  const cleanErrorMessage = (message: string) =>
    message.replace(/Firebase: Error|\(auth\/|\)/g, "").trim();

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(email, password);
      if (userCredential) {
        console.log("Logged in successfully:", userCredential.user);
        const token = await userCredential.user.getIdToken();

        // Store token in cookies
        setCookie(null, "auth-token", token, {
          path: "/",
          maxAge: 60 * 60 * 24, // 1 day
        });

        router.push("/"); // Redirect to dashboard or desired page
      }
    } catch (loginError: any) {
      setErrorMessage(cleanErrorMessage(loginError.message));
      console.error("Failed to login:", loginError.message);
    }
  };

  // Reusable function for provider logins (Google and GitHub)
  const handleProviderLogin = async (Provider: any) => {
    const provider = new Provider();
    try {
      const userCredentials = await signInWithPopup(auth, provider);
      if (userCredentials) {
        console.log(
          "Logged in successfully:",
          userCredentials.user.displayName
        );
        const token = await userCredentials.user.getIdToken();

        // Store token in cookies
        setCookie(null, "auth-token", token, {
          path: "/",
          maxAge: 60 * 60 * 24, // 1 day
        });

        router.push("/"); // Redirect on successful login
      }
    } catch (error: any) {
      setErrorMessage(cleanErrorMessage(error.message));
    }
  };

  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const boxElement = boxRef.current;

    if (!boxElement) {
      return;
    }

    const updateAnimation = () => {
      const angle =
        (parseFloat(boxElement.style.getPropertyValue("--angle")) + 0.5) % 360;
      boxElement.style.setProperty("--angle", `${angle}deg`);
      requestAnimationFrame(updateAnimation);
    };

    requestAnimationFrame(updateAnimation);
  }, []);

  return (
    <div className="flex bg-[#1c1e31] h-full">
      <div className="container_1 w-[50%] h-full flex justify-center">
        <img width={1000} src="/images/wall.png" />
      </div>
      <div className="container_2 w-[50%] flex flex-col items-center bg-[#1c1e31] p-10">
        <div className="card1 text-center mt-10">
          <h1 className="text-3xl">Welcome!</h1>
          <p className="mt-5">How About You Quickly Enter Your Details</p>
        </div>
        <div className="card2 h-[90%]">
          <div
            ref={boxRef}
            style={
              {
                "--angle": "0deg",
                "--border-color":
                  "linear-gradient(var(--angle), #ffffff, #4b4b4b)",
                "--bg-color": "linear-gradient(#1c1e31, #4b4b4b)",
              } as CSSProperties
            }
            className="h-[90%] w-[30rem] p-[1px] rounded-2xl mt-10 flex flex-col justify-center border-2 border-[#0000] [background:padding-box_var(--bg-color),border-box_var(--border-color)]"
          >
            <Card className="h-full pt-5">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">Hi There,</CardTitle>
                <CardDescription>
                  Enter your email and password to log in to your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mt-5">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border-[#ffffff33]"
                      placeholder="m@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      className="border-[#ffffff33]"
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="buttonContainer">
                    <Button
                      type="submit"
                      onClick={handleLogin}
                      className="w-full text-white mt-5"
                      disabled={loading}
                    >
                      {loading ? "Logging in..." : "Login"}
                    </Button>
                  </div>

                  <p className="mt-4 pt-4 text-center text-sm">
                    Create a New Account?{" "}
                    <a
                      href="/pages/register"
                      className="text-primary font-medium hover:underline"
                    >
                      Signup
                    </a>
                  </p>

                  <Divider className="pt-5 text-center text-primary">
                    OR CONTINUE WITH
                  </Divider>

                  <div className="providerLogin flex justify-between gap-[1rem]">
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center glassyEffect"
                      onClick={() => handleProviderLogin(GoogleAuthProvider)}
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
                      onClick={() => handleProviderLogin(GithubAuthProvider)}
                    >
                      <Image
                        src="/icons/github.svg"
                        alt="GitHub Icon"
                        width={20}
                        height={20}
                        className="w-5 h-5 mr-2 text-white"
                      />
                      GitHub
                    </Button>
                  </div>
                  {errorMessage && <Alert page="Login" error={errorMessage} />}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
