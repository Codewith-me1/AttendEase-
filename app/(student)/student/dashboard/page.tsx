"use client";

import { FaChartPie, FaUsers, FaClipboardList } from "react-icons/fa";
import { useEffect, useState } from "react";
import { auth } from "@/app/firebase/config";
import { getUserData } from "@/app/firebase/database";
import Router, { useRouter } from "next/navigation";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  interface AttendanceRecord {
    id: string;
    studentName: string;
    timestamp: string;
  }

  const [user, setUser] = useState<any>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

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

  const totalCapacity = 50;
  const attendedCount = attendance.length;
  const absentCount = totalCapacity - attendedCount;

  // Data for the Pie Chart
  const attendanceData = [
    { name: "Attended", value: attendedCount },
    { name: "Absent", value: absentCount > 0 ? absentCount : 0 },
  ];
  const COLORS = ["#7f56d8", "#e0e0e0"];

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

      <div className="bg-white p-6 rounded-md shadow-md text-center w-96">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Attendance Distribution
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={attendanceData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {attendanceData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#7f56d8] rounded-full"></div>
            <p>Attended</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#e0e0e0] rounded-full"></div>
            <p>Absent</p>
          </div>
        </div>
      </div>
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
