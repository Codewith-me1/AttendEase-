// "use client";

// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import { toast, ToastContainer } from "react-toastify";
// import { auth } from "@/app/firebase/config";
// import { getUserData } from "@/app/firebase/database";

// interface ClassDetails {
//   id: string;
//   name: string;
// }

// interface Student {
//   id: string;
//   name: string;
//   email: string;
// }

// export default function AssignStudentsToClass() {
//   const [classes, setClasses] = useState<ClassDetails[]>([]);
//   const [students, setStudents] = useState<Student[]>([]);
//   const [selectedClass, setSelectedClass] = useState<string>("");
//   const [userId, setUserId] = useState<string | null>(null);
//   const [fromDate, setFromDate] = useState<string>("");
//   const [toDate, setToDate] = useState<string>("");

//   const router = useRouter();
//   const [selectedStudents, setSelectedStudents] = useState<Set<string>>(
//     new Set()
//   );

//   useEffect(() => {
//     fetch("/api/getStudents")
//       .then((res) => res.json())
//       .then((data) => setStudents(data.students || []))
//       .catch(() => toast.error("Failed to load students"));
//   }, []);

//   const toggleStudent = (id: string) => {
//     setSelectedStudents((prev) => {
//       const newSet = new Set(prev);
//       newSet.has(id) ? newSet.delete(id) : newSet.add(id);
//       return newSet;
//     });
//   };

//   useEffect(() => {
//     const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
//       if (currentUser) {
//         const userData = await getUserData(currentUser.uid);
//         setUserId(currentUser.uid);
//         fetchClasses(currentUser.uid);
//       } else {
//         router.push("/Authenticated/teacher");
//       }
//     });

//     return () => unsubscribe();
//   }, [router]);

//   const assignStudents = async () => {
//     if (!selectedClass || selectedStudents.size === 0) {
//       toast.error("Please select a class and at least one student.");
//       return;
//     }

//     try {
//       const res = await fetch("/api/assignStudentsToClass", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           classId: selectedClass,
//           studentIds: Array.from(selectedStudents),
//         }),
//       });

//       const result = await res.json();

//       if (res.ok) {
//         toast.success("Students assigned successfully!");
//         setSelectedStudents(new Set());
//       } else {
//         toast.error(result.message || "Assignment failed.");
//       }
//     } catch (err) {
//       toast.error("Something went wrong!");
//     }
//   };

//   const fetchClasses = async (userId: string) => {
//     try {
//       const response = await fetch(`/api/getClasses?userId=${userId}`);
//       const data = await response.json();
//       setClasses(data);
//     } catch (error) {
//       console.error("Error fetching classes:", error);
//     }
//   };

//   return (
//     <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-md">
//       <h2 className="text-2xl font-bold mb-4">Assign Students to Class</h2>

//       {/* 🔹 Class Dropdown */}
//       <label className="block mb-2 font-semibold">Select Class:</label>
//       <select
//         className="w-full p-2 border mb-4 rounded"
//         value={selectedClass}
//         onChange={(e) => setSelectedClass(e.target.value)}
//       >
//         <option value="">-- Select Class --</option>
//         {classes.map((cls) => (
//           <option key={cls.id} value={cls.id}>
//             {cls.name}
//           </option>
//         ))}
//       </select>

//       {/* 🔹 Students List */}
//       <label className="block mb-2 font-semibold">Select Students:</label>
//       <div className="border p-4 rounded h-64 overflow-y-auto space-y-2">
//         {students.map((student) => (
//           <label key={student.id} className="flex items-center space-x-2">
//             <input
//               type="checkbox"
//               checked={selectedStudents.has(student.id)}
//               onChange={() => toggleStudent(student.id)}
//             />
//             <span>
//               {student.name} ({student.email})
//             </span>
//           </label>
//         ))}
//       </div>

//       {/* 🔹 Submit Button */}
//       <button
//         onClick={assignStudents}
//         className="mt-6 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
//       >
//         Assign to Class
//       </button>

//       <ToastContainer />
//     </div>
//   );
// }

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { auth } from "@/app/firebase/config";
import { getUserData } from "@/app/firebase/database";

interface ClassDetails {
  id: string;
  name: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
}

export default function AssignStudentsToClass() {
  const [classes, setClasses] = useState<ClassDetails[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(
    new Set()
  );

  const router = useRouter();

  useEffect(() => {
    fetch("/api/getStudents")
      .then((res) => res.json())
      .then((data) => {
        const fetchedStudents = data.students || [];
        setStudents(fetchedStudents);
        setFilteredStudents(fetchedStudents);
      })
      .catch(() => toast.error("Failed to load students"));
  }, []);

  const toggleStudent = (id: string) => {
    setSelectedStudents((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

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

  const assignStudents = async () => {
    if (!selectedClass || selectedStudents.size === 0) {
      toast.error("Please select a class and at least one student.");
      return;
    }

    try {
      const res = await fetch("/api/assignStudentsToClass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: selectedClass,
          studentIds: Array.from(selectedStudents),
        }),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("Students assigned successfully!");
        setSelectedStudents(new Set());
      } else {
        toast.error(result.message || "Assignment failed.");
      }
    } catch (err) {
      toast.error("Something went wrong!");
    }
  };

  const fetchClasses = async (userId: string) => {
    try {
      const response = await fetch(`/api/getClasses?userId=${userId}`);
      const data = await response.json();
      setClasses(data);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredStudents(
      students.filter(
        (student) =>
          student.name.toLowerCase().includes(query) ||
          student.email.toLowerCase().includes(query)
      )
    );
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-bold mb-4">Assign Students to Class</h2>

      {/* 🔍 Search Students */}
      <input
        type="text"
        placeholder="Find students by name or email..."
        className="w-full p-2 border mb-4 rounded"
        value={searchQuery}
        onChange={handleSearch}
      />

      {/* 🔹 Class Dropdown */}
      <label className="block mb-2 font-semibold">Select Class:</label>
      <select
        className="w-full p-2 border mb-4 rounded"
        value={selectedClass}
        onChange={(e) => setSelectedClass(e.target.value)}
      >
        <option value="">-- Select Class --</option>
        {classes.map((cls) => (
          <option key={cls.id} value={cls.id}>
            {cls.name}
          </option>
        ))}
      </select>

      {/* 🔹 Students List */}
      <label className="block mb-2 font-semibold">Select Students:</label>
      <div className="border p-4 rounded h-64 overflow-y-auto space-y-2">
        {filteredStudents.map((student) => (
          <label key={student.id} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedStudents.has(student.id)}
              onChange={() => toggleStudent(student.id)}
            />
            <span>
              {student.name} ({student.email})
            </span>
          </label>
        ))}
      </div>

      {/* 🔹 Submit Button */}
      <button
        onClick={assignStudents}
        className="mt-6 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
      >
        Assign to Class
      </button>

      <ToastContainer />
    </div>
  );
}
