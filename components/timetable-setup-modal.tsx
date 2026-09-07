"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Upload, X } from "lucide-react";
import { saveSemesterWithTimetable } from "@/app/actions/college";
import { WEEKDAYS, type Weekday } from "@/lib/dates";
import type { SemesterDTO } from "@/lib/college";
import { cn } from "@/lib/cn";

export interface DraftEntry {
  id: string;
  dayOfWeek: Weekday;
  startTime: string;
  endTime: string;
  subjectName: string;
  type: "CLASS" | "LAB" | "LECTURE" | "OTHER";
  room?: string;
  instructor?: string;
}

interface TimetableSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSemester?: SemesterDTO | null;
  onSaved?: () => void;
}

const SAMPLE_ENTRIES: DraftEntry[] = [
  // Monday
  {
    id: "mon-1",
    dayOfWeek: "MONDAY",
    startTime: "08:30",
    endTime: "09:20",
    subjectName: "Electronic Devices and Circuits",
    type: "CLASS",
    instructor: "Dr. A. P. Roger Rozario",
  },
  {
    id: "mon-2",
    dayOfWeek: "MONDAY",
    startTime: "09:20",
    endTime: "10:10",
    subjectName: "Electric Circuits",
    type: "CLASS",
    instructor: "Dr. Sivakumar D",
  },
  {
    id: "mon-3",
    dayOfWeek: "MONDAY",
    startTime: "10:10",
    endTime: "11:00",
    subjectName: "Calculus and its Applications",
    type: "CLASS",
    instructor: "Dr. Grayna J",
  },
  {
    id: "mon-4",
    dayOfWeek: "MONDAY",
    startTime: "11:15",
    endTime: "12:05",
    subjectName: "English Language Proficiency",
    type: "CLASS",
    instructor: "Dr. Ganesh C",
  },
  {
    id: "mon-5",
    dayOfWeek: "MONDAY",
    startTime: "12:05",
    endTime: "12:55",
    subjectName: "Electronic Devices and Circuits",
    type: "CLASS",
    instructor: "Dr. A. P. Roger Rozario",
  },
  {
    id: "mon-6",
    dayOfWeek: "MONDAY",
    startTime: "14:00",
    endTime: "14:50",
    subjectName: "Heritage of Tamils",
    type: "CLASS",
    instructor: "Mr. Prakash T",
  },
  {
    id: "mon-7",
    dayOfWeek: "MONDAY",
    startTime: "14:50",
    endTime: "15:40",
    subjectName: "Physics for Instrumentation Engineering",
    type: "CLASS",
    instructor: "Dr. Gowrishankar S",
  },
  {
    id: "mon-8",
    dayOfWeek: "MONDAY",
    startTime: "15:55",
    endTime: "16:45",
    subjectName: "Design Thinking for Innovation",
    type: "LAB",
    instructor: "Dr. Senthilkumar M",
  },

  // Tuesday
  {
    id: "tue-1",
    dayOfWeek: "TUESDAY",
    startTime: "08:30",
    endTime: "09:20",
    subjectName: "English Language Proficiency",
    type: "CLASS",
    instructor: "Dr. Ganesh C",
  },
  {
    id: "tue-2",
    dayOfWeek: "TUESDAY",
    startTime: "09:20",
    endTime: "10:10",
    subjectName: "Electric Circuits",
    type: "CLASS",
    instructor: "Dr. Sivakumar D",
  },
  {
    id: "tue-3",
    dayOfWeek: "TUESDAY",
    startTime: "10:10",
    endTime: "11:00",
    subjectName: "Physics for Instrumentation Engineering",
    type: "CLASS",
    instructor: "Dr. Gowrishankar S",
  },
  {
    id: "tue-4",
    dayOfWeek: "TUESDAY",
    startTime: "11:15",
    endTime: "12:55",
    subjectName: "Calculus and its Applications Lab",
    type: "LAB",
    instructor: "Dr. Grayna J & Dr. S. Duraimurugan",
  },
  {
    id: "tue-5",
    dayOfWeek: "TUESDAY",
    startTime: "14:00",
    endTime: "15:40",
    subjectName: "Circuits and Devices Laboratory",
    type: "LAB",
    instructor: "Dr. A. P. Roger Rozario & Dr. V.R. Kavya",
  },

  // Wednesday
  {
    id: "wed-1",
    dayOfWeek: "WEDNESDAY",
    startTime: "08:30",
    endTime: "09:20",
    subjectName: "Calculus and its Applications",
    type: "CLASS",
    instructor: "Dr. Grayna J",
  },
  {
    id: "wed-2",
    dayOfWeek: "WEDNESDAY",
    startTime: "09:20",
    endTime: "10:10",
    subjectName: "Mentor Mentee Meeting",
    type: "OTHER",
    instructor: "Dr. Suresh B & Dr. Sophia Jasmine G",
  },
  {
    id: "wed-3",
    dayOfWeek: "WEDNESDAY",
    startTime: "10:10",
    endTime: "11:00",
    subjectName: "Physics for Instrumentation Engineering",
    type: "CLASS",
    instructor: "Dr. Gowrishankar S",
  },
  {
    id: "wed-4",
    dayOfWeek: "WEDNESDAY",
    startTime: "11:15",
    endTime: "12:05",
    subjectName: "Library",
    type: "OTHER",
    instructor: "Dr. Krishnamurthy V",
  },
  {
    id: "wed-5",
    dayOfWeek: "WEDNESDAY",
    startTime: "12:05",
    endTime: "12:55",
    subjectName: "English Language Proficiency",
    type: "CLASS",
    instructor: "Dr. Ganesh C",
  },
  {
    id: "wed-6",
    dayOfWeek: "WEDNESDAY",
    startTime: "14:00",
    endTime: "14:50",
    subjectName: "Calculus and its Applications",
    type: "CLASS",
    instructor: "Dr. Grayna J",
  },
  {
    id: "wed-7",
    dayOfWeek: "WEDNESDAY",
    startTime: "14:50",
    endTime: "15:40",
    subjectName: "Design Thinking for Innovation",
    type: "LAB",
    instructor: "Dr. Senthilkumar M",
  },
  {
    id: "wed-8",
    dayOfWeek: "WEDNESDAY",
    startTime: "15:55",
    endTime: "16:45",
    subjectName: "English Language Proficiency",
    type: "CLASS",
    instructor: "Dr. Ganesh C",
  },

  // Thursday
  {
    id: "thu-1",
    dayOfWeek: "THURSDAY",
    startTime: "08:30",
    endTime: "10:10",
    subjectName: "Language Assessment",
    type: "OTHER",
    instructor: "Dr. Ganesh C",
  },
  {
    id: "thu-2",
    dayOfWeek: "THURSDAY",
    startTime: "10:10",
    endTime: "11:00",
    subjectName: "Electric Circuits",
    type: "CLASS",
    instructor: "Dr. Sivakumar D",
  },
  {
    id: "thu-3",
    dayOfWeek: "THURSDAY",
    startTime: "11:15",
    endTime: "12:55",
    subjectName: "Electric Circuits Tutorial",
    type: "CLASS",
    instructor: "Dr. Sivakumar D",
  },
  {
    id: "thu-4",
    dayOfWeek: "THURSDAY",
    startTime: "14:00",
    endTime: "15:40",
    subjectName: "Circuits and Devices Laboratory",
    type: "LAB",
    instructor: "Dr. A. P. Roger Rozario & Dr. V.R. Kavya",
  },

  // Friday
  {
    id: "fri-1",
    dayOfWeek: "FRIDAY",
    startTime: "08:30",
    endTime: "12:55",
    subjectName: "Engineering Graphics",
    type: "LAB",
    instructor: "Dr. R. Balaji & Dr. J. Karthick",
  },
  {
    id: "fri-2",
    dayOfWeek: "FRIDAY",
    startTime: "14:00",
    endTime: "14:50",
    subjectName: "Calculus and its Applications",
    type: "CLASS",
    instructor: "Dr. Grayna J",
  },
  {
    id: "fri-3",
    dayOfWeek: "FRIDAY",
    startTime: "14:50",
    endTime: "15:40",
    subjectName: "Electronic Devices and Circuits",
    type: "CLASS",
    instructor: "Dr. A. P. Roger Rozario",
  },
  {
    id: "fri-4",
    dayOfWeek: "FRIDAY",
    startTime: "15:55",
    endTime: "16:45",
    subjectName: "Physical Education",
    type: "OTHER",
    instructor: "Mr. Robinson A",
  },
];

