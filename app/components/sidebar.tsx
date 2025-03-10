"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  FaChalkboardTeacher,
  FaTable,
  FaBars,
  FaTimes,
  FaUser,
} from "react-icons/fa";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);

  // Update main content margin when sidebar state changes
  useEffect(() => {
    const mainContent = document.getElementById("main-content");
    if (mainContent) {
      mainContent.style.marginLeft = isOpen ? "16rem" : "5rem"; // 16rem = 64px, 5rem = 20px
    }
  }, [isOpen]);

  return (
    <div
      className={`fixed h-screen bg-[#7f56d8] text-white shadow-lg z-10 pt-10 ${
        isOpen ? "w-64" : "w-20"
      } transition-all duration-300 flex flex-col`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="mb-5 text-white text-lg flex items-center justify-center p-2 mt-5 rounded-md hover:bg-white hover:text-[#7f56d8] transition"
      >
        {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Sidebar Items */}
      <ul className="space-y-4 p-4">
        <li>
          <Link
            href="/Authenticated/teacher"
            className="flex items-center gap-3 text-lg p-3 rounded-md hover:bg-white hover:text-[#7f56d8] transition"
          >
            <FaChalkboardTeacher size={22} />
            {isOpen && "Create Class"}
          </Link>
        </li>
        <li>
          <Link
            href="/Authenticated/classes"
            className="flex items-center gap-3 text-lg p-3 rounded-md hover:bg-white hover:text-[#7f56d8] transition"
          >
            <FaTable size={22} />
            {isOpen && "Classes Table"}
          </Link>
        </li>

        <li>
          <Link
            href="/Authenticated/student"
            className="flex items-center gap-3 text-lg p-3 rounded-md hover:bg-white hover:text-[#7f56d8] transition"
          >
            <FaUser size={22} />
            {isOpen && "Students"}
          </Link>
        </li>
      </ul>

      {/* Footer */}
      <div
        className={`absolute bottom-5 left-0 w-full ${
          isOpen ? "text-center" : "text-left pl-2"
        }`}
      ></div>
    </div>
  );
}
