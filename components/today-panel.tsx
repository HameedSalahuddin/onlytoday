"use client";

import type { TaskDTO } from "@/lib/tasks";
import { TaskList } from "@/components/task-list";

interface TodayPanelProps {
  todayKey: string;
  weekday: string;
  fullDate: string;
  initialTasks: TaskDTO[];
}

export function TodayPanel({
  todayKey,
  weekday,
  fullDate,
  initialTasks,
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

      <section className="flex-1">
        <TaskList initialTasks={initialTasks} todayKey={todayKey} />
      </section>
    </div>
  );
}