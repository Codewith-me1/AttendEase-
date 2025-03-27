"use client";

import { useState } from "react";
import {
  FaChalkboardTeacher,
  FaClipboardList,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaCalendar,
} from "react-icons/fa";
import Link from "next/link";
import { auth } from "@/app/firebase/config";
import { useRouter } from "next/navigation";

const StudentSidebar = () => {
  const [active, setActive] = useState("Dashboard");
  const router = useRouter();

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/pages/student");
  };

  return (
    <div className="h-screen w-64 bg-[#7f56d8] text-white flex flex-col py-6 px-4">
      <h1 className="text-2xl font-bold text-center mb-8">Student Panel</h1>
      <nav className="flex flex-col gap-4">
        <SidebarItem
          name="Dashboard"
          icon={<FaClipboardList />}
          active={active}
          setActive={setActive}
        />
        <SidebarItem
          name="Attendance"
          icon={<FaChalkboardTeacher />}
          active={active}
          setActive={setActive}
        />

        <SidebarItem
          name="Calendar"
          icon={<FaCalendar />}
          active={active}
          setActive={setActive}
        />
      </nav>
      <div className="mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-white p-3 w-full hover:bg-purple-700 rounded"
        >
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </div>
  );
};

const SidebarItem = ({
  name,
  icon,
  active,
  setActive,
}: {
  name: string;
  icon: React.ReactNode;
  active: string;
  setActive: any;
}) => {
  return (
    <Link href={`/student/${name.toLowerCase().replace(" ", "-")}`} passHref>
      <div
        onClick={() => setActive(name)}
        className={`flex items-center gap-3 p-3 cursor-pointer rounded-md transition ${
          active === name ? "bg-purple-500" : "hover:bg-purple-600"
        }`}
      >
        {icon}
        <span>{name}</span>
      </div>
    </Link>
  );
};

export default StudentSidebar;
