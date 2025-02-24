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

interface Class {
  id: string;
  name: string;
  createdAt: string;
}

export default function Dashboard() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([]);
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    const fetchClasses = async () => {
      const response = await fetch("/api/getClasses");
      const data = await response.json();
      setClasses(data);
      setFilteredClasses(data);
    };

    fetchClasses();
  }, []);

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

  return (
    <div className="flex flex-col min-h-screen  p-6">
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
