"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { saveAs } from "file-saver";
import { FaDownload, FaUser } from "react-icons/fa";
import fileDownload from "js-file-download";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface ClassDetails {
  id: string;
  name: string;
  createdAt: string;
}

interface AttendanceRecord {
  id: string;
  studentName: string;
  timestamp: string;
}

export default function ClassPage() {
  const params = useParams();
  const { id } = params; // Dynamic route parameter
  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [filteredAttendance, setFilteredAttendance] = useState<
    AttendanceRecord[]
  >([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [qrValue, setQrValue] = useState("");
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      fetchClassDetails(id as string);
      fetchAttendanceRecords(id as string);
    }
  }, [id]);

  // ✅ Fetch class details
  const fetchClassDetails = async (classId: string) => {
    try {
      const response = await fetch(`/api/getClass?id=${classId}`);
      const data = await response.json();
      if (response.ok) {
        setClassDetails(data);
        const qrURL = `${window.location.origin}/student?classId=${data.id}`;
        setQrValue(qrURL);
      } else {
        toast.error("Failed to fetch class details", {
          position: "top-center",
        });
      }
    } catch (error) {
      toast.error("Error fetching class details", { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch attendance records from Turso
  const fetchAttendanceRecords = async (classId: string) => {
    try {
      const response = await fetch(`/api/fetchAttendance?classId=${classId}`);
      const data = await response.json();
      if (response.ok) {
        setAttendance(data);
        setFilteredAttendance(data); // Default: Show all records
      } else {
        toast.error("Failed to fetch attendance records", {
          position: "top-center",
        });
      }
    } catch (error) {
      toast.error("Error fetching attendance records", {
        position: "top-center",
      });
    }
  };

  // ✅ Filter Attendance by Date
  const handleDateFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = event.target.value;
    setSelectedDate(selectedDate);

    if (!selectedDate) {
      setFilteredAttendance(attendance); // Reset filter
      return;
    }

    const filtered = attendance.filter((record) =>
      record.timestamp.startsWith(selectedDate)
    );

    setFilteredAttendance(filtered);
  };

  const downloadCSV = async (classId: string | null) => {
    if (!filteredAttendance.length) {
      toast.error("No attendance records found for the selected date.", {
        position: "top-center",
      });
      return;
    }

    const csvContent =
      "Name,Time\n" +
      filteredAttendance
        .map((row) => `${row.studentName},${row.timestamp}`)
        .join("\n");

    fileDownload(
      csvContent,
      `${classId}_attendance_${selectedDate || "all"}.csv`
    );
  };

  const totalCapacity = 50;
  const attendedCount = filteredAttendance.length;
  const absentCount = totalCapacity - attendedCount;

  // ✅ Data for Pie Chart
  const attendanceData = [
    { name: "Attended", value: attendedCount },
    { name: "Absent", value: absentCount > 0 ? absentCount : 0 },
  ];
  const COLORS = ["#7f56d8", "#e0e0e0"];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p>Loading...</p>
        <ToastContainer />
      </div>
    );
  }

  if (!classDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p>Class not found.</p>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="main">
      <div className="content text-center">
        <h1 className="text-4xl font-bold text-[#7f56d8] mb-4">
          {classDetails.name}
        </h1>
        <p className="text-gray-600 mb-4">
          <span className="font-bold">Created At:</span>{" "}
          {new Date(classDetails.createdAt).toLocaleString()}
        </p>
      </div>

      {/* ✅ Attendance Date Filter */}

      <div className="flex gap-10 mt-5 pb-10">
        {/* Total Attended */}
        <div className="bg-white p-6 rounded-md shadow-md flex items-center gap-4">
          <FaUser className="text-3xl text-[#7f56d8]" />
          <div>
            <p className="text-gray-600">Total Student Attended:</p>
            <p className="text-2xl font-bold">{attendedCount}</p>
          </div>
        </div>

        {/* Total Absent */}
        <div className="bg-white p-6 rounded-md shadow-md flex items-center gap-4">
          <FaUser className="text-3xl text-gray-400" />
          <div>
            <p className="text-gray-600">Total Absent:</p>
            <p className="text-2xl font-bold">{absentCount}</p>
          </div>
        </div>

        {/* Download Attendance */}
        <div className="bg-white p-6 rounded-md shadow-md flex items-center gap-4">
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold mb-2">
              Filter Attendance by Date
            </h2>
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateFilter}
              className="border p-2 rounded-md shadow-sm focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="mt-5">
            <button
              onClick={() => downloadCSV(classDetails.id)}
              className="bg-green-500 text-white p-2 mt-2 rounded-md hover:bg-green-600 transition flex items-center gap-2"
            >
              Download <FaDownload />
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Attendance Pie Chart */}
      <div className="bg-white p-6 rounded-md shadow-md text-center w-96  mt-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Attendance Distribution
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={attendanceData}
              dataKey="value"
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

      <ToastContainer />
    </div>
  );
}
