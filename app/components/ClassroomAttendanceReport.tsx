"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import fileDownload from "js-file-download";

interface Member {
  id: string;
  email: string;
  name: string | null;
  joinedAt: string;
}

interface AttendanceRecord {
  id: string;
  email: string;
  name: string | null;
  sessionDate: string;
  timestamp: string;
}

/** One student's attendance across the currently filtered session window. */
interface StudentSummary {
  email: string;
  name: string;
  present: number;
  firstPresent: string | null;
  lastPresent: string | null;
  records: AttendanceRecord[];
}

/** Wrap a CSV cell so names/emails containing commas or quotes stay intact. */
const csvCell = (value: string | null | undefined) => {
  const text = value == null ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const csvRow = (cells: (string | null | undefined)[]) =>
  cells.map(csvCell).join(",");

/** Strip characters that make for awkward filenames. */
const safeFileName = (text: string) =>
  text.replace(/[^a-z0-9._-]+/gi, "_").replace(/^_+|_+$/g, "") || "class";

/**
 * Teacher-facing classroom attendance report.
 *
 * Presents the per-day classroom marks two ways — a per-student summary and the
 * raw record log — over a shared set of filters (free-text search, a single
 * student, one session, or a date range). Every view can be downloaded as CSV,
 * including a single student's own record.
 *
 * Filtering happens client-side: the class's marks are at most one row per
 * student per day, so the whole set is already loaded and filters stay instant.
 */
export default function ClassroomAttendanceReport({
  classId,
  className,
  members,
}: {
  classId: string;
  className: string;
  members: Member[];
}) {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [view, setView] = useState<"student" | "records">("student");
  const [search, setSearch] = useState("");
  const [studentFilter, setStudentFilter] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const loadAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/getClassroomAttendance?classId=${encodeURIComponent(classId)}`,
      );
      const data = await res.json();
      if (res.ok) setAttendance(data.records || []);
    } catch {
      /* non-critical: the section simply shows as empty */
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const formatDateTime = (ts: string) => new Date(ts).toLocaleString();

  /**
   * A sessionDate is a calendar day (YYYY-MM-DD), not an instant. Building the
   * Date from its parts keeps it local: `new Date("2026-07-26")` would parse as
   * UTC midnight and render as the previous day west of UTC.
   */
  const formatDay = (day: string) => {
    const [y, m, d] = day.split("-").map(Number);
    if (!y || !m || !d) return day;
    return new Date(y, m - 1, d).toLocaleDateString();
  };

  /** Every session day the class has ever held, newest first. */
  const allSessionDates = useMemo(
    () =>
      Array.from(new Set(attendance.map((r) => r.sessionDate))).sort((a, b) =>
        a < b ? 1 : -1,
      ),
    [attendance],
  );

  /**
   * Records inside the selected session window, before any student/search
   * narrowing. This is what "sessions held" is counted from, so a student's
   * rate stays meaningful when searching for one person.
   */
  const windowRecords = useMemo(
    () =>
      attendance.filter((r) => {
        // A chosen session wins outright: the range inputs are disabled while
        // one is picked, so leftover values in them must not still filter.
        if (sessionDate) return r.sessionDate === sessionDate;
        // sessionDate is YYYY-MM-DD, so string compares order correctly.
        if (fromDate && r.sessionDate < fromDate) return false;
        if (toDate && r.sessionDate > toDate) return false;
        return true;
      }),
    [attendance, sessionDate, fromDate, toDate],
  );

  const sessionsHeld = useMemo(
    () => new Set(windowRecords.map((r) => r.sessionDate)).size,
    [windowRecords],
  );

  const matchesSearch = useCallback(
    (name: string | null, email: string) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        (name || "").toLowerCase().includes(q) ||
        email.toLowerCase().includes(q)
      );
    },
    [search],
  );

  /** The flat record log, after all filters. Drives the "All Records" view. */
  const filteredRecords = useMemo(
    () =>
      windowRecords.filter(
        (r) =>
          (!studentFilter || r.email === studentFilter) &&
          matchesSearch(r.name, r.email),
      ),
    [windowRecords, studentFilter, matchesSearch],
  );

  /**
   * Per-student rollup. Built from the class roster so students who have never
   * marked still appear (with 0 present) rather than silently vanishing, and
   * topped up with any attendance email that predates the roster.
   */
  const studentSummaries = useMemo(() => {
    const byEmail = new Map<string, StudentSummary>();

    const ensure = (email: string, name: string | null) => {
      let row = byEmail.get(email);
      if (!row) {
        row = {
          email,
          name: name || email.split("@")[0],
          present: 0,
          firstPresent: null,
          lastPresent: null,
          records: [],
        };
        byEmail.set(email, row);
      }
      return row;
    };

    members.forEach((m) => ensure(m.email, m.name));
    windowRecords.forEach((r) => ensure(r.email, r.name));

    windowRecords.forEach((r) => {
      const row = byEmail.get(r.email);
      if (!row) return;
      row.present += 1;
      row.records.push(r);
      if (!row.firstPresent || r.sessionDate < row.firstPresent) {
        row.firstPresent = r.sessionDate;
      }
      if (!row.lastPresent || r.sessionDate > row.lastPresent) {
        row.lastPresent = r.sessionDate;
      }
    });

    return Array.from(byEmail.values())
      .map((row) => ({
        ...row,
        records: [...row.records].sort((a, b) =>
          a.sessionDate < b.sessionDate ? 1 : -1,
        ),
      }))
      .filter(
        (row) =>
          (!studentFilter || row.email === studentFilter) &&
          matchesSearch(row.name, row.email),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [members, windowRecords, studentFilter, matchesSearch]);

  /** Roster for the student dropdown: everyone known to this class. */
  const studentOptions = useMemo(() => {
    const byEmail = new Map<string, string>();
    members.forEach((m) => byEmail.set(m.email, m.name || m.email));
    attendance.forEach((r) => {
      if (!byEmail.has(r.email)) byEmail.set(r.email, r.name || r.email);
    });
    return Array.from(byEmail.entries())
      .map(([email, name]) => ({ email, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [members, attendance]);

  const rateOf = (present: number) =>
    sessionsHeld > 0 ? Math.round((present / sessionsHeld) * 100) : null;

  const filtersActive =
    !!search || !!studentFilter || !!sessionDate || !!fromDate || !!toDate;

  const resetFilters = () => {
    setSearch("");
    setStudentFilter("");
    setSessionDate("");
    setFromDate("");
    setToDate("");
    setExpanded(null);
  };

  /** Describes the active window, used in file names and empty states. */
  const rangeLabel = sessionDate
    ? sessionDate
    : fromDate || toDate
      ? `${fromDate || "start"}_to_${toDate || "end"}`
      : "all";

  const downloadStudentSummary = () => {
    if (studentSummaries.length === 0) {
      toast.error("No students match the current filters.", {
        position: "top-center",
      });
      return;
    }
    const csv = [
      csvRow([
        "Student",
        "Email",
        "Sessions Present",
        "Sessions Held",
        "Attendance Rate",
        "First Present",
        "Last Present",
      ]),
      ...studentSummaries.map((s) => {
        const rate = rateOf(s.present);
        return csvRow([
          s.name,
          s.email,
          String(s.present),
          String(sessionsHeld),
          rate === null ? "" : `${rate}%`,
          s.firstPresent || "",
          s.lastPresent || "",
        ]);
      }),
    ].join("\n");

    fileDownload(
      csv,
      `${safeFileName(className)}_attendance_by_student_${rangeLabel}.csv`,
    );
  };

  const downloadRecords = () => {
    if (filteredRecords.length === 0) {
      toast.error("No attendance records match the current filters.", {
        position: "top-center",
      });
      return;
    }
    const csv = [
      csvRow(["Session Date", "Student", "Email", "Marked At"]),
      ...filteredRecords.map((r) =>
        csvRow([
          r.sessionDate,
          r.name || "",
          r.email,
          formatDateTime(r.timestamp),
        ]),
      ),
    ].join("\n");

    fileDownload(
      csv,
      `${safeFileName(className)}_attendance_records_${rangeLabel}.csv`,
    );
  };

  /** One student's own attendance record, downloaded from their row. */
  const downloadOneStudent = (student: StudentSummary) => {
    if (student.records.length === 0) {
      toast.error(`${student.name} has no attendance in this range.`, {
        position: "top-center",
      });
      return;
    }
    const rate = rateOf(student.present);
    const csv = [
      csvRow(["Student", student.name]),
      csvRow(["Email", student.email]),
      csvRow(["Class", className]),
      csvRow(["Sessions Present", `${student.present} of ${sessionsHeld}`]),
      csvRow(["Attendance Rate", rate === null ? "" : `${rate}%`]),
      "",
      csvRow(["Session Date", "Marked At"]),
      ...student.records.map((r) =>
        csvRow([r.sessionDate, formatDateTime(r.timestamp)]),
      ),
    ].join("\n");

    fileDownload(
      csv,
      `${safeFileName(className)}_${safeFileName(student.email)}_attendance_${rangeLabel}.csv`,
    );
  };

  const studentsMarked = useMemo(
    () => new Set(windowRecords.map((r) => r.email)).size,
    [windowRecords],
  );

  return (
    <div className="bg-white p-6 rounded-md shadow-md mt-6">
      <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-700">
            Classroom Attendance
          </h3>
          <p className="text-sm text-gray-500">
            Per-student attendance for this classroom. Search, filter by student
            or date, and download any view. A new session starts each day.
          </p>
        </div>
        <button
          onClick={loadAttendance}
          className="border border-gray-300 text-gray-600 px-3 py-2 rounded-md text-sm font-semibold hover:bg-gray-50 transition"
        >
          Refresh
        </button>
      </div>

      {/* Summary tiles for the active window */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="bg-gray-50 rounded-md p-3">
          <p className="text-xs text-gray-500">Sessions held</p>
          <p className="text-xl font-bold text-gray-800">{sessionsHeld}</p>
        </div>
        <div className="bg-gray-50 rounded-md p-3">
          <p className="text-xs text-gray-500">Students marked</p>
          <p className="text-xl font-bold text-gray-800">{studentsMarked}</p>
        </div>
        <div className="bg-gray-50 rounded-md p-3">
          <p className="text-xs text-gray-500">Total marks</p>
          <p className="text-xl font-bold text-gray-800">
            {windowRecords.length}
          </p>
        </div>
        <div className="bg-gray-50 rounded-md p-3">
          <p className="text-xs text-gray-500">Class members</p>
          <p className="text-xl font-bold text-gray-800">{members.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="border rounded-md p-4 mb-5 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Search student
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="border p-2 rounded-md w-full text-sm focus:outline-none focus:ring-2 focus:ring-[#7f56d8]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Student
            </label>
            <select
              value={studentFilter}
              onChange={(e) => {
                setStudentFilter(e.target.value);
                setExpanded(null);
              }}
              className="border p-2 rounded-md w-full text-sm bg-white"
            >
              <option value="">All students</option>
              {studentOptions.map((s) => (
                <option key={s.email} value={s.email}>
                  {s.name} ({s.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Session
            </label>
            <select
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="border p-2 rounded-md w-full text-sm bg-white"
            >
              <option value="">All sessions</option>
              {allSessionDates.map((d) => (
                <option key={d} value={d}>
                  {formatDay(d)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              From date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              disabled={!!sessionDate}
              className="border p-2 rounded-md w-full text-sm disabled:bg-gray-100 disabled:text-gray-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              To date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              disabled={!!sessionDate}
              className="border p-2 rounded-md w-full text-sm disabled:bg-gray-100 disabled:text-gray-400"
            />
          </div>
        </div>

        {sessionDate && (
          <p className="text-xs text-gray-500 mt-2">
            Showing a single session — clear it to use the date range.
          </p>
        )}

        <div className="flex items-center justify-between flex-wrap gap-3 mt-4">
          {/* View switch */}
          <div className="inline-flex rounded-md border overflow-hidden bg-white">
            <button
              onClick={() => setView("student")}
              className={`px-4 py-2 text-sm font-semibold transition ${
                view === "student"
                  ? "bg-[#7f56d8] text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              By Student
            </button>
            <button
              onClick={() => setView("records")}
              className={`px-4 py-2 text-sm font-semibold transition ${
                view === "records"
                  ? "bg-[#7f56d8] text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              All Records
            </button>
          </div>

          <div className="flex items-center gap-2">
            {filtersActive && (
              <button
                onClick={resetFilters}
                className="text-sm text-gray-600 font-semibold hover:text-gray-800 underline"
              >
                Clear filters
              </button>
            )}
            <button
              onClick={
                view === "student" ? downloadStudentSummary : downloadRecords
              }
              className="bg-green-500 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-green-600 transition"
            >
              {view === "student"
                ? "Download Per-Student CSV"
                : "Download Records CSV"}
            </button>
          </div>
        </div>
      </div>

      {loading && <p className="text-sm text-gray-500">Loading attendance...</p>}

      {/* ---- Per-student view ---- */}
      {!loading &&
        view === "student" &&
        (studentSummaries.length === 0 ? (
          <p className="text-sm text-gray-500">
            No students match the current filters.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">Student</th>
                  <th className="border p-2 text-left">Email</th>
                  <th className="border p-2 text-left">Present</th>
                  <th className="border p-2 text-left">Rate</th>
                  <th className="border p-2 text-left">Last Present</th>
                  <th className="border p-2 text-center">Record</th>
                </tr>
              </thead>
              <tbody>
                {studentSummaries.map((s) => {
                  const rate = rateOf(s.present);
                  const isOpen = expanded === s.email;
                  return (
                    <Fragment key={s.email}>
                      <tr className="border">
                        <td className="border p-2 font-medium text-gray-800">
                          {s.name}
                        </td>
                        <td className="border p-2 text-gray-600">{s.email}</td>
                        <td className="border p-2">
                          {s.present} / {sessionsHeld}
                        </td>
                        <td className="border p-2">
                          {rate === null ? (
                            "—"
                          ) : (
                            <span
                              className={`font-semibold ${
                                rate >= 75
                                  ? "text-green-600"
                                  : rate >= 50
                                    ? "text-yellow-600"
                                    : "text-red-600"
                              }`}
                            >
                              {rate}%
                            </span>
                          )}
                        </td>
                        <td className="border p-2">
                          {s.lastPresent ? formatDay(s.lastPresent) : "—"}
                        </td>
                        <td className="border p-2">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() =>
                                setExpanded(isOpen ? null : s.email)
                              }
                              disabled={s.present === 0}
                              className="border border-gray-300 text-gray-700 px-2 py-1 rounded-md text-xs font-semibold hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              {isOpen ? "Hide" : "View"}
                            </button>
                            <button
                              onClick={() => downloadOneStudent(s)}
                              disabled={s.present === 0}
                              className="bg-green-500 text-white px-2 py-1 rounded-md text-xs font-semibold hover:bg-green-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              CSV
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr className="bg-gray-50">
                          <td colSpan={6} className="border p-4">
                            <p className="text-sm font-semibold text-gray-700 mb-2">
                              {s.name} — {s.present} session
                              {s.present === 1 ? "" : "s"} present
                            </p>
                            <ul className="divide-y max-h-56 overflow-y-auto">
                              {s.records.map((r) => (
                                <li
                                  key={r.id}
                                  className="py-1.5 flex justify-between gap-4 text-sm"
                                >
                                  <span className="text-gray-800">
                                    {formatDay(r.sessionDate)}
                                  </span>
                                  <span className="text-gray-500">
                                    marked {formatDateTime(r.timestamp)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}

      {/* ---- Flat record log ---- */}
      {!loading &&
        view === "records" &&
        (filteredRecords.length === 0 ? (
          <p className="text-sm text-gray-500">
            No attendance records match the current filters.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">Session Date</th>
                  <th className="border p-2 text-left">Student</th>
                  <th className="border p-2 text-left">Email</th>
                  <th className="border p-2 text-left">Marked At</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((r) => (
                  <tr key={r.id} className="border">
                    <td className="border p-2">{formatDay(r.sessionDate)}</td>
                    <td className="border p-2">{r.name || "—"}</td>
                    <td className="border p-2">{r.email}</td>
                    <td className="border p-2">
                      {formatDateTime(r.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-gray-500 mt-2">
              Showing {filteredRecords.length} of {attendance.length} record
              {attendance.length === 1 ? "" : "s"}.
            </p>
          </div>
        ))}
    </div>
  );
}
