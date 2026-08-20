"use client";

import { cn } from "@/lib/cn";

interface CalendarDayProps {
  day: number;
  dateKey: string;
  isToday: boolean;
  onClick: (dateKey: string) => void;
}

export function CalendarDay({ day, dateKey, isToday, onClick }: CalendarDayProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(dateKey)}
      aria-label={
        isToday
          ? `${dateKey} (today)`
          : `View tasks for ${dateKey}`
      }
      className="flex items-center justify-center rounded-lg p-0.5 transition-colors duration-150 hover:bg-bg2"
    >
      <span
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-colors duration-150",
          isToday
            ? "bg-accent font-semibold text-bg"
            : "text-text2 hover:text-text",
        )}
      >
        {day}
      </span>
    </button>
  );
}