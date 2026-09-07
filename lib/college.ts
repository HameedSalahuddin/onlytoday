import { prisma } from "@/lib/prisma";
import {
  getWeekdayFromDate,
  parseDateKey,
  toDateKey,
  type Weekday,
} from "@/lib/dates";
import type {
  Semester,
  Subject,
  TimetableEntry,
} from "@/generated/prisma/client";

export type TimetableType = "CLASS" | "LAB" | "LECTURE" | "OTHER";

export interface SubjectDTO {
  id: string;
  name: string;
  shortName: string | null;
  code: string | null;
  type: string;
  color: string | null;
}

export interface TimetableEntryDTO {
  id: string;
  dayOfWeek: Weekday;
  startTime: string;
  endTime: string;
  type: string;
  room: string | null;
  instructor: string | null;
  title: string | null;
  subject: SubjectDTO | null;
}

export interface SemesterDTO {
  id: string;
  name: string;
  startDateKey: string;
  endDateKey: string;
  isActive: boolean;
  subjects: SubjectDTO[];
  timetable: TimetableEntryDTO[];
}

export function toSubjectDTO(s: Subject): SubjectDTO {
  return {
    id: s.id,
    name: s.name,
    shortName: s.shortName,
    code: s.code,
    type: s.type,
    color: s.color,
  };
}

export function toTimetableEntryDTO(
  entry: TimetableEntry & { subject?: Subject | null },
): TimetableEntryDTO {
  return {
    id: entry.id,
    dayOfWeek: entry.dayOfWeek as Weekday,
    startTime: entry.startTime,
    endTime: entry.endTime,
    type: entry.type,
    room: entry.room,
    instructor: entry.instructor,
    title: entry.title,
    subject: entry.subject ? toSubjectDTO(entry.subject) : null,
  };
}

export async function getActiveSemesterForUser(
  userId: string,
): Promise<SemesterDTO | null> {
  const semester = await prisma.semester.findFirst({
    where: { userId, isActive: true },
    include: {
      subjects: { orderBy: { name: "asc" } },
      timetableEntries: {
        include: { subject: true },
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!semester) return null;

  return {
    id: semester.id,
    name: semester.name,
    startDateKey: toDateKey(semester.startDate),
    endDateKey: toDateKey(semester.endDate),
    isActive: semester.isActive,
    subjects: semester.subjects.map(toSubjectDTO),
    timetable: semester.timetableEntries.map(toTimetableEntryDTO),
  };
}

export async function getTodayScheduleForUser(
  userId: string,
  today: Date,
): Promise<TimetableEntryDTO[]> {
  const semester = await prisma.semester.findFirst({
    where: { userId, isActive: true },
  });

  if (!semester) return [];

  const dayOfWeek = getWeekdayFromDate(today);

  const entries = await prisma.timetableEntry.findMany({
    where: {
      userId,
      semesterId: semester.id,
      dayOfWeek,
    },
    include: {
      subject: true,
    },
    orderBy: {
      startTime: "asc",
    },
  });

  return entries.map(toTimetableEntryDTO);
}

export async function getScheduledDaysForUser(
  userId: string,
): Promise<string[]> {
  const semester = await prisma.semester.findFirst({
    where: { userId, isActive: true },
    select: { id: true },
  });

  if (!semester) return [];

  const entries = await prisma.timetableEntry.findMany({
    where: { userId, semesterId: semester.id },
    select: { dayOfWeek: true },
    distinct: ["dayOfWeek"],
  });

  return entries.map((e) => e.dayOfWeek);
}
