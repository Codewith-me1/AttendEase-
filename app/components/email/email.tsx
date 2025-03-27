// "use client";

// import { useEffect, useState } from "react";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { auth } from "@/app/firebase/config";
// import { getUserData } from "@/app/firebase/database"; // Import the function to fetch emails
// import { useRouter } from "next/navigation";
// import { getStudentEmailById } from "@/app/firebase/adminDb";

// interface ClassDetails {
//   id: string;
//   name: string;
// }

// interface Student {
//   id: unknown;

//   name: string;
//   // createdAt: string;
//   // role: string;
//   // photoURL: string;
//   email: string;
// }

// export default function SendEmail() {
//   const [classes, setClasses] = useState<ClassDetails[]>([]);
//   const [selectedClass, setSelectedClass] = useState<string>("");
//   const [students, setStudents] = useState<Student[]>([]);
//   const [user, setUser] = useState<any>(null);
//   const [userId, setUserId] = useState("");
//   const router = useRouter();
//   const [message, setMessage] = useState<string>("");

//   useEffect(() => {
//     if (selectedClass) {
//       fetchStudents(selectedClass);
//     }
//   }, [selectedClass]);

//   useEffect(() => {
//     const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
//       if (currentUser) {
//         setUser(currentUser);
//         const userData = await getUserData(currentUser.uid);
//         console.log(userData);
//         setUserId(userData.uid);
//         fetchClasses(userData.uid);
//       } else {
//         router.push("/Authenticated/teacher");
//       }
//     });

//     return () => unsubscribe();
//   }, [router]);

//   // 🔹 Fetch Classes
//   const fetchClasses = async (uid: string) => {
//     try {
//       const response = await fetch(`/api/getClasses?userId=${uid}`);
//       const data = await response.json();
//       if (response.ok) {
//         setClasses(data);
//       } else {
//         toast.error("Failed to fetch classes.");
//       }
//     } catch (error) {
//       toast.error("Error fetching classes.");
//     }
//   };

//   // 🔹 Fetch Students from Attendance and Retrieve Emails from Firestore
//   const fetchStudents = async (classId: string) => {
//     try {
//       const response = await fetch(
//         `/api/getAttendanceClass?classId=${classId}`
//       );

//       if (!response.ok) {
//         throw new Error("Failed to fetch attendance.");
//       }

//       const attendanceData = await response.json();

//       // Extract unique student IDs from the attendance records
//       const studentIds = [
//         ...new Set(attendanceData.map((record: any) => record.studentId)),
//       ];

//       // Fetch student emails from Firestore using studentId
//       const studentDetails = await Promise.all(
//         studentIds.map(async (studentId) => {
//           try {
//             const emailResponse = await fetch(
//               `/api/getStudentById?userId=${studentId}`
//             );

//             if (!emailResponse.ok) {
//               throw new Error(
//                 `Failed to fetch details for student ID: ${studentId}`
//               );
//             }

//             const emailData = await emailResponse.json();
//             const studentRecord = attendanceData.find(
//               (s: any) => s.studentId === studentId
//             );

//             return {
//               id: studentId,
//               name: studentRecord?.studentName || "Unknown",
//               email: emailData.email || "No Email",
//             };
//           } catch (err) {
//             console.error(err);
//             return {
//               id: studentId,
//               name: "Unknown",
//               email: "Error fetching email",
//             };
//           }
//         })
//       );

//       setStudents(studentDetails);

//       return studentDetails;
//     } catch (error) {
//       console.error(error);
//       toast.error("Error fetching students.");
//       return [];
//     }
//   };

//   // 🔹 Send Emails to all students in the selected class

//   const sendEmail = async () => {
//     if (!selectedClass || !message) {
//       toast.error(
//         "Please select a class, add a message, and ensure students exist."
//       );
//       return;
//     }

//     const emails = students.map((student) => student.email);
//     console.log(students);

//     try {
//       console.log(emails);
//       const response = await fetch("/api/sendEmail", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           to: emails,
//           subject: "Attendane",
//           text: message,
//         }),
//       });

//       const data = await response.json();
//       if (response.ok) {
//         toast.success("Emails sent successfully!");
//       } else {
//         toast.error(`Error sending emails: ${data.error}`);
//       }
//     } catch (error) {
//       toast.error("Error sending emails." + error);
//     }
//   };

//   return (
//     <div className="container mx-auto p-6">
//       <h1 className="text-3xl font-bold mb-6">Send Email to Students</h1>

//       {/* 🔹 Class Filter */}
//       <div className="mb-4">
//         <label className="block text-gray-700 font-semibold mb-2">
//           Select Class:
//         </label>
//         <select
//           value={selectedClass}
//           onChange={(e) => setSelectedClass(e.target.value)}
//           className="border border-gray-300 p-2 rounded-md w-full"
//         >
//           <option value="">Select a Class</option>
//           {classes.map((cls) => (
//             <option key={cls.id} value={cls.id}>
//               {cls.name}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* 🔹 Student List */}
//       {selectedClass && students.length > 0 && (
//         <div className="bg-white p-4 rounded-md shadow-md mb-4">
//           <h2 className="text-lg font-semibold">Students in this Class:</h2>
//           <ul className="list-disc pl-5">
//             {students.map((student, key) => (
//               <li key={key}>
//                 {student.name} ({student.email})
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}