export function TimetableSetupModal({
  isOpen,
  onClose,
  activeSemester,
  onSaved,
}: TimetableSetupModalProps) {
  const [semesterName, setSemesterName] = useState(
    "2026-27 ODD Semester (I ICE)",
  );
  const [startDateKey, setStartDateKey] = useState("2026-08-31");
  const [endDateKey, setEndDateKey] = useState("2026-12-31");
  const [entries, setEntries] = useState<DraftEntry[]>(SAMPLE_ENTRIES);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New entry form state
  const [newDay, setNewDay] = useState<Weekday>("MONDAY");
  const [newStart, setNewStart] = useState("08:30");
  const [newEnd, setNewEnd] = useState("09:20");
  const [newSubject, setNewSubject] = useState("");
  const [newType, setNewType] = useState<"CLASS" | "LAB" | "LECTURE" | "OTHER">("CLASS");
  const [newRoom, setNewRoom] = useState("");

  // Initialize from existing semester if available
  useEffect(() => {
    if (activeSemester) {
      setSemesterName(activeSemester.name);
      setStartDateKey(activeSemester.startDateKey);
      setEndDateKey(activeSemester.endDateKey);
      setEntries(
        activeSemester.timetable.map((t) => ({
          id: t.id,
          dayOfWeek: t.dayOfWeek,
          startTime: t.startTime,
          endTime: t.endTime,
          subjectName: t.subject?.name || t.title || "Untitled",
          type: (t.type as any) || "CLASS",
          room: t.room || undefined,
          instructor: t.instructor || undefined,
        })),
      );
    }
  }, [activeSemester]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function handleAddEntry() {
    if (!newSubject.trim()) {
      setError("Please enter a subject name.");
      return;
    }
    setError(null);
    const item: DraftEntry = {
      id: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      dayOfWeek: newDay,
      startTime: newStart,
      endTime: newEnd,
      subjectName: newSubject.trim(),
      type: newType,
      room: newRoom.trim() || undefined,
    };
    setEntries((prev) => [...prev, item]);
    setNewSubject("");
    setNewRoom("");
  }

  function handleDeleteEntry(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  function handleLoadSample() {
    setEntries(SAMPLE_ENTRIES);
    setError(null);
  }

  function handleJsonImport(jsonString: string) {
    try {
      const parsed = JSON.parse(jsonString);
      const list = Array.isArray(parsed) ? parsed : parsed.entries || parsed.timetable;
      if (!Array.isArray(list)) {
        throw new Error("Expected an array of entries");
      }
      const imported: DraftEntry[] = list.map((item: any, idx: number) => {
        const dayStr = String(item.day || item.dayOfWeek || "MONDAY").toUpperCase();
        const validDay = (WEEKDAYS as readonly string[]).includes(dayStr)
          ? (dayStr as Weekday)
          : "MONDAY";
        return {
          id: `imp-${Date.now()}-${idx}`,
          dayOfWeek: validDay,
          startTime: String(item.startTime || "08:30"),
          endTime: String(item.endTime || "09:20"),
          subjectName: String(item.subject || item.subjectName || "Subject"),
          type: (["CLASS", "LAB", "LECTURE", "OTHER"].includes(String(item.type).toUpperCase())
            ? String(item.type).toUpperCase()
            : "CLASS") as any,
          room: item.room ? String(item.room) : undefined,
          instructor: item.instructor ? String(item.instructor) : undefined,
        };
      });
      setEntries(imported);
      setError(null);
    } catch (e: any) {
      setError(`Invalid timetable JSON: ${e.message}`);
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === "string") {
        handleJsonImport(content);
      }
    };
    reader.readAsText(file);
  }

  async function handleSave() {
    if (!semesterName.trim()) {
      setError("Semester name is required.");
      return;
    }
    if (!startDateKey || !endDateKey) {
      setError("Start and end dates are required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const res = await saveSemesterWithTimetable({
      semesterName: semesterName.trim(),
      startDateKey,
      endDateKey,
      entries: entries.map((e) => ({
        dayOfWeek: e.dayOfWeek,
        startTime: e.startTime,
        endTime: e.endTime,
        subjectName: e.subjectName,
        type: e.type,
        room: e.room,
        instructor: e.instructor,
      })),
    });

    setIsSubmitting(false);

    if (!res.ok) {
      setError(res.error);
      return;
    }

    onSaved?.();
    onClose();
  }

  // Group entries by day for review
  const groupedEntries: Record<Weekday, DraftEntry[]> = {
    MONDAY: [],
    TUESDAY: [],
    WEDNESDAY: [],
    THURSDAY: [],
    FRIDAY: [],
    SATURDAY: [],
    SUNDAY: [],
  };

  entries.forEach((entry) => {
    groupedEntries[entry.dayOfWeek]?.push(entry);
  });

  // Sort each day by startTime
  Object.keys(groupedEntries).forEach((day) => {
    groupedEntries[day as Weekday].sort((a, b) =>
      a.startTime.localeCompare(b.startTime),
    );
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in-0"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-border bg-bg2 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <header className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-text">
              Set Up Your Semester
            </h2>
            <p className="text-xs text-muted">
              Configure your semester details and recurring weekly timetable
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-card hover:text-text"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 thin-scroll">
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs text-red-300">
              {error}
            </div>
          )}

          {/* Section 1: Semester Info */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
              1. Semester Details
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-xs text-text2 mb-1">
                  Semester Name
                </label>
                <input
                  type="text"
                  value={semesterName}
                  onChange={(e) => setSemesterName(e.target.value)}
                  placeholder="e.g. 2026-27 ODD Semester"
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-text placeholder:text-muted/60 focus:border-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-text2 mb-1">
                  Semester Starts
                </label>
                <input
                  type="date"
                  value={startDateKey}
                  onChange={(e) => setStartDateKey(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-text focus:border-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-text2 mb-1">
                  Semester Ends
                </label>
                <input
                  type="date"
                  value={endDateKey}
                  onChange={(e) => setEndDateKey(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-text focus:border-accent focus:outline-none"
                />
              </div>
            </div>
          </section>

          {/* Section 2: Timetable Import & Add */}
          <section className="space-y-3 border-t border-border pt-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
                2. Import or Add Classes
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="text-xs text-muted hover:text-text2 underline"
                >
                  Load sample
                </button>
                <label className="inline-flex cursor-pointer items-center gap-1 text-xs text-accent hover:underline">
                  <Upload className="h-3 w-3" />
                  Import JSON
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Quick Add Class Row */}
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-border/80 bg-card/60 p-3 sm:grid-cols-6">
              <div className="col-span-1">
                <label className="block text-[11px] text-muted mb-1">Day</label>
                <select
                  value={newDay}
                  onChange={(e) => setNewDay(e.target.value as Weekday)}
                  className="w-full rounded-lg border border-border bg-bg px-2 py-1.5 text-xs text-text"
                >
                  {WEEKDAYS.map((d) => (
                    <option key={d} value={d}>
                      {d.slice(0, 3)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-1">
                <label className="block text-[11px] text-muted mb-1">Start</label>
                <input
                  type="time"
                  value={newStart}
                  onChange={(e) => setNewStart(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-2 py-1.5 text-xs text-text"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-[11px] text-muted mb-1">End</label>
                <input
                  type="time"
                  value={newEnd}
                  onChange={(e) => setNewEnd(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-2 py-1.5 text-xs text-text"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-[11px] text-muted mb-1">Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full rounded-lg border border-border bg-bg px-2 py-1.5 text-xs text-text"
                >
                  <option value="CLASS">CLASS</option>
                  <option value="LAB">LAB</option>
                  <option value="LECTURE">LECTURE</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-[11px] text-muted mb-1">
                  Subject Name
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="e.g. Mathematics"
                    className="flex-1 rounded-lg border border-border bg-bg px-2 py-1.5 text-xs text-text placeholder:text-muted/60"
                  />
                  <button
                    type="button"
                    onClick={handleAddEntry}
                    className="rounded-lg bg-text px-2.5 py-1.5 text-xs font-semibold text-bg transition-colors hover:bg-text2"
                    title="Add class"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Review / Confirmation Table */}
          <section className="space-y-3 border-t border-border pt-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
              3. Timetable Review ({entries.length} classes scheduled)
            </h3>

            {entries.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-xs text-muted">
                No classes added yet. Use the add form above or load sample.
              </p>
            ) : (
              <div className="space-y-4">
                {WEEKDAYS.map((day) => {
                  const dayEntries = groupedEntries[day];
                  if (dayEntries.length === 0) return null;

                  return (
                    <div key={day} className="space-y-1.5">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted/80">
                        {day}
                      </h4>
                      <div className="divide-y divide-border/50 rounded-xl border border-border/80 bg-card/40">
                        {dayEntries.map((entry) => (
                          <div
                            key={entry.id}
                            className="flex items-center justify-between px-3 py-2 text-xs"
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-muted">
                                {entry.startTime} — {entry.endTime}
                              </span>
                              <span
                                className={cn(
                                  "rounded px-1.5 py-0.2 text-[10px] font-semibold uppercase",
                                  entry.type === "LAB"
                                    ? "bg-accent/15 text-accent"
                                    : "bg-bg text-text2",
                                )}
                              >
                                {entry.type}
                              </span>
                              <span className="font-medium text-text">
                                {entry.subjectName}
                              </span>
                              {entry.room && (
                                <span className="text-muted">
                                  ({entry.room})
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteEntry(entry.id)}
                              className="text-muted hover:text-red-400 transition-colors p-1"
                              aria-label="Remove entry"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Modal Footer */}
        <footer className="flex items-center justify-between border-t border-border bg-bg/50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-muted transition-colors hover:text-text"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting}
            className="rounded-lg bg-text px-5 py-2 text-sm font-medium text-bg transition-colors hover:bg-text2 disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Confirm Timetable"}
          </button>
        </footer>
      </div>
    </div>
  );
}
