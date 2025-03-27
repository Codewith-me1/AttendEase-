"use client";

import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { getUserData } from "@/app/firebase/database";
import { useRouter } from "next/navigation";
import { FaDownload, FaUser } from "react-icons/fa";
import fileDownload from "js-file-download";
import { auth } from "@/app/firebase/config";

interface ClassDetails {
  id: string;
  name: string;
}

interface AttendanceRecord {
  id: string;
  studentName: string;
  timestamp: string;
}

export default function AttendancePage() {
  const [classes, setClasses] = useState<ClassDetails[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [filteredAttendance, setFilteredAttendance] = useState<
    AttendanceRecord[]
  >([]);

  const [userId, setUserId] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

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

  useEffect(() => {
    if (selectedClass) {
      fetchAttendance(selectedClass);
    }
  }, [selectedClass]);

  useEffect(() => {
    if (fromDate && toDate) {
      const filtered = attendance.filter((record) => {
        const recordDate = new Date(record.timestamp)
          .toISOString()
          .split("T")[0];
        return recordDate >= fromDate && recordDate <= toDate;
      });
      setFilteredAttendance(filtered);
    } else {
      setFilteredAttendance(attendance);
    }
  }, [fromDate, toDate, attendance]);

  const fetchClasses = async (userId: string) => {
    try {
      const response = await fetch(`/api/getClasses?userId=${userId}`);
      const data = await response.json();
      setClasses(data);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const fetchAttendance = async (classId: string) => {
    try {
      const response = await fetch(
        `/api/getAttendanceClass?classId=${classId}`
      );
      const data = await response.json();
      if (response.ok) {
        setAttendance(data);
        setFilteredAttendance(data);
      } else {
        toast.error("Failed to fetch attendance records.");
      }
    } catch (error) {
      toast.error("Error fetching attendance records.");
    }
  };
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const downloadCSV = () => {
    if (!filteredAttendance.length) {
      toast.error("No attendance records found for the selected date range.", {
        position: "top-center",
      });
      return;
    }

    const csvContent =
      "Name,Timestamp\n" +
      filteredAttendance
        .map(
          (row) =>
            `${row.studentName},${new Date(row.timestamp).toLocaleString()}`
        )
        .join("\n");

    fileDownload(
      csvContent,
      `attendance_${fromDate || "all"}_to_${toDate || "all"}.csv`
    );
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Attendance Management</h1>

      {/* 🔹 Class Filter */}
      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-2">
          Filter by Class:
        </label>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="border border-gray-300 p-2 rounded-md w-full"
        >
          <option value="">Select a Class</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
            </option>
          ))}
        </select>
      </div>

      {/* 🔹 Date Range Filter */}
      {selectedClass && (
        <div className="flex space-x-4 mb-4">
          <div>
            <label className="block text-gray-700 font-semibold">
              From Date:
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border border-gray-300 p-2 rounded-md"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold">
              To Date:
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border border-gray-300 p-2 rounded-md"
            />
          </div>

          {selectedClass && (
            <div className="mt-6">
              <button
                onClick={downloadCSV}
                className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600 transition mb-4"
              >
                Download CSV
              </button>
            </div>
          )}
        </div>
      )}

      {/* 🔹 Attendance Table */}
      {selectedClass && (
        <div className="bg-white p-6 rounded-md shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Attendance Records
          </h2>
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Student Name</th>
                <th className="border p-2">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.length > 0 ? (
                filteredAttendance.map((record) => (
                  <tr key={record.id} className="border">
                    <td className="border p-2">{record.studentName}</td>
                    <td className="border p-2">
                      {new Date(record.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="text-center p-4 text-gray-500">
                    No attendance records available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}
