"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession, readTimezone } from "@/lib/auth";
import {
  getServerToday,
  parseDateKey,
  isValidDateKey,
  WEEKDAYS,
  type Weekday,
} from "@/lib/dates";
import {
  getActiveSemesterForUser,
  getTodayScheduleForUser,
  type SemesterDTO,
  type TimetableEntryDTO,
} from "@/lib/college";

export type CollegeActionErrorCode =
  | "UNAUTHORIZED"
  | "INVALID_INPUT"
  | "SERVER_ERROR";

export type CollegeActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code: CollegeActionErrorCode };

const entrySchema = z.object({
  dayOfWeek: z.enum(WEEKDAYS),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid start time format (HH:mm)"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid end time format (HH:mm)"),
  subjectName: z.string().trim().min(1, "Subject name cannot be empty"),
  type: z.enum(["CLASS", "LAB", "LECTURE", "OTHER"]).default("CLASS"),
  room: z.string().trim().optional(),
  instructor: z.string().trim().optional(),
});

const saveSemesterSchema = z.object({
  semesterName: z.string().trim().min(1, "Semester name is required"),
  startDateKey: z.string().refine(isValidDateKey, "Invalid start date"),
  endDateKey: z.string().refine(isValidDateKey, "Invalid end date"),
  entries: z.array(entrySchema),
});

export type SaveSemesterInput = z.infer<typeof saveSemesterSchema>;

export async function getActiveSemester(): Promise<
  CollegeActionResult<SemesterDTO | null>
> {
  const session = await getSession();
  if (!session) {
    return { ok: false, code: "UNAUTHORIZED", error: "Please sign in." };
  }

  const semester = await getActiveSemesterForUser(session.userId);
  return { ok: true, data: semester };
}

export async function getTodaySchedule(): Promise<
  CollegeActionResult<TimetableEntryDTO[]>
> {
  const session = await getSession();
  if (!session) {
    return { ok: false, code: "UNAUTHORIZED", error: "Please sign in." };
  }

  const store = await cookies();
  const tz = readTimezone(store);
  const today = getServerToday(new Date(), tz);

  const schedule = await getTodayScheduleForUser(session.userId, today);
  return { ok: true, data: schedule };
}

export async function saveSemesterWithTimetable(
  rawInput: SaveSemesterInput,
): Promise<CollegeActionResult<{ semesterId: string }>> {
  const session = await getSession();
  if (!session) {
    return { ok: false, code: "UNAUTHORIZED", error: "Please sign in." };
  }

  const parsed = saveSemesterSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      ok: false,
      code: "INVALID_INPUT",
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { semesterName, startDateKey, endDateKey, entries } = parsed.data;
  const startDate = parseDateKey(startDateKey);
  const endDate = parseDateKey(endDateKey);

  if (endDate < startDate) {
    return {
      ok: false,
      code: "INVALID_INPUT",
      error: "Semester end date cannot be earlier than start date.",
    };
  }

  // Deactivate any currently active semester for this user
  await prisma.semester.updateMany({
    where: { userId: session.userId, isActive: true },
    data: { isActive: false },
  });

  // Create new active semester
  const newSemester = await prisma.semester.create({
    data: {
      userId: session.userId,
      name: semesterName,
      startDate,
      endDate,
      isActive: true,
    },
  });

  // Collect unique subjects
  const subjectMap = new Map<string, string>(); // subjectName -> subjectId
  const uniqueSubjectNames = Array.from(
    new Set(entries.map((e) => e.subjectName.trim())),
  );

  for (const name of uniqueSubjectNames) {
    const subject = await prisma.subject.create({
      data: {
        userId: session.userId,
        semesterId: newSemester.id,
        name,
        type: entries.find((e) => e.subjectName.trim() === name)?.type === "LAB" ? "LAB" : "THEORY",
      },
    });
    subjectMap.set(name, subject.id);
  }

  // Create timetable entries
  if (entries.length > 0) {
    await prisma.timetableEntry.createMany({
      data: entries.map((entry) => ({
        userId: session.userId,
        semesterId: newSemester.id,
        subjectId: subjectMap.get(entry.subjectName.trim()) ?? null,
        dayOfWeek: entry.dayOfWeek,
        startTime: entry.startTime,
        endTime: entry.endTime,
        type: entry.type,
        room: entry.room || null,
        instructor: entry.instructor || null,
      })),
    });
  }

  revalidatePath("/");
  return { ok: true, data: { semesterId: newSemester.id } };
}
