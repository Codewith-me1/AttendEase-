"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";

interface Announcement {
  id: string;
  title: string | null;
  message: string;
  createdAt: string;
}

interface JoinedClass {
  id: string;
  name: string;
  joinCode: string;
  joinedAt: string;
}

function ClassroomComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [code, setCode] = useState<string | null>(null);
  const [className, setClassName] = useState<string | null>(null);
  const [classId, setClassId] = useState<string | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [classes, setClasses] = useState<JoinedClass[]>([]);
  const [loading, setLoading] = useState(false);
  const [markedToday, setMarkedToday] = useState(false);
  const [marking, setMarking] = useState(false);

  // Student's local "today" as YYYY-MM-DD — defines the current session.
  const today = new Date().toISOString().slice(0, 10);

  // Read email + code from the URL, falling back to the saved email.
  useEffect(() => {
    const urlEmail = searchParams.get("email");
    const urlCode = searchParams.get("code");
    let resolvedEmail = urlEmail || "";

    if (!resolvedEmail && typeof window !== "undefined") {
      resolvedEmail = window.localStorage.getItem("classroom_email") || "";
    }
    if (resolvedEmail && typeof window !== "undefined") {
      window.localStorage.setItem("classroom_email", resolvedEmail);
    }

    setEmail(resolvedEmail);
    setEmailInput(resolvedEmail);
    setCode(urlCode);
  }, [searchParams]);

  const loadClassView = useCallback(
    async (classCode: string, studentEmail: string) => {
      setLoading(true);
      try {
        const [classRes, annRes] = await Promise.all([
          fetch(`/api/getClassByCode?code=${encodeURIComponent(classCode)}`),
          fetch(`/api/getAnnouncements?code=${encodeURIComponent(classCode)}`),
        ]);
        const classData = await classRes.json();
        const annData = await annRes.json();
        setClassName(classRes.ok ? classData.name : null);
        setClassId(classRes.ok ? classData.id : null);
        setAnnouncements(annRes.ok ? annData.announcements || [] : []);

        // Has this student already marked today's session?
        if (classRes.ok && studentEmail) {
          const attRes = await fetch(
            `/api/getClassroomAttendance?classId=${encodeURIComponent(
              classData.id,
            )}&email=${encodeURIComponent(studentEmail)}&date=${today}`,
          );
          const attData = await attRes.json();
          setMarkedToday(attRes.ok && (attData.records?.length || 0) > 0);
        } else {
          setMarkedToday(false);
        }
      } catch {
        toast.error("Failed to load the class.", { position: "top-center" });
      } finally {
        setLoading(false);
      }
    },
    [today],
  );

  const loadClassList = useCallback(async (studentEmail: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/getStudentClasses?email=${encodeURIComponent(studentEmail)}`,
      );
      const data = await res.json();
      setClasses(res.ok ? data.classes || [] : []);
    } catch {
      toast.error("Failed to load your classes.", { position: "top-center" });
    } finally {
      setLoading(false);
    }
  }, []);

  // Decide which view to load: a single class (code present) or the list.
  useEffect(() => {
    if (code) {
      loadClassView(code, email);
    } else if (email) {
      loadClassList(email);
    }
  }, [code, email, loadClassView, loadClassList]);

  const markAttendance = async () => {
    if (!email) {
      toast.error("Please open this class from your join link so we know your email.", {
        position: "top-center",
      });
      return;
    }
    setMarking(true);
    try {
      const res = await fetch("/api/markClassroomAttendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId, code, email, sessionDate: today }),
      });
      const data = await res.json();
      if (res.ok) {
        setMarkedToday(true);
        toast.success(
          data.alreadyMarked
            ? "You're already marked present for today."
            : "Attendance marked for today!",
          { position: "top-center" },
        );
      } else {
        toast.error(data.error || "Failed to mark attendance.", { position: "top-center" });
      }
    } catch {
      toast.error("Something went wrong.", { position: "top-center" });
    } finally {
      setMarking(false);
    }
  };

  const prettyToday = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const applyEmail = () => {
    if (!emailInput.trim()) return;
    const clean = emailInput.trim();
    if (typeof window !== "undefined") {
      window.localStorage.setItem("classroom_email", clean);
    }
    router.push(`/classroom?email=${encodeURIComponent(clean)}`);
  };

  const formatDate = (ts: string) => new Date(ts).toLocaleString();

  // ---- No email yet: ask for it ----
  if (!email && !code) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
        <ToastContainer />
        <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md text-center">
          <h1 className="text-3xl font-bold text-[#7f56d8] mb-2">
            My Classroom
          </h1>
          <p className="text-gray-500 mb-6">
            Enter your email to see your classes and announcements.
          </p>
          <input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyEmail()}
            placeholder="you@example.com"
            className="border p-3 w-full rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-[#7f56d8]"
          />
          <button
            onClick={applyEmail}
            className="w-full bg-[#7f56d8] text-white p-3 rounded-md text-lg font-semibold hover:bg-[#6e48c9] transition"
          >
            View My Classes
          </button>
          <p className="text-sm text-gray-500 mt-4">
            Have a class code?{" "}
            <Link
              href="/join"
              className="text-[#7f56d8] font-semibold hover:underline"
            >
              Join a class
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <ToastContainer />

      {/* Header */}
      <header className="bg-[#7f56d8] text-white px-6 py-4 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          {code && (
            <Link
              href={
                email
                  ? `/classroom?email=${encodeURIComponent(email)}`
                  : "/classroom"
              }
              className="text-white/90 hover:text-white font-semibold"
            >
              ← My Classes
            </Link>
          )}
          <h1 className="text-2xl font-bold">
            {code ? className || "Classroom" : "My Classroom"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {email && <span className="text-sm text-white/90">{email}</span>}
          <Link
            href="/join"
            className="bg-white text-[#7f56d8] px-3 py-1.5 rounded-md font-semibold hover:bg-gray-100 transition text-sm"
          >
            + Join a class
          </Link>
        </div>
      </header>

      <main className="p-6 max-w-3xl mx-auto">
        {loading && <p className="text-center text-gray-500">Loading...</p>}

        {/* ---- Single class: today's attendance session ---- */}
        {!loading && code && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Today&apos;s Session
                </h2>
                <p className="text-sm text-gray-500">{prettyToday}</p>
              </div>
              <button
                onClick={markAttendance}
                disabled={marking || markedToday}
                className={`px-6 py-2.5 rounded-md font-semibold text-white transition ${
                  markedToday
                    ? "bg-green-500 cursor-default"
                    : marking
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#7f56d8] hover:bg-[#6e48c9]"
                }`}
              >
                {markedToday
                  ? "✅ Present"
                  : marking
                    ? "Marking..."
                    : "Mark Present"}
              </button>
            </div>
          </div>
        )}

        {/* ---- Single class: announcement feed ---- */}
        {!loading && code && (
          <div className="space-y-4">
            {announcements.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
                No announcements yet. Check back later!
              </div>
            ) : (
              announcements.map((a) => (
                <div key={a.id} className="bg-white rounded-xl shadow p-6">
                  {a.title && (
                    <h2 className="text-lg font-semibold text-[#7f56d8] mb-1">
                      {a.title}
                    </h2>
                  )}
                  <p className="text-gray-800 whitespace-pre-wrap">
                    {a.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-3">
                    {formatDate(a.createdAt)}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {/* ---- Class list ---- */}
        {!loading && !code && (
          <div className="space-y-4">
            {classes.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
                You haven&apos;t joined any classes yet.{" "}
                <Link
                  href="/join"
                  className="text-[#7f56d8] font-semibold hover:underline"
                >
                  Join one now
                </Link>
                .
              </div>
            ) : (
              classes.map((c) => (
                <Link
                  key={c.id}
                  href={`/classroom?code=${encodeURIComponent(c.joinCode)}&email=${encodeURIComponent(email)}`}
                  className="block bg-white rounded-xl shadow p-6 hover:shadow-md transition"
                >
                  <h2 className="text-xl font-semibold text-[#7f56d8]">
                    {c.name}
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Code: {c.joinCode}
                  </p>
                </Link>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function ClassroomPage() {
  return (
    <Suspense
      fallback={<div className="text-center mt-10 text-lg">Loading...</div>}
    >
      <ClassroomComponent />
    </Suspense>
  );
}
