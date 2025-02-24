"use client";

import { useState } from "react";
import fileDownload from "js-file-download";

export default function Download() {
  const [classId, setClassId] = useState("");

  const downloadCSV = async () => {
    if (!classId) {
      alert("Please enter a class ID.");
      return;
    }

    try {
      const response = await fetch(`/api/fetchAttendance?classId=${classId}`, {
        method: "GET", // Ensure it's a GET request
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch attendance data.");
      }

      const data = await response.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      if (data.length === 0) {
        alert("No attendance data found.");
        return;
      }

      const csvContent =
        "Name,Time\n" +
        data
          .map((row: any) => `${row.studentName},${row.timestamp}`)
          .join("\n");

      fileDownload(csvContent, `${classId}_attendance.csv`);
    } catch (error) {
      console.error("Error downloading CSV:", error);
      alert("Error fetching attendance data.");
    }
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold">Download Attendance</h1>
      <input
        type="text"
        placeholder="Enter Class ID"
        value={classId}
        onChange={(e) => setClassId(e.target.value)}
        className="border p-2 my-2 w-full"
      />
      <button onClick={downloadCSV} className="bg-blue-500 text-white p-2">
        Download CSV
      </button>
    </div>
  );
}
