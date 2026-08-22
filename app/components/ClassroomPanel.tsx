"use client";

import { useCallback, useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "react-toastify";
import ClassroomAttendanceReport from "./ClassroomAttendanceReport";

interface Member {
  id: string;
  email: string;
  name: string | null;
  joinedAt: string;
}

interface Announcement {
  id: string;
  title: string | null;
  message: string;
  createdAt: string;
}

/**
 * Teacher-facing "Google Classroom" panel embedded in the class detail page.
 * Shows the class join code + link, the members who have self-joined, and lets
 * the teacher post announcements that get emailed to every member.
 */
export default function ClassroomPanel({
  classId,
  className,
}: {
  classId: string;
  className: string;
}) {
  const [code, setCode] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [posting, setPosting] = useState(false);
  const [joinLink, setJoinLink] = useState("");

  const loadMembers = useCallback(async () => {
    try {
      const res = await fetch(`/api/getMembers?classId=${classId}`);
      const data = await res.json();
      if (res.ok) setMembers(data.members || []);
    } catch {
      /* non-critical */
    }
  }, [classId]);

  const loadAnnouncements = useCallback(async () => {
    try {
      const res = await fetch(`/api/getAnnouncements?classId=${classId}`);
      const data = await res.json();
      if (res.ok) setAnnouncements(data.announcements || []);
    } catch {
      /* non-critical */
    }
  }, [classId]);

  useEffect(() => {
    // Ensure a join code exists (older classes get one lazily).
    const loadCode = async () => {
      try {
        const res = await fetch(`/api/ensureClassCode?classId=${classId}`);
        const data = await res.json();
        if (res.ok) {
          setCode(data.code);
          if (typeof window !== "undefined") {
            setJoinLink(`${window.location.origin}/join?code=${data.code}`);
          }
        }
      } catch {
        /* non-critical */
      }
    };

    loadCode();
    loadMembers();
    loadAnnouncements();
  }, [classId, loadMembers, loadAnnouncements]);

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.info(`${label} copied to clipboard`, { position: "top-center" });
  };

  const postAnnouncement = async () => {
    if (!message.trim()) {
      toast.error("Please write an announcement message.", { position: "top-center" });
      return;
    }
    setPosting(true);
    try {
      const res = await fetch("/api/createAnnouncement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId, title: title.trim(), message: message.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(
          data.totalMembers > 0
            ? `Announcement posted — emailed ${data.notified}/${data.totalMembers} student(s).`
            : "Announcement posted.",
          { position: "top-center" }
        );
        setTitle("");
        setMessage("");
        loadAnnouncements();
      } else {
        toast.error(data.error || "Failed to post announcement.", { position: "top-center" });
      }
    } catch {
      toast.error("Something went wrong.", { position: "top-center" });
    } finally {
      setPosting(false);
    }
  };

  const formatDate = (ts: string) => new Date(ts).toLocaleString();

  return (
    <div className="mt-10 w-full">
      <h2 className="text-2xl font-bold text-[#7f56d8] mb-4">Classroom</h2>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Join code / link */}
        <div className="bg-white p-6 rounded-md shadow-md flex-1">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Invite Students</h3>
          <p className="text-sm text-gray-500 mb-4">
            Share this code or link. Students join by entering their email — no login needed.
          </p>

          <div className="flex items-center justify-between bg-gray-100 rounded-md p-3 mb-3">
            <span className="text-2xl font-bold tracking-widest text-[#7f56d8]">
              {code || "..."}
            </span>
            {code && (
              <button
                onClick={() => copy(code, "Class code")}
                className="bg-[#7f56d8] text-white px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-[#6e48c9] transition"
              >
                Copy code
              </button>
            )}
          </div>

          {joinLink && (
            <div className="flex items-center gap-2 mb-4">
              <input
                readOnly
                value={joinLink}
                className="border p-2 rounded-md flex-1 text-sm text-gray-600 bg-gray-50"
              />
              <button
                onClick={() => copy(joinLink, "Join link")}
                className="bg-gray-600 text-white px-3 py-2 rounded-md text-sm font-semibold hover:bg-gray-700 transition whitespace-nowrap"
              >
                Copy link
              </button>
            </div>
          )}

          {joinLink && (
            <div className="flex justify-center p-3 bg-gray-100 rounded-lg">
              <QRCodeCanvas value={joinLink} size={160} />
            </div>
          )}
        </div>

        {/* Members */}
        <div className="bg-white p-6 rounded-md shadow-md flex-1">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Members ({members.length})
          </h3>
          {members.length === 0 ? (
            <p className="text-sm text-gray-500">No students have joined yet.</p>
          ) : (
            <ul className="divide-y max-h-64 overflow-y-auto">
              {members.map((m) => (
                <li key={m.id} className="py-2">
                  <p className="font-medium text-gray-800">{m.name || m.email}</p>
                  <p className="text-sm text-gray-500">{m.email}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Post announcement */}
      <div className="bg-white p-6 rounded-md shadow-md mt-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Post an Announcement</h3>
        <p className="text-sm text-gray-500 mb-4">
          Every member sees this in their classroom and gets an individual email.
        </p>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (optional)"
          className="border p-3 w-full rounded-md mb-3 focus:outline-none focus:ring-2 focus:ring-[#7f56d8]"
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your announcement to the class..."
          rows={4}
          className="border p-3 w-full rounded-md mb-3 focus:outline-none focus:ring-2 focus:ring-[#7f56d8]"
        />
        <button
          onClick={postAnnouncement}
          disabled={posting}
          className={`px-6 py-2.5 rounded-md text-white font-semibold transition ${
            posting ? "bg-gray-400 cursor-not-allowed" : "bg-[#7f56d8] hover:bg-[#6e48c9]"
          }`}
        >
          {posting ? "Posting..." : "Post & Notify"}
        </button>
      </div>

      {/* Announcement history */}
      <div className="bg-white p-6 rounded-md shadow-md mt-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Announcements</h3>
        {announcements.length === 0 ? (
          <p className="text-sm text-gray-500">No announcements posted yet.</p>
        ) : (
          <div className="space-y-4">
            {announcements.map((a) => (
              <div key={a.id} className="border rounded-md p-4">
                {a.title && (
                  <h4 className="font-semibold text-[#7f56d8] mb-1">{a.title}</h4>
                )}
                <p className="text-gray-800 whitespace-pre-wrap">{a.message}</p>
                <p className="text-xs text-gray-400 mt-2">{formatDate(a.createdAt)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Per-student classroom attendance: search, filter, view, download */}
      <ClassroomAttendanceReport
        classId={classId}
        className={className}
        members={members}
      />
    </div>
  );
}
