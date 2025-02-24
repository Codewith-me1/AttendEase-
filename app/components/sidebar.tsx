"use client";

import Link from "next/link";
import { useState } from "react";
import { FaChalkboardTeacher, FaTable, FaBars, FaTimes } from "react-icons/fa";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div
      className={`h-screen bg-[#7f56d8] text-white shadow-lg ${
        isOpen ? "w-64" : "w-20"
      } transition-all duration-300 p-4 flex flex-col`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="mb-5 text-white text-lg flex items-center justify-center p-2 rounded-md hover:bg-white hover:text-[#7f56d8] transition"
      >
        {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Sidebar Items */}
      <ul className="space-y-4">
        <li>
          <Link
            href="/teacher"
            className="flex items-center gap-3 text-lg p-3 rounded-md hover:bg-white hover:text-[#7f56d8] transition"
          >
            <FaChalkboardTeacher size={22} />
            {isOpen && "Create Class"}
          </Link>
        </li>
        <li>
          <Link
            href="/classes"
            className="flex items-center gap-3 text-lg p-3 rounded-md hover:bg-white hover:text-[#7f56d8] transition"
          >
            <FaTable size={22} />
            {isOpen && "Classes Table"}
          </Link>
        </li>
      </ul>

      {/* Footer */}
      <div
        className={`absolute bottom-5 left-0 w-full ${
          isOpen ? "text-center" : "text-left pl-2"
        }`}
      >
        <p className="text-gray-500 text-sm">{isOpen && "© 2024 BrainBites"}</p>
      </div>
    </div>
  );
}
