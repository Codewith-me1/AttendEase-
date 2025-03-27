"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "@/app/firebase/config";
import { getUserData } from "@/app/firebase/database";
import { FaCalendarAlt, FaSignOutAlt } from "react-icons/fa";
import fileDownload from "js-file-download";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface AttendanceRecord {
  className: string;
  timestamp: string;
}

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState("");
  const router = useRouter();

  // Fetch user and attendance on mount
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userData = await getUserData(currentUser.uid);
        if (userData) {
          setRole(userData.role);
          if (userData.role !== "student") {
            alert("Access denied: Only students can access this page.");
            router.push("/login");
          } else {
            // Use user's name from Firestore or email to fetch attendance records
            fetchAttendance(userData.uid || "");
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

  const fetchAttendance = async (studentId: string) => {
    try {
      const response = await fetch(
        `/api/studentAttendance?studentId=${encodeURIComponent(studentId)}`
      );
      const data = await response.json();
      if (Array.isArray(data)) {
        setAttendance(data);
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  // Derived attendance based on filter date
  const filteredAttendance = filterDate
    ? attendance.filter((record) => {
        const recordDate = new Date(record.timestamp)
          .toISOString()
          .slice(0, 10);
        return recordDate === filterDate;
      })
    : attendance;

  const downloadCSV = () => {
    if (!attendance.length) {
      toast.error("No attendance records to download", {
        position: "top-center",
      });
      return;
    }

    // Use filtered records if filter is applied, else all records.
    const dataToDownload = filteredAttendance.length
      ? filteredAttendance
      : attendance;

    // Create CSV header
    const header = "Class Name,Date\n";
    // Map each record to CSV row
    const rows = dataToDownload
      .map((record) => {
        const date = new Date(record.timestamp).toLocaleDateString();
        return `${record.className},${date}`;
      })
      .join("\n");

    const csvContent = header + rows;
    fileDownload(csvContent, "attendance.csv");
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6">
      <ToastContainer />

      <div className="flex justify-between w-full max-w-4xl mb-6">
        <h1 className="text-3xl font-bold text-[#7f56d8]">Student Dashboard</h1>
        {user && (
          <button
            onClick={() => auth.signOut().then(() => router.push("/login"))}
            className="bg-red-500 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-red-600 transition"
          >
            <FaSignOutAlt /> Logout
          </button>
        )}
      </div>

      {/* Date Filter & Download Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between w-full max-w-4xl mb-6 gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="filterDate" className="text-lg text-gray-700">
            Filter by Date:
          </label>
          <input
            id="filterDate"
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7f56d8]"
          />
        </div>
        <button
          onClick={downloadCSV}
          className="bg-green-500 text-white px-4 py-2 rounded-md text-lg font-semibold hover:bg-green-600 transition"
        >
          Download Attendance
        </button>
      </div>

      {loading ? (
        <p className="text-lg text-gray-500">Loading...</p>
      ) : filteredAttendance.length === 0 ? (
        <p className="text-lg text-gray-500">No attendance records found.</p>
      ) : (
        <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-4xl">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Your Attendance Records
          </h2>
          <table className="min-w-full bg-white border border-gray-300 rounded-lg">
            <thead className="bg-[#7f56d8] text-white">
              <tr>
                <th className="py-3 px-4 text-left">Class Name</th>
                <th className="py-3 px-4 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.map((record, index) => (
                <tr key={index} className="border-b hover:bg-gray-100">
                  <td className="py-3 px-4">{record.className}</td>
                  <td className="py-3 px-4 flex items-center gap-2">
                    <FaCalendarAlt className="text-gray-500" />
                    {new Date(record.timestamp).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
