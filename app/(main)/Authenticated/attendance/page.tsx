"use client";

import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getUserData } from "@/app/firebase/database";
import { useRouter } from "next/navigation";
import { auth } from "@/app/firebase/config";
import fileDownload from "js-file-download";
import SendReminderButton from "@/app/components/SendReminder/SendReminder";

interface ClassDetails {
  id: string;
  name: string;
}

interface AttendanceRecord {
  id: string;
  studentName: string;
  studentId: string;
  timestamp: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  photoURL?: string;
}

export default function AttendancePage() {
  const [classes, setClasses] = useState<ClassDetails[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [filteredAttendance, setFilteredAttendance] = useState<
    AttendanceRecord[]
  >([]);

  const [students, setStudents] = useState<Student[]>([]);
  const [markedAttendance, setMarkedAttendance] = useState<
    Record<string, boolean>
  >({});
  const [userId, setUserId] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const router = useRouter();
  const todayDate = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
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
  }, [selectedClass, todayDate]);

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
      const data: AttendanceRecord[] = await response.json();
      if (response.ok) {
        setAttendance(data);
        setFilteredAttendance(data);

        // ✅ Mark students who already have attendance today
        const today = new Date().toISOString().split("T")[0];
        const todayAttendanceMap: Record<string, boolean> = {};
        data.forEach((record) => {
          const recordDate = new Date(record.timestamp)
            .toISOString()
            .split("T")[0];
          if (recordDate === today) {
            todayAttendanceMap[record.studentId] = true;
          }
        });
        setMarkedAttendance(todayAttendanceMap);
      } else {
        toast.error("Failed to fetch attendance records.");
      }
    } catch (error) {
      toast.error("Error fetching attendance records.");
    }
  };

  useEffect(() => {
    async function fetchStudents() {
      try {
        if (!selectedClass) return;
        const response = await fetch(
          `/api/getStudentsByClass?classId=${selectedClass}`
        );
        const data = await response.json();
        setStudents(data.students);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    }
    fetchStudents();
  }, [selectedClass]);

  const toggleAttendance = async (studentName: string, studentId: string) => {
    if (!selectedClass || !studentName) {
      toast.error("Class ID or Student Name is missing!", {
        position: "top-center",
      });
      return;
    }

    try {
      const localTimestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

      const response = await fetch("/api/saveAttendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: selectedClass,
          studentName,
          studentId,
          timestamp: localTimestamp,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMarkedAttendance((prev) => ({
          ...prev,
          [studentId]: true,
        }));
        toast.success("Attendance Marked Successfully!", {
          position: "top-center",
        });
      } else {
        toast.error(result.message || "Failed to mark attendance!", {
          position: "top-center",
        });
      }
    } catch (error) {
      toast.error("Something went wrong!", { position: "top-center" });
    }
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

      {/* 🔹 Class Selector */}
      <div className="mb-4">
        <label className="block font-semibold mb-2">Filter by Class:</label>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="">Select a Class</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
            </option>
          ))}
        </select>
      </div>

      {/* 🔹 Date Filter */}

      {/* 🔹 Mark Attendance (Checkbox) */}
      {selectedClass && (
        <div className="bg-white p-6 mt-6 rounded shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold mb-4">
              Mark Today's Attendance ({todayDate})
            </h2>
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

          <ul className="divide-y">
            {students.map((student) => (
              <li key={student.id} className="flex justify-between py-2">
                <span>{student.name}</span>

                <SendReminderButton
                  phoneNumber={student.phone}
                  studentName={student.name}
                />
                <input
                  type="checkbox"
                  checked={markedAttendance[student.id] || false}
                  onChange={() => toggleAttendance(student.name, student.id)}
                  className="w-5 h-5"
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}
