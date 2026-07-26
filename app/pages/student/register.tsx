"use client";

import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth, signInWithPopup } from "@/app/firebase/config";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { saveUserData } from "../../firebase/database";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { sendEmailVerification } from "firebase/auth";
import { BiMailSend, BiUser } from "react-icons/bi";
import { Eye, EyeClosed, Phone } from "lucide-react";
import { GithubAuthProvider, GoogleAuthProvider } from "firebase/auth";
import Alert from "@/app/components/popup/alert";
import { setCookie } from "nookies";
import { createUserInFirestore } from "@/app/firebase/database";
import { toast } from "react-hot-toast"; // Import toast for notifications
import { ToastContainer } from "react-toastify";

const StudentRegister = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  const [createUserWithEmailAndPassword, user, loading, error] =
    useCreateUserWithEmailAndPassword(auth);
  const router = useRouter();

  const validatePassword = (password: string) => {
    const minLength = /.{8,}/;
    const uppercase = /[A-Z]/;
    const lowercase = /[a-z]/;
    const number = /[0-9]/;
    const specialChar = /[!@#$%^&*]/;

    if (!minLength.test(password)) return "At least 8 characters required.";
    if (!uppercase.test(password))
      return "Include at least one uppercase letter.";
    if (!lowercase.test(password))
      return "Include at least one lowercase letter.";
    if (!number.test(password)) return "Include at least one number.";
    if (!specialChar.test(password))
      return "Include at least one special character (!@#$%^&*).";

    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "password") {
      setPasswordError(validatePassword(value));
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        formData.email,
        formData.password
      );
      const registeredUser = userCredential?.user;

      if (!registeredUser) throw new Error("User registration failed");

      await sendEmailVerification(registeredUser);
      toast.success("Verification email sent! Please check your inbox.");

      const idToken = await registeredUser.getIdToken();
      if (idToken) {
        setCookie(null, "auth-token", idToken, { path: "/", maxAge: 86400 });
        await createUserInFirestore(
          registeredUser,
          "student",
          formData.name,
          formData.phone
        );
        router.push("/student/dashboard");
        console.log("Account Created");
      } else {
        throw new Error("Failed to retrieve ID token");
      }
    } catch (error: any) {
      console.log(error);
      setErrorMessage(error.message);

      // Check if the error is about an existing email
      if (error.code === "auth/email-already-in-use") {
        toast.error(
          "Email already exists. Please use a different email address or login."
        );
        setErrorMessage("Email already in use.");
      } else {
        toast.error(error.message);
      }
    }
  };

  useEffect(() => {
    if (user) {
      saveUserData(
        { email: user.user.email, createdAt: new Date() },
        user?.user.uid || ""
      );
      router.push("/");
    }
  }, [user, router]);

  // Handle Firebase error messages
  useEffect(() => {
    if (error) {
      if (error.code === "auth/email-already-in-use") {
        toast.error(
          "Email already exists. Please use a different email address or login."
        );
      }
    }
  }, [error]);

  return (
    <div className="relative space-y-8 w-full">
      <div className="p-[1px] rounded-2xl border-2 border-[#0000]">
        <div className="space-y-4 relative">
          {/* Full Name Field */}
          <div className="relative">
            <BiUser className="absolute top-1/3 left-4 text-gray-400 text-xl" />
            <input
              name="name"
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-4 bg-[#363a54] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
            />
          </div>

          {/* Email Field */}
          <div className="relative">
            <BiMailSend className="absolute top-1/3  left-4 text-gray-400 text-xl" />
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
            <Phone className="absolute top-1/3  left-4 text-gray-400 text-xl" />
            <input
              name="phone"
              type="text"
              placeholder="+911234567890"
              value={formData.phone}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-4 bg-[#363a54] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
            />
          </div>

          {/* Password Field */}
          <div className="relative">
            {passwordVisible ? (
              <EyeClosed
                onClick={() => setPasswordVisible(false)}
                className="absolute top-1 left-4 text-gray-400 text-xl cursor-pointer"
              />
            ) : (
              <Eye
                onClick={() => setPasswordVisible(true)}
                className="absolute top-1/2 left-4 text-gray-400 text-xl cursor-pointer"
              />
            )}

            <input
              type={passwordVisible ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-4 bg-[#363a54] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
            />
            {passwordError && (
              <p className="text-red-500 text-sm">{passwordError}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="relative">
            {passwordVisible ? (
              <EyeClosed
                onClick={() => setPasswordVisible(false)}
                className="absolute top-1/2 left-4 text-gray-400 text-xl cursor-pointer"
              />
            ) : (
              <Eye
                onClick={() => setPasswordVisible(true)}
                className="absolute top-1/2 left-4 text-gray-400 text-xl cursor-pointer"
              />
            )}

            <input
              type={passwordVisible ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-[#363a54] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
            />
            {confirmPasswordError && (
              <p className="text-red-500 text-sm">{confirmPasswordError}</p>
            )}
          </div>
        </div>

        {/* Signup Button */}
        <div className="mt-6">
          <Button
            onClick={handleSignup}
            className="w-full text-white bg-purple-500 text-lg"
          >
            {loading ? "Signing up..." : "Register"}
          </Button>
        </div>

        {/* Error Message */}
        {errorMessage && <Alert page="Signup" error={errorMessage} />}
      </div>
      <ToastContainer />
    </div>
  );
};

export default StudentRegister;
