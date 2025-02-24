"use client";
import { useState } from "react";
import { BiUser, BiLockAlt, BiEnvelope } from "react-icons/bi";

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  return (
    <div className="min-h-screen bg-[#1c1e31] flex items-center justify-center p-4">
      {/* Increased width container */}
      <div className="relative w-full max-w-4xl bg-[#2a2d47] rounded-2xl overflow-hidden shadow-xl">
        {/* Slider Container */}
        <div
          className={`relative h-[580px] transition-transform duration-500 ease-in-out ${
            !isLogin ? "translate-x-[-100%]" : "translate-x-0"
          }`}
        >
          {/* Login Form - Increased padding */}
          <div className="absolute flex w-full h-full justify-end px-16 py-16 transition-opacity duration-300">
            <div className="form_container">
              <h2 className="text-4xl font-bold text-white mb-10">
                Welcome Back
              </h2>
              <form className="space-y-8">
                <div className="relative">
                  <BiUser className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400 text-xl" />
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full pl-12 pr-4 py-4 bg-[#363a54] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
                  />
                </div>

                <div className="relative">
                  <BiLockAlt className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400 text-xl" />
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full pl-12 pr-4 py-4 bg-[#363a54] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
                  />
                </div>

                <button className="w-full py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors text-lg font-semibold">
                  Sign In
                </button>

                <p className="text-gray-400 text-center mt-8 text-lg">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    className="text-purple-400 hover:text-purple-300 font-semibold"
                    onClick={() => setIsLogin(false)}
                  >
                    Sign Up
                  </button>
                </p>
              </form>
            </div>
          </div>

          {/* Register Form - Increased padding */}
          <div className="absolute w-full h-full flex justify-start px-16 py-16 left-full transition-opacity duration-300">
            <div className="register_container">
              <h2 className="text-4xl font-bold text-white mb-10">
                Create Account
              </h2>
              <form className="space-y-8">
                <div className="relative">
                  <BiUser className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400 text-xl" />
                  <input
                    type="text"
                    placeholder="Name"
                    className="w-full pl-12 pr-4 py-4 bg-[#363a54] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
                  />
                </div>

                <div className="relative">
                  <BiEnvelope className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400 text-xl" />
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full pl-12 pr-4 py-4 bg-[#363a54] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
                  />
                </div>

                <div className="relative">
                  <BiLockAlt className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400 text-xl" />
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full pl-12 pr-4 py-4 bg-[#363a54] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
                  />
                </div>

                <button className="w-full py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors text-lg font-semibold">
                  Sign Up
                </button>

                <p className="text-gray-400 text-center mt-8 text-lg">
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="text-purple-400 hover:text-purple-300 font-semibold"
                    onClick={() => setIsLogin(true)}
                  >
                    Sign In
                  </button>
                </p>
              </form>
            </div>
          </div>
        </div>

        {/* Wider Slider Overlay */}
        <div
          className={`absolute top-0 left-0 w-1/2 h-full bg-gradient-to-br from-purple-600 to-purple-400 transition-transform duration-500 ease-in-out ${
            !isLogin ? "translate-x-full" : "translate-x-0"
          }`}
        >
          <div className="relative h-full flex items-center justify-center p-12">
            <div className="text-center text-white space-y-8">
              <h2 className="text-4xl font-bold">
                {isLogin ? "New Here?" : "Welcome Back!"}
              </h2>
              <p className="text-lg leading-relaxed">
                {isLogin
                  ? "Sign up and discover a world of possibilities with our platform"
                  : "Sign in to access your personalized dashboard and features"}
              </p>
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="border-2 border-white rounded-xl px-12 py-4 text-lg hover:bg-white hover:text-purple-600 transition-colors font-semibold"
              >
                {isLogin ? "Create Account" : "Sign In Now"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
