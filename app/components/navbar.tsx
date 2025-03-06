"use client";

import { useRouter } from "next/navigation";
import { auth } from "@/app/firebase/config";
import { signOut } from "firebase/auth";
import { FaSignOutAlt } from "react-icons/fa";
import Image from "next/image";

export default function Navbar() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <nav className="w-full fixed z-10 bg-white shadow-md py-2 px-4 flex justify-between items-center">
      <div className="text-xl font-bold text-[#7f56d8]">
        <Image alt="iamge" width={50} height={50} src="/testpreppundits1.png" />{" "}
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition"
      >
        <FaSignOutAlt />
        <span className="hidden sm:inline">Logout</span>
      </button>
    </nav>
  );
}
