"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow">
        <div className="text-2xl font-bold text-[#7f56d8]">
          Attendance Portal
        </div>
        <nav className="space-x-4">
          <Button className="bg-[#7f56d8] hover:bg-white  hover:text-[#7f56d8]">
            <Link href="/">Login/Signup</Link>
          </Button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center text-center">
        <Image
          src="/hero.jpg" // Replace with your hero image path
          alt="Hero Background"
          fill
          className="object-cover opacity-70"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white drop-shadow-lg">
            Welcome to Attendance Portal
          </h1>
          <p className="mt-4 text-xl md:text-2xl text-white drop-shadow-lg">
            Login/Signup to Start Marking Your Attendance
          </p>
          <Link href="/student/dashboard">
            <button className="mt-8 px-8 py-4 bg-[#7f56d8] text-white rounded-full text-lg hover:bg-[#6e48c9] transition">
              Get Started
            </button>
          </Link>
        </div>
      </section>

      {/* About Section */}

      {/* Footer */}
      <footer className="px-6 py-4 bg-white shadow mt-12 text-center">
        <p className="text-gray-600">
          &copy; {new Date().getFullYear()} Test Prep Pundits
        </p>
      </footer>
    </div>
  );
}
