"use client";

import { useEffect, useState } from "react";
import { auth } from "@/app/firebase/config";
import { useRouter } from "next/navigation";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { format, isAfter, parseISO } from "date-fns";
import { getUserData } from "@/app/firebase/database";

interface AttendanceRecord {
  timestamp: string;
  classId: string; // ✅ Use classId for filtering
}

interface ClassRecord {
  id: string;
  name: string;
}

export default function StudentAttendanceCalendar() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

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
            fetchClasses();
            fetchAttendance(userData.uid, ""); // Fetch all attendance initially
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

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/getAllClasses");
      const data = await response.json();

      if (response.ok) {
        setClasses(data);
      } else {
        console.error("Failed to fetch classes:", data.message);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const fetchAttendance = async (studentId: string, classId: string) => {
    try {
      const url = classId
        ? `/api/getStudentCalendar?studentId=${studentId}&classId=${classId}`
        : `/api/getStudentCalendar?studentId=${studentId}`;

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setAttendance(data.attendance);
      } else {
        console.error("Failed to fetch attendance:", data.message);
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
    }
  };

  const handleClassChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSelectedClass = event.target.value;
    setSelectedClass(newSelectedClass);
    if (user) {
      fetchAttendance(user.uid, newSelectedClass);
    }
  };

  // ✅ Create a set of dates with attendance
  const presentDates = new Set(
    attendance.map((record) => {
      try {
        return format(parseISO(record.timestamp), "yyyy-MM-dd");
      } catch (error) {
        console.error("Error parsing date:", error, record.timestamp);
        return "";
      }
    })
  );

  // ✅ Function to determine class for calendar tiles
  const tileClassName = ({ date }: { date: Date }) => {
    const formattedDate = format(date, "yyyy-MM-dd");

    if (isAfter(date, new Date())) return ""; // Future dates remain blank

    return presentDates.has(formattedDate) ? "present-day" : "absent-day";
  };

  // ✅ Function to add event markers inside calendar tiles
  const tileContent = ({ date }: { date: Date }) => {
    const formattedDate = format(date, "yyyy-MM-dd");

    if (isAfter(date, new Date())) return null;

    return presentDates.has(formattedDate) ? (
      <div className="event present">✅ </div>
    ) : (
      <div className="event absent">❌ </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-3xl font-bold text-[#6f48eb] mb-8">
        📅 Attendance Calendar
      </h1>

      {/* ✅ Class Filter Dropdown */}
      <div className="mb-4 bg-white p-5 rounded-md">
        <label className="font-bold mr-2">Select Class:</label>
        <select
          value={selectedClass}
          onChange={handleClassChange}
          className="border p-2 rounded-lg shadow-sm"
        >
          <option value="">All Classes</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
            </option>
          ))}
        </select>
      </div>

      {/* ✅ Calendar Component */}
      <div className="  p-6 w-full max-w-4xl">
        <Calendar
          tileClassName={tileClassName}
          tileContent={tileContent}
          className="custom-calendar"
        />
      </div>

      {/* ✅ Styles for Calendar */}
      <style jsx global>{`
        .present-day .react-calendar__tile {
          background-color: rgba(76, 175, 80, 0.2) !important;
          font-weight: bold;
          border-radius: 8px;
        }

        .absent-day .react-calendar__tile {
          background-color: rgba(244, 67, 54, 0.2) !important;
          font-weight: bold;
          border-radius: 8px;
        }

        .event {
          font-size: 16px;
          text-align: center;
          margin-top: 4px;
          padding: 6px;
          border-radius: 6px;
          font-weight: bold;
          width: 80%;
          margin: auto;
        }

        .present {
          color: #4caf50;
        }

        .absent {
          color: #f44336;
        }
      `}</style>
    </div>
  );
}
