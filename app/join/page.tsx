"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function JoinComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [className, setClassName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Prefill the code from the shared link (?code=XXXX) and remember the
  // student's email locally so returning is effortless.
  useEffect(() => {
    const urlCode = searchParams.get("code");
    if (urlCode) setCode(urlCode.toUpperCase());

    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("classroom_email");
      if (saved) setEmail(saved);
    }
  }, [searchParams]);

  // Look up the class name so the student sees what they're joining.
  useEffect(() => {
    const lookup = async () => {
      if (code.trim().length < 4) {
        setClassName(null);
        return;
      }
      try {
        const res = await fetch(`/api/getClassByCode?code=${encodeURIComponent(code.trim())}`);
        const data = await res.json();
        setClassName(res.ok ? data.name : null);
      } catch {
        setClassName(null);
      }
    };
    lookup();
  }, [code]);

  const handleJoin = async () => {
    if (!code.trim() || !email.trim()) {
      toast.error("Please enter the class code and your email.", { position: "top-center" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/joinClass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), email: email.trim(), name: name.trim() }),
      });
      const data = await res.json();

      if (res.ok) {
        if (typeof window !== "undefined") {
          window.localStorage.setItem("classroom_email", data.email);
        }
        toast.success(`Joined ${data.name}!`, { position: "top-center" });
        router.push(
          `/classroom?code=${encodeURIComponent(data.joinCode)}&email=${encodeURIComponent(data.email)}`
        );
      } else {
        toast.error(data.error || "Could not join the class.", { position: "top-center" });
      }
    } catch {
      toast.error("Something went wrong. Please try again.", { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <ToastContainer />
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-[#7f56d8] mb-2 text-center">Join a Class</h1>
        <p className="text-center text-gray-500 mb-6">
          Enter the class code and your email — no account needed.
        </p>

        {className && (
          <div className="mb-4 rounded-md bg-purple-50 border border-purple-200 p-3 text-center">
            <p className="text-sm text-gray-600">You&apos;re joining</p>
            <p className="text-lg font-semibold text-[#7f56d8]">{className}</p>
          </div>
        )}

        <label className="block text-sm font-medium text-gray-600 mb-1">Class Code</label>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="e.g. AB2K9P"
          className="border p-3 w-full rounded-md mb-4 tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-[#7f56d8]"
        />

        <label className="block text-sm font-medium text-gray-600 mb-1">Your Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="border p-3 w-full rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-[#7f56d8]"
        />

        <label className="block text-sm font-medium text-gray-600 mb-1">Your Name (optional)</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name"
          className="border p-3 w-full rounded-md mb-6 focus:outline-none focus:ring-2 focus:ring-[#7f56d8]"
        />

        <button
          onClick={handleJoin}
          disabled={loading}
          className={`w-full p-3 rounded-md text-lg font-semibold text-white transition ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#7f56d8] hover:bg-[#6e48c9]"
          }`}
        >
          {loading ? "Joining..." : "Join Class"}
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already joined?{" "}
          <button
            onClick={() =>
              router.push(email ? `/classroom?email=${encodeURIComponent(email.trim())}` : "/classroom")
            }
            className="text-[#7f56d8] font-semibold hover:underline"
          >
            View your classes
          </button>
        </p>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div className="text-center mt-10 text-lg">Loading...</div>}>
      <JoinComponent />
    </Suspense>
  );
}
