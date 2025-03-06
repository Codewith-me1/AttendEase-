"use client";

import { useState, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { saveAs } from "file-saver";

export default function Teacher() {
  const [className, setClassName] = useState("");
  const [qrValue, setQrValue] = useState("");
  const [classCreated, setClassCreated] = useState(false); // ✅ Track form visibility
  const qrRef = useRef<HTMLDivElement>(null);

  const createClass = async () => {
    if (!className) {
      toast.error("Please enter a class name", { position: "top-center" });
      return;
    }

    try {
      const response = await fetch("/api/createClass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: className }),
      });

      const data = await response.json();

      if (data.error) {
        toast.error("Error creating class: " + data.error, {
          position: "top-center",
        });
      } else {
        toast.success("Class created successfully!", {
          position: "top-center",
        });

        const qrURL = `${window.location.origin}/student?classId=${data.classId}`;
        setQrValue(qrURL);
        setClassName(""); // Clear input field
        setClassCreated(true); // ✅ Hide form and show QR section
      }
    } catch (error) {
      toast.error("Failed to create class.", { position: "top-center" });
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

  const handleURL = () => {
    navigator.clipboard.writeText(qrValue);
    toast.info("Copied to ClipBoard", {
      position: "top-center",
    });
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

  return (
    <div className="flex flex-col items-center justify-center mt-[10rem] bg-gray-100 p-6">
      <ToastContainer />

      {/* ✅ Show Form Only If Class Is Not Created */}
      {!classCreated && (
        <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md text-center">
          <h1 className="text-3xl font-bold text-[#7f56d8] mb-6">
            Create a Class
          </h1>

          <input
            type="text"
            placeholder="Enter Class Name"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            className="border p-3 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-[#7f56d8] text-lg"
          />

          <button
            onClick={createClass}
            className="mt-4 w-full bg-[#7f56d8] text-white p-3 rounded-md text-lg font-semibold hover:bg-[#6e48c9] transition"
          >
            Create Class
          </button>
        </div>
      )}

      {/* ✅ Show QR Code Section After Class Is Created */}
      {classCreated && (
        <div className="mt-6 bg-white shadow-lg p-6 rounded-xl flex flex-col items-center text-center">
          <p className="text-xl font-semibold text-[#7f56d8] mb-4">
            Scan QR Code to Join Class
          </p>
          <div ref={qrRef} className="p-2 bg-gray-100 rounded-lg">
            <QRCodeCanvas value={qrValue} size={200} />
          </div>
          <p className="text-sm text-gray-500 mt-3">{qrValue}</p>

          {/* Buttons for sharing and downloading QR code */}
          <div className="mt-4 flex gap-3">
            <button
              onClick={shareQRCode}
              className="bg-[#7f56d8] text-white p-2 rounded-md font-semibold hover:bg-[#6e48c9] transition"
            >
              Share QR Code
            </button>
            <button
              onClick={downloadQRCode}
              className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600  font-semibold  transition"
            >
              Download QR
            </button>

            <button
              className="bg-gray-500 text-white p-2 rounded-md font-semibold hover:bg-gray-600 transition"
              onClick={() => {
                handleURL();
              }}
            >
              Copy URL
            </button>
          </div>

          {/* ✅ Show "Create Another Class" Button */}
          <button
            onClick={() => setClassCreated(false)} // ✅ Reset state to show form again
            className="mt-4 text-[#7f56d8] font-semibold hover:underline"
          >
            Create Another Class
          </button>
        </div>
      )}
    </div>
  );
}
