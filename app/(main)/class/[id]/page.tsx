// "use client";

// import { useEffect, useState } from "react";
// import { useParams } from "next/navigation";
// import { QRCodeCanvas } from "qrcode.react";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// interface ClassDetails {
//   id: string;
//   name: string;
//   qrCode: string;
//   createdAt: string;
// }

// interface AttendanceRecord {
//   id: string;
//   studentName: string;
//   timestamp: string;
// }

// export default function ClassPage() {
//   const params = useParams();
//   const { id } = params; // dynamic route: /class/[id]

//   const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
//   const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (id) {
//       fetchClassDetails(id);
//       fetchAttendanceRecords(id);
//     }
//   }, [id]);

//   const fetchClassDetails = async (classId: string) => {
//     try {
//       const response = await fetch(`/api/getClass?classId=${classId}`);
//       const data = await response.json();
//       if (data.error) {
//         toast.error(data.error);
//       } else {
//         setClassDetails(data);
//       }
//     } catch (error) {
//       toast.error("Failed to fetch class details");
//     }
//   };

//   const fetchAttendanceRecords = async (classId: string) => {
//     try {
//       const response = await fetch(
//         `/api/getClassAttendance?classId=${classId}`
//       );
//       const data = await response.json();
//       if (data.error) {
//         toast.error(data.error);
//       } else {
//         setAttendance(data);
//       }
//     } catch (error) {
//       toast.error("Failed to fetch attendance records");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <p>Loading...</p>
//         <ToastContainer />
//       </div>
//     );
//   }

//   if (!classDetails) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <p>Class not found.</p>
//         <ToastContainer />
//       </div>
//     );
//   }

//   return (
//     <div className="p-6">
//       <ToastContainer />
//       {/* Class Name */}
//       <h1 className="text-3xl font-bold text-[#7f56d8] mb-4">
//         {classDetails.name}
//       </h1>

//       {/* QR Code Section */}
//       <div className="mb-8">
//         <h2 className="text-xl font-semibold text-gray-700 mb-2">QR Code</h2>
//         <div className="bg-white p-4 shadow rounded-lg inline-block">
//           <QRCodeCanvas value={classDetails.qrCode} size={200} />
//         </div>
//         <p className="text-sm text-gray-500 mt-2">{classDetails.qrCode}</p>
//       </div>

//       {/* Attendance Records Table */}
//       <div>
//         <h2 className="text-2xl font-semibold text-gray-700 mb-4">
//           Attendance Records
//         </h2>
//         {attendance.length === 0 ? (
//           <p className="text-gray-500">No attendance records found.</p>
//         ) : (
//           <table className="min-w-full bg-white border border-gray-300 rounded-lg">
//             <thead className="bg-[#7f56d8] text-white">
//               <tr>
//                 <th className="py-3 px-4 text-left">Student Name</th>
//                 <th className="py-3 px-4 text-left">Timestamp</th>
//               </tr>
//             </thead>
//             <tbody>
//               {attendance.map((record) => (
//                 <tr key={record.id} className="border-b hover:bg-gray-100">
//                   <td className="py-3 px-4">{record.studentName}</td>
//                   <td className="py-3 px-4">
//                     {new Date(record.timestamp).toLocaleString()}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>
//     </div>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { saveAs } from "file-saver";
interface ClassDetails {
  id: string;
  name: string;
  createdAt: string;
}

export default function ClassPage() {
  const params = useParams();
  const { id } = params; // This should match the dynamic route [id]
  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrValue, setQrValue] = useState("");
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      fetchClassDetails(id as string);
    }
  }, [id]);

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <ToastContainer />
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md text-center">
        {/* Class Name */}
        <h1 className="text-3xl font-bold text-[#7f56d8] mb-4">
          {classDetails.name}
        </h1>

        {/* Creation Date */}
        <p className="text-gray-600 mb-4">
          Created At: {new Date(classDetails.createdAt).toLocaleString()}
        </p>

        {/* QR Code Section */}
        <div className="mb-4">
          <p className="text-xl font-semibold text-[#7f56d8] mb-2">QR Code</p>
          <div ref={qrRef} className="p-2 bg-gray-100 rounded-lg inline-block">
            <QRCodeCanvas value={qrValue} size={200} />
          </div>
          <p className="text-sm text-gray-500 mt-2">{qrValue}</p>
        </div>
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
          className="bg-gray-500 text-white p-2 rounded-md font-semibold hover:bg-gray-600 transition"
        >
          Download QR
        </button>
      </div>
    </div>
  );
}
