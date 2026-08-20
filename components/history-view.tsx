"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { getTasksForDate } from "@/app/actions/tasks";
import type { TaskDTO } from "@/lib/tasks";
import { formatHistoryDate } from "@/lib/dates";
import { ProgressBar } from "@/components/progress-bar";
import { cn } from "@/lib/cn";

interface HistoryViewProps {
  dateKey: string;
  todayKey: string;
  onBack: () => void;
}

export function HistoryView({ dateKey, todayKey, onBack }: HistoryViewProps) {
  const [tasks, setTasks] = useState<TaskDTO[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setTasks(null);
    setError(null);
    void getTasksForDate(dateKey).then((result) => {
      if (result.ok) {
        setTasks(result.data);
      } else {
        setError(result.error);
      }
    });
  }

  useEffect(() => {
    let cancelled = false;
    void getTasksForDate(dateKey).then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setTasks(result.data);
      } else {
        setError(result.error);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [dateKey]);

  const completedCount = (tasks ?? []).filter((t) => t.completed).length;

  return (
    <div className="flex h-full flex-col gap-8">
      <header>
        <button
          type="button"
          onClick={onBack}
          className="mb-5 inline-flex items-center gap-1.5 rounded-lg px-1.5 py-1 text-sm text-muted transition-colors duration-150 hover:bg-bg2 hover:text-text2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to today
        </button>
        <div>
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
            History
          </span>
          <h1 className="mt-1.5 text-3xl font-semibold tracking-tight text-text">
            {formatHistoryDate(dateKey, todayKey)}
          </h1>
          <p className="mt-1 text-sm text-text2">Tasks for this day</p>
        </div>
      </header>

      {error && (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-border bg-card px-6 py-8">
          <p className="text-sm text-text2">{error}</p>
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-lg bg-text px-3 py-1.5 text-sm font-medium text-bg transition-colors hover:bg-text2"
          >
            Try again
          </button>
        </div>
      )}

      {!error && tasks === null && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted">Loading tasks…</p>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-11 animate-pulse rounded-xl bg-bg2"
              style={{ animationDelay: `${i * 80}ms` }}
            />
          ))}
        </div>
      )}

      {!error && tasks !== null && tasks.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border px-6 py-10">
          <p className="text-[15px] font-medium text-text2">No tasks that day.</p>
          <p className="mt-1 text-sm text-muted">A quiet day.</p>
        </div>
      )}

      {!error && tasks !== null && tasks.length > 0 && (
        <div className="flex flex-col gap-1">
          <ul className="flex flex-col gap-0.5">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="flex items-start gap-3 rounded-xl px-2.5 py-2"
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md",
                    task.completed
                      ? "border border-accent bg-accent/15 text-accent"
                      : "border border-border text-transparent",
                  )}
                >
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                <span
                  className={cn(
                    "flex-1 text-[15px] leading-relaxed",
                    task.completed
                      ? "text-muted line-through decoration-border"
                      : "text-text",
                  )}
                >
                  {task.title}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-border pt-4">
            <ProgressBar completed={completedCount} total={tasks.length} />
          </div>
        </div>
      )}

      {!error && (
        <p className="mt-auto text-xs text-muted">
          Read-only — previous days can&apos;t be changed.
        </p>
      )}
    </div>
  );
}