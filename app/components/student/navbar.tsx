"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/app/firebase/config";
import { signOut } from "firebase/auth";
import { FaSignOutAlt } from "react-icons/fa";
import Image from "next/image";
import { format } from "date-fns";

// ✅ Import a toast notification library
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // ✅ Check user authentication
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        checkAttendance(currentUser.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  const checkAttendance = async (studentId: string) => {
    try {
      const today = format(new Date(), "yyyy-MM-dd"); // Get today's date
      const response = await fetch(
        `/api/getStudentAttendance?studentId=${studentId}&date=${today}`
      );
      const data = await response.json();

      if (response.ok) {
        // ✅ If no attendance record for today, show absent notification
        if (!data.attendance || data.attendance.length === 0) {
          toast.error("🚨 You are marked absent today!", {
            position: "top-right",
            autoClose: 5000,
          });
        }
      } else {
        console.error("Failed to fetch attendance:", data.message);
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/pages/student");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <>
      <nav className="w-full fixed z-10 bg-white shadow-md py-2 px-4 flex justify-between items-center">
        <div className="text-xl font-bold text-[#7f56d8]">
          <Image
            alt="logo"
            width={50}
            height={50}
            src="/testpreppundits1.png"
          />
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition"
        >
          <FaSignOutAlt />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </nav>

      {/* ✅ Toast Notification Container */}
      <ToastContainer />
    </>
  );
}
