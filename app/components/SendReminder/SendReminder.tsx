"use client";

import { useState } from "react";
import { toast } from "react-toastify";

interface SendReminderButtonProps {
  phoneNumber: string;
  studentName: string;
}

export default function SendReminderButton({
  phoneNumber,
  studentName,
}: SendReminderButtonProps) {
  const [loading, setLoading] = useState(false);

  const sendReminder = async () => {
    if (!phoneNumber) {
      toast.error("No phone number provided.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/sendReminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, studentName }),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success("Reminder sent successfully!");
      } else {
        toast.error(result.message || "Failed to send reminder.");
      }
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={sendReminder}
      disabled={loading}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? "Sending..." : "Send SMS Reminder"}
    </button>
  );
}