//       {/* 🔹 Message Input */}
//       {selectedClass && (
//         <div className="mb-4">
//           <label className="block text-gray-700 font-semibold mb-2">
//             Message:
//           </label>
//           <textarea
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             rows={4}
//             className="border border-gray-300 p-2 rounded-md w-full"
//             placeholder="Enter your message..."
//           />
//         </div>
//       )}

//       {/* 🔹 Send Email Button */}
//       {selectedClass && (
//         <button
//           onClick={sendEmail}
//           className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition"
//         >
//           Send Email
//         </button>
//       )}

//       <ToastContainer />
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { auth } from "@/app/firebase/config";
import { getUserData } from "@/app/firebase/database"; // Import the function to fetch user data
import { useRouter } from "next/navigation";

interface ClassDetails {
  id: string;
  name: string;
}

interface Student {
  id: unknown;
  name: string;
  email: string;
  phone: string; // Added phone number
}

export default function SendEmail() {
  const [classes, setClasses] = useState<ClassDetails[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [user, setUser] = useState<any>(null);
  const [userId, setUserId] = useState("");
  const router = useRouter();
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (selectedClass) {
      fetchStudents(selectedClass);
    }
  }, [selectedClass]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userData = await getUserData(currentUser.uid);
        setUserId(userData.uid);
        fetchClasses(userData.uid);
      } else {
        router.push("/Authenticated/teacher");
      }
    });

    return () => unsubscribe();
  }, [router]);

  // 🔹 Fetch Classes
  const fetchClasses = async (uid: string) => {
    try {
      const response = await fetch(`/api/getClasses?userId=${uid}`);
      const data = await response.json();
      if (response.ok) {
        setClasses(data);
      } else {
        toast.error("Failed to fetch classes.");
      }
    } catch (error) {
      toast.error("Error fetching classes.");
    }
  };

  // 🔹 Fetch Students from Attendance and Retrieve Emails + Phone Numbers from Firestore
  const fetchStudents = async (classId: string) => {
    try {
      const response = await fetch(
        `/api/getAttendanceClass?classId=${classId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch attendance.");
      }

      const attendanceData = await response.json();

      // Extract unique student IDs from the attendance records
      const studentIds = [
        ...new Set(attendanceData.map((record: any) => record.studentId)),
      ];

      // Fetch student details from Firestore using studentId
      const studentDetails = await Promise.all(
        studentIds.map(async (studentId) => {
          try {
            const studentResponse = await fetch(
              `/api/getStudentById?userId=${studentId}`
            );

            if (!studentResponse.ok) {
              throw new Error(
                `Failed to fetch details for student ID: ${studentId}`
              );
            }

            const studentData = await studentResponse.json();
            const studentRecord = attendanceData.find(
              (s: any) => s.studentId === studentId
            );

            return {
              id: studentId,
              name: studentRecord?.studentName || "Unknown",
              email: studentData.email || "No Email",
              phone: studentData.phone || "No Phone", // Fetch phone number
            };
          } catch (err) {
            console.error(err);
            return {
              id: studentId,
              name: "Unknown",
              email: "Error fetching email",
              phone: "Error fetching phone",
            };
          }
        })
      );

      setStudents(studentDetails);
    } catch (error) {
      console.error(error);
      toast.error("Error fetching students.");
    }
  };

  // 🔹 Send Emails to all students in the selected class
  const sendEmail = async () => {
    if (!selectedClass || !message) {
      toast.error(
        "Please select a class, add a message, and ensure students exist."
      );
      return;
    }

    const emails = students.map((student) => student.email);

    try {
      const response = await fetch("/api/sendEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: emails,
          subject: "Attendance Update",
          text: message,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Emails sent successfully!");
      } else {
        toast.error(`Error sending emails: ${data.error}`);
      }
    } catch (error) {
      toast.error("Error sending emails.");
    }
  };

  // 🔹 Send SMS to all students in the selected class
  const sendSMS = async () => {
    if (!selectedClass || !message) {
      toast.error(
        "Please select a class, add a message, and ensure students exist."
      );
      return;
    }

    const phoneNumbers = students
      .map((student) => student.phone)
      .filter(Boolean); // Filter out empty phone numbers

    try {
      const response = await fetch("/api/sendSMS", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: phoneNumbers,
          message,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("SMS sent successfully!");
      } else {
        toast.error(`Error sending SMS: ${data.error}`);
      }
    } catch (error) {
      toast.error("Error sending SMS.");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        Send Notifications to Students
      </h1>

      {/* 🔹 Class Filter */}
      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-2">
          Select Class:
        </label>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="border border-gray-300 p-2 rounded-md w-full"
        >
          <option value="">Select a Class</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
            </option>
          ))}
        </select>
      </div>

      {/* 🔹 Student List */}
      {selectedClass && students.length > 0 && (
        <div className="bg-white p-4 rounded-md shadow-md mb-4">
          <h2 className="text-lg font-semibold">Students in this Class:</h2>
          <ul className="list-disc pl-5">
            {students.map((student, key) => (
              <li key={key}>
                {student.name} ({student.email}) - {student.phone}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 🔹 Message Input */}
      {selectedClass && (
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">
            Message:
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="border border-gray-300 p-2 rounded-md w-full"
            placeholder="Enter your message..."
          />
        </div>
      )}

      {/* 🔹 Send Buttons */}
      {selectedClass && (
        <div className="flex gap-4">
          <button
            onClick={sendEmail}
            className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition"
          >
            Send Email
          </button>
          <button
            onClick={sendSMS}
            className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600 transition"
          >
            Send SMS
          </button>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}
