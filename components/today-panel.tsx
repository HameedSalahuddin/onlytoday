"use client";

import type { TaskDTO } from "@/lib/tasks";
import type { TimetableEntryDTO } from "@/lib/college";
import { TaskList } from "@/components/task-list";
import { TodaySchedule } from "@/components/today-schedule";

interface TodayPanelProps {
  todayKey: string;
  weekday: string;
  fullDate: string;
  initialTasks: TaskDTO[];
  schedule: TimetableEntryDTO[];
  hasSemester: boolean;
  onOpenTimetable: () => void;
}

export function TodayPanel({
  todayKey,
  weekday,
  fullDate,
  initialTasks,
  schedule,
  hasSemester,
  onOpenTimetable,
}: TodayPanelProps) {
  return (
    <div className="flex h-full flex-col gap-8">
      <header>
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
          Today
        </span>
        <h1 className="mt-1.5 text-3xl font-semibold tracking-tight text-text">
          {weekday}
        </h1>
        <p className="mt-1 text-sm text-text2">{fullDate}</p>
      </header>

      {/* College Schedule Section */}
      <TodaySchedule
        schedule={schedule}
        hasSemester={hasSemester}
        onOpenSetup={onOpenTimetable}
      />

      {/* Today's Tasks Section */}
      <section className="flex-1 space-y-3 pt-2">
        <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
          Today&apos;s Tasks
        </h2>
        <TaskList initialTasks={initialTasks} todayKey={todayKey} />
      </section>
    </div>
  );
}