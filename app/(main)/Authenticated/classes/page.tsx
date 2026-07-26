"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FaDownload,
  FaChalkboardTeacher,
  FaTable,
  FaUsers,
} from "react-icons/fa";
import fileDownload from "js-file-download";
import { auth } from "@/app/firebase/config";
import { getUserData } from "@/app/firebase/database";
import { useRouter } from "next/navigation";

interface Class {
  id: string;
  name: string;
  createdAt: string;
}

export default function Dashboard() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  const [user, setUser] = useState<any>(null);

  // ✅ Fetch current teacher's userId

  // ✅ Fetch current user ID on mount
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // ✅ Retrieve user role from Firestore
        const userData = await getUserData(currentUser.uid);
        setUserId(currentUser.uid);
        fetchClasses(currentUser.uid);
      } else {
        router.push("/Authenticated/teacher");
      }
    });

    return () => unsubscribe();
  }, [router]);

  // ✅ Fetch only teacher's created classes
  const fetchClasses = async (userId: string) => {
    try {
      const response = await fetch(`/api/getClasses?userId=${userId}`);
      const data = await response.json();
      setClasses(data);
      setFilteredClasses(data);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const handleFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    const date = event.target.value;
    setSelectedDate(date);

    if (!date) {
      setFilteredClasses(classes);
      return;
    }

    if (Array.isArray(classes)) {
      const filtered = classes.filter((cls) => cls.createdAt.startsWith(date));
      setFilteredClasses(filtered);
    } else {
      console.error("Classes is not an array:", classes);
      setFilteredClasses([]);
    }
  };

  const downloadCSV = async (classId: string) => {
    const response = await fetch(`/api/fetchAttendance?classId=${classId}`);
    const data = await response.json();

    if (!data.length) {
      alert("No attendance data found.");
      return;
    }

    const csvContent =
      "Name,Time\n" +
      data.map((row: any) => `${row.studentName},${row.timestamp}`).join("\n");

    fileDownload(csvContent, `${classId}_attendance.csv`);
  };

  const handleDeleteClass = async (classId: string) => {
    if (!userId) {
      alert("User ID not available.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this class?"
    );
    if (!confirmed) return;

    try {
      const response = await fetch("/api/deleteClass", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ classId, teacherId: userId }),
      });

      if (response.ok) {
        setClasses(classes.filter((cls) => cls.id !== classId));
        setFilteredClasses(filteredClasses.filter((cls) => cls.id !== classId));
        alert("Class deleted successfully.");
      } else {
        const errorData = await response.json();
        console.error(errorData.error);
        alert("Failed to delete class.");
      }
    } catch (error) {
      console.error("Error deleting class:", error);
      alert("An error occurred.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-6">
      {/* Header */}
      <h1 className="text-4xl font-bold text-[#6e48c9] mb-6">Dashboard</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow flex items-center justify-between">
          <div>
            <p className="text-gray-500">Total Classes</p>
            <h2 className="text-2xl font-bold">{classes.length}</h2>
          </div>
          <FaChalkboardTeacher size={40} className="text-blue-500" />
        </div>
        <div className="bg-white p-6 rounded-lg shadow flex items-center justify-between">
          <div>
            <p className="text-gray-500">Students Attended</p>
            <h2 className="text-2xl font-bold">150</h2>{" "}
            {/* Placeholder value */}
          </div>
          <FaUsers size={40} className="text-green-500" />
        </div>
        <div className="bg-white p-6 rounded-lg shadow flex items-center justify-between">
          <div>
            <p className="text-gray-500">Total Downloads</p>
            <h2 className="text-2xl font-bold">50</h2> {/* Placeholder value */}
          </div>
          <FaDownload size={40} className="text-yellow-500" />
        </div>
      </div>

      {/* Class Filter */}
      <div className="bg-white p-6 rounded-lg shadow mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold">Classes</h2>
        <input
          type="date"
          value={selectedDate}
          onChange={handleFilter}
          className="border p-2 rounded-md shadow-sm focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Classes Table */}
      <div className="overflow-x-auto bg-white shadow-lg rounded-lg p-5">
        <table className="min-w-full border border-gray-300 rounded-lg">
          <thead className="bg-[#6e48c9] text-white">
            <tr>
              <th className="py-3 px-4 text-left">Class Name</th>
              <th className="py-3 px-4 text-left">Created Date</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClasses.length > 0 ? (
              filteredClasses.map((cls) => (
                <tr key={cls.id} className="border-b hover:bg-gray-100">
                  <td className="py-3 px-4">
                    <Link
                      href={`/class/${cls.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {cls.name}
                    </Link>
                  </td>
                  <td className="py-3 px-4">
                    {new Date(cls.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 flex justify-center text-center">
                    <button
                      onClick={() => handleDeleteClass(cls.id)}
                      className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition flex items-center gap-2 ml-2"
                    >
                      Delete
                    </button>

                    <button
                      onClick={() => downloadCSV(cls.id)}
                      className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600 transition flex items-center gap-2"
                    >
                      <FaDownload /> Download
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="text-center py-4 text-gray-500">
                  No classes found for the selected date.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
