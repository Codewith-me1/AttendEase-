"use client";

import { FaChartPie, FaUsers, FaClipboardList } from "react-icons/fa";
import { useEffect, useState } from "react";
import { auth } from "@/app/firebase/config";
import { getUserData } from "@/app/firebase/database";
import Router, { useRouter } from "next/navigation";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // ✅ Retrieve user role from Firestore
        const userData = await getUserData(currentUser.uid);
        if (userData) {
          setRole(userData.role);

          if (userData.role !== "student") {
            alert("Access denied: Only students can access this page.");
            router.push("/login");
          } else {
            console.log("Logged iN");
          }
        } else {
          alert("User data not found.");
          router.push("/login");
        }
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6">
        <StatCard title="Joined Classes" value="1" icon={<FaUsers />} />
        <StatCard title="Leaves" value="1" icon={<FaChartPie />} />
        <StatCard
          title="Total Attendance"
          value="321"
          icon={<FaClipboardList />}
        />
      </div>

      {/* Charts */}
    </div>
  );
}

const StatCard = ({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) => {
  return (
    <div className="bg-white p-6 rounded-md shadow-md flex items-center gap-4">
      <div className="text-3xl text-[#7f56d8]">{icon}</div>
      <div>
        <p className="text-gray-600">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
};
