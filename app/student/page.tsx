"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/firebase/config";

function StudentComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [classId, setClassId] = useState<string | null>(null);
  const [className, setClassName] = useState<string | null>(null);
  const [studentName, setStudentName] = useState("");
  const [marked, setMarked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        console.log("User is not authenticated");
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
        setStudentName(user.displayName || user.email?.split("@")[0] || "");
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const id = searchParams.get("classId");
    setClassId(id);

    if (id) {
      fetchClassName(id);
    }
  }, [searchParams]);

  const fetchClassName = async (classId: string) => {
    try {
      const response = await fetch(`/api/getClassName?classId=${classId}`);
      const data = await response.json();

      if (response.ok) {
        setClassName(data.name);
      } else {
        toast.error("Failed to fetch class name.", { position: "top-center" });
      }
    } catch (error) {
      toast.error("Error fetching class name.", { position: "top-center" });
    }
  };

  const markAttendance = async () => {
    if (!classId || !studentName.trim()) {
      toast.error("Class ID or Student Name is missing!", {
        position: "top-center",
      });
      return;
    }

    try {
      const user = auth.currentUser;
      const studentId = user ? user.uid : null;

      const localTimestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

      const response = await fetch("/api/saveAttendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId,
          studentName,
          studentId,
          timestamp: localTimestamp,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMarked(true);
        toast.success("Attendance Marked Successfully!", {
          position: "top-center",
        });
      } else {
        toast.error(result.message || "Failed to mark attendance!", {
          position: "top-center",
        });
      }
    } catch (error) {
      toast.error("Something went wrong!", { position: "top-center" });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <ToastContainer />

      <div className="bg-white shadow-lg rounded-lg p-6 w-96">
        <h1 className="text-2xl font-bold text-center text-blue-600 mb-4">
          Student Panel
        </h1>

        <p className="text-center text-gray-600 mb-4">
          Class Name:{" "}
          <span className="font-semibold">
            {className ? className : "Loading..."}
          </span>
        </p>

        <input
          type="text"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          className="border p-3 w-full rounded-md bg-gray-200 text-center text-lg"
          placeholder="Enter your name"
        />

        <button
          onClick={markAttendance}
          disabled={marked}
          className={`mt-4 w-full p-3 rounded-md text-lg font-semibold transition ${
            marked
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-500 text-white hover:bg-green-600"
          }`}
        >
          {marked ? "Attendance Marked" : "Mark Attendance"}
        </button>

        {marked && (
          <p className="mt-4 text-green-600 text-center font-semibold">
            ✅ Attendance Marked!
          </p>
        )}
      </div>
    </div>
  );
}

export default function Student() {
  return (
    <Suspense
      fallback={<div className="text-center mt-10 text-lg">Loading...</div>}
    >
      <StudentComponent />
    </Suspense>
  );
}
