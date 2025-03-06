import { db } from "@/lib/db";
import { NextResponse } from "next/server";


export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const classNameFilter = searchParams.get("className");
    const dateFilter = searchParams.get("date");

    if (!studentId) {
      return NextResponse.json({ message: "Student ID is required" }, { status: 400 });
    }

    // Construct base SQL query
    let sql = `
      SELECT 
        Attendance.id, 
        Attendance.studentName, 
        Attendance.timestamp, 
        classes.name AS className 
      FROM Attendance
      JOIN classes ON Attendance.classId = classes.id
      WHERE Attendance.studentId = ?
    `;
    let args = [studentId];

    // Apply class name filter
    if (classNameFilter) {
      sql += ` AND classes.name LIKE ?`;
      args.push(`%${classNameFilter}%`);
    }

    // Apply date filter
    if (dateFilter) {
      sql += ` AND DATE(Attendance.timestamp) = ?`;
      args.push(dateFilter);
    }

    sql += " ORDER BY Attendance.timestamp DESC;";

    // Execute query
    const result = await db.execute({ sql, args });

    return NextResponse.json({ attendance: result.rows });
  } catch (error) {
    console.error("Error fetching student attendance:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
