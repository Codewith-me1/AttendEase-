"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { saveAs } from "file-saver";
import { FaDownload, FaUser } from "react-icons/fa";
import fileDownload from "js-file-download";
import Link from "next/link";
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
  const [loading, setLoading] = useState(true);
  const [qrValue, setQrValue] = useState("");
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      fetchClassDetails(id as string);
      fetchAttendanceRecords(id as string);
    }
  }, [id]);

  // Fetch class details
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

  // Fetch attendance records from Turso
  const fetchAttendanceRecords = async (classId: string) => {
    try {
      const response = await fetch(`/api/fetchAttendance?classId=${classId}`);
      const data = await response.json();
      if (response.ok) {
        setAttendance(data);
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

  const shareQRCode = () => {
    if (!qrValue) return;
    if (navigator.share) {
      navigator.share({
        title: "Join the Class",
        text: "Scan this QR Code to join the class!",
        url: qrValue,
      });
    } else {
      toast.info("Sharing not supported on this device.", {
        position: "top-center",
      });
    }
  };

  const downloadCSV = async (classId: string | null) => {
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

  const handleURL = () => {
    navigator.clipboard.writeText(qrValue);
    toast.info("Copied to ClipBoard", {
      position: "top-center",
    });
  };

  // Hypothetical total capacity (modify as needed)
  const totalCapacity = 50;
  const attendedCount = attendance.length;
  const absentCount = totalCapacity - attendedCount;

  // Data for the Pie Chart
  const attendanceData = [
    { name: "Attended", value: attendedCount },
    { name: "Absent", value: absentCount > 0 ? absentCount : 0 },
  ];

  const COLORS = ["#7f56d8", "#e0e0e0"];
  const downloadQRCode = () => {
    if (!qrRef.current) return;
    const canvas = qrRef.current.querySelector("canvas");
    if (canvas) {
      canvas.toBlob((blob) => {
        if (blob) {
          saveAs(blob, "class_qrcode.png");
        }
      });
    }
  };

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
        <h1 className="text-4xl text-center font-bold text-[#7f56d8] mb-4">
          {classDetails.name}
        </h1>

        <p className="text-gray-600 mb-4 ">
          <span className="font-bold"> Created At:</span>{" "}
          {new Date(classDetails.createdAt).toLocaleString()}
        </p>
      </div>
      <div className="flex gap-10 mt-5 p-6">
        <div className="bg-white p-6 rounded-md shadow-md flex items-center gap-4">
          <div className="text-3xl text-[#7f56d8]">
            <FaUser />
          </div>
          <div>
            <p className="text-gray-600">Total Student Attended:</p>
            <p className="text-2xl font-bold">{attendance.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-md shadow-md flex items-center gap-4">
          <div className="text-3xl text-[#7f56d8]">
            <FaUser color="grey" />
          </div>
          <div>
            <p className="text-gray-600">Total Absent:</p>
            <p className="text-2xl font-bold">{50 - attendance.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-md shadow-md flex items-center gap-4">
          <div>
            <p className="text-gray-600">Attendance Report:</p>
            <button
              onClick={() => downloadCSV(classDetails.id)}
              className="bg-green-500 text-white p-2 mt-2 rounded-md hover:bg-green-600 transition flex items-center gap-2"
            >
              Download
              <FaDownload />
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-x-20    bg-gray-100 p-6">
        <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md text-center">
          {/* Class Name */}
          {/* Creation Date */}
          {/* QR Code Section */}
          <div className="mb-4">
            <p className="text-xl font-semibold text-[#7f56d8] mb-2">QR Code</p>
            <div
              ref={qrRef}
              className="p-2 bg-gray-100 rounded-lg inline-block"
            >
              <QRCodeCanvas value={qrValue} size={200} />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              <a href={qrValue} />
              {qrValue}
            </p>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              onClick={shareQRCode}
              className="bg-[#7f56d8] text-white p-2 rounded-md font-semibold hover:bg-[#6e48c9] transition"
            >
              Share QR Code
            </button>
            <button
              onClick={downloadQRCode}
              className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600  font-semibold  transition"
            >
              Download QR
            </button>

            <button
              className="bg-gray-500 text-white p-2 rounded-md font-semibold hover:bg-gray-600 transition"
              onClick={() => {
                handleURL();
              }}
            >
              Copy URL
            </button>
          </div>
        </div>

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

        {/* Display total number of students attended */}
      </div>
      <ToastContainer />
    </div>
  );
}
