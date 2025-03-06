"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { FaFilter, FaDownload } from "react-icons/fa";
import fileDownload from "js-file-download";
import { Button } from "@/components/ui/button";

interface AttendanceRecord {
  id: string;
  className: string;
  studentName: string;
  timestamp: string;
}

export default function StudentAttendance() {
  const { name } = useParams();
  const studentId = Array.isArray(name) ? name[0] : name; // Ensure it's a string

  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("");
  const [classNameFilter, setClassNameFilter] = useState("");

  useEffect(() => {
    if (!studentId) return;
    fetchAttendance();
  }, [studentId, dateFilter, classNameFilter]);

  const fetchAttendance = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (typeof studentId === "string")
        queryParams.append("studentId", studentId);
      if (dateFilter) queryParams.append("date", dateFilter);
      if (classNameFilter) queryParams.append("className", classNameFilter);

      const response = await fetch(`/api/getStudentAttendance?${queryParams}`);
      const data = await response.json();

      if (response.ok) {
        setAttendance(data.attendance);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = async () => {
    const queryParams = new URLSearchParams();
    if (typeof studentId === "string")
      queryParams.append("studentId", studentId);
    if (dateFilter) queryParams.append("date", dateFilter);
    if (classNameFilter) queryParams.append("className", classNameFilter);

    const response = await fetch(`/api/getStudentAttendance?${queryParams}`);
    const data = await response.json();
    console.log(data);

    if (!data.attendance.length) {
      alert("No attendance data found.");
      return;
    }

    const csvContent =
      "Name,Time\n" +
      data.attendance
        .map((row: any) => `${row.studentName},${row.timestamp}`)
        .join("\n");

    fileDownload(csvContent, `${queryParams}_attendance.csv`);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full  mt-20 bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-[#6e48c9] mb-6">
        Student Attendance
      </h1>

      {/* Filters */}
      <div className="bg-white shadow-lg p-4 rounded-lg flex flex-wrap gap-4 w-full max-w-3xl mb-6">
        <div className="flex flex-col">
          <label className="text-gray-600">Filter by Date:</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border p-2 rounded-md"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-gray-600">Filter by Class Name:</label>
          <input
            type="text"
            placeholder="Enter class name..."
            value={classNameFilter}
            onChange={(e) => setClassNameFilter(e.target.value)}
            className="border p-2 rounded-md"
          />
        </div>

        <div className="flex gap-5 justify-center items-center mt-2 ml-5 ">
          <Button
            onClick={fetchAttendance}
            className="bg-[#6e48c9] text-white p-4  rounded-md flex items-center  gap-2 hover:bg-[#5b3ba5]"
          >
            <FaFilter /> Apply Filters
          </Button>

          <Button
            onClick={downloadCSV}
            className="bg-green-500 text-white p-2 rounded-md flex items-center gap-2 hover:bg-green-600"
          >
            <FaDownload /> Download CSV
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-600">Loading attendance records...</p>
      ) : attendance.length === 0 ? (
        <p className="text-red-500">No attendance records found.</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-lg rounded-lg p-5 w-full max-w-5xl">
          <table className="min-w-full border border-gray-300 rounded-lg">
            <thead className="bg-[#6e48c9] text-white">
              <tr>
                <th className="py-3 px-4 text-left">Class Name</th>
                <th className="py-3 px-4 text-left">Student Name</th>
                <th className="py-3 px-4 text-left">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((record) => (
                <tr key={record.id} className="border-b hover:bg-gray-100">
                  <td className="py-3 px-4">{record.className}</td>
                  <td className="py-3 px-4">{record.studentName}</td>
                  <td className="py-3 px-4">
                    {new Date(record.timestamp).toLocaleString()}
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
