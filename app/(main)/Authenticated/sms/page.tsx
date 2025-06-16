"use client";

import { auth } from "@/app/firebase/config";
import { getUserData } from "@/app/firebase/database";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";

interface ClassDetails {
  id: string;
  name: string;
}

export default function SendClassReminders() {
  const [classes, setClasses] = useState<ClassDetails[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  const router = useRouter();
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

  const fetchClasses = async (userId: string) => {
    try {
      const response = await fetch(`/api/getClasses?userId=${userId}`);
      const data = await response.json();
      setClasses(data);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const handleSend = async () => {
    if (!selectedClass || !messageBody.trim()) {
      toast.error("Please select a class and enter a message body.");
      return;
    }

    try {
      const res = await fetch("/api/sendClassReminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: selectedClass,
          message: messageBody,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("Reminders sent successfully!");
      } else {
        toast.error(result.message || "Failed to send reminders.");
      }
    } catch (err) {
      toast.error("Something went wrong.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Send SMS Reminders to Class</h2>

      <label className="block font-semibold mb-2">Select Class:</label>
      <select
        className="w-full border p-2 mb-4 rounded"
        value={selectedClass}
        onChange={(e) => setSelectedClass(e.target.value)}
      >
        <option value="">-- Choose a Class --</option>
        {classes.map((cls) => (
          <option key={cls.id} value={cls.id}>
            {cls.name}
          </option>
        ))}
      </select>

      <label className="block font-semibold mb-2">Message Body:</label>
      <textarea
        rows={5}
        className="w-full border p-2 mb-4 rounded"
        placeholder="Write your SMS reminder message here..."
        value={messageBody}
        onChange={(e) => setMessageBody(e.target.value)}
      ></textarea>

      <button
        onClick={handleSend}
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
      >
        Send Reminders
      </button>

      <ToastContainer />
    </div>
  );
}
