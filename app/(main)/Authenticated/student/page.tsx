"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaSearch } from "react-icons/fa";

interface Student {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
}

export default function StudentFilter() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchStudents() {
      try {
        const response = await fetch("/api/getStudents");
        const data = await response.json();
        setStudents(data.students);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    }
    fetchStudents();
  }, []);

  // Filter students based on search input
  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col items-center justify-center  bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-[#6e48c9] mb-6">
        Student Directory
      </h1>

      {/* Search Input */}
      <div className="bg-white shadow-lg p-4 rounded-lg flex items-center gap-3 w-full max-w-3xl mb-6">
        <FaSearch className="text-gray-500" />
        <input
          type="text"
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded-md flex-1 focus:ring-2 focus:ring-[#6e48c9]"
        />
      </div>

      {/* Students Table */}
      <div className="overflow-x-auto bg-white shadow-lg rounded-lg p-5 w-full max-w-5xl">
        <table className="min-w-full border border-gray-300 rounded-lg">
          <thead className="bg-[#6e48c9] text-white">
            <tr>
              <th className="py-3 px-4 text-left ">Student Name</th>
              <th className="py-3 px-4 text-left">Email</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <tr
                  key={student.id}
                  className="border-b hover:bg-gray-100 cursor-pointer "
                  onClick={() =>
                    router.push(`/Authenticated/student/${student.id}`)
                  }
                >
                  <td className="py-3 px-4 text-blue-500 hover:underline ">
                    {student.name}
                  </td>
                  <td className="py-3 px-4">{student.email}</td>

                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      id="vehicle2"
                      name="vehicle2"
                      value="Car"
                    ></input>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="text-center py-4 text-gray-500">
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
