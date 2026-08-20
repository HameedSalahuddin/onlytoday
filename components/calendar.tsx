"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
import {
  DAY_ABBREVIATIONS,
  addMonths,
  daysBetween,
  formatMonthTitle,
  getMonthGrid,
} from "@/lib/dates";
import { CalendarDay } from "@/components/calendar-day";
import { LockedDay } from "@/components/locked-day";

interface CalendarProps {
  todayKey: string;
  initialMonth: { year: number; month: number };
  onSelectPast: (dateKey: string) => void;
  onSelectToday: () => void;
}

export function Calendar({
  todayKey,
  initialMonth,
  onSelectPast,
  onSelectToday,
}: CalendarProps) {
  const [view, setView] = useState(initialMonth);
  const [lockedKey, setLockedKey] = useState<string | null>(null);

  function handleDayClick(dateKey: string) {
    const diff = daysBetween(todayKey, dateKey);
    if (diff === 0) {
      onSelectToday();
      return;
    }
    if (diff < 0) {
      onSelectPast(dateKey);
      return;
    }
    setLockedKey(dateKey);
    window.setTimeout(() => {
      setLockedKey((current) => (current === dateKey ? null : current));
    }, 3000);
  }

  const cells = getMonthGrid(view.year, view.month);

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center justify-between">
        <h2 className="text-base font-semibold tracking-tight text-text">
          {formatMonthTitle(view.year, view.month)}
        </h2>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => setView((v) => addMonths(v.year, v.month, -1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors duration-150 hover:bg-bg2 hover:text-text2"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => setView((v) => addMonths(v.year, v.month, 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors duration-150 hover:bg-bg2 hover:text-text2"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-7 gap-1">
        {DAY_ABBREVIATIONS.map((day) => (
          <div
            key={day}
            className="py-1 text-center text-[11px] font-medium uppercase tracking-wide text-muted"
          >
            {day}
          </div>
        ))}
        {cells.map((cell, index) => {
          if (!cell) {
            return <div key={`blank-${index}`} aria-hidden="true" />;
          }
          if (cell.key === todayKey) {
            return (
              <CalendarDay
                key={cell.key}
                day={cell.day}
                dateKey={cell.key}
                isToday
                onClick={handleDayClick}
              />
            );
          }
          if (cell.key < todayKey) {
            return (
              <CalendarDay
                key={cell.key}
                day={cell.day}
                dateKey={cell.key}
                isToday={false}
                onClick={handleDayClick}
              />
            );
          }
          return <LockedDay key={cell.key} day={cell.day} dateKey={cell.key} onClick={handleDayClick} />;
        })}
      </div>

      <div aria-live="polite" className="min-h-[20px]">
        {lockedKey && (
          <p className="flex items-center gap-1.5 text-xs text-muted">
            <Lock className="h-3 w-3 shrink-0" aria-hidden="true" />
            This day isn&apos;t available yet. Come back tomorrow.
          </p>
        )}
      </div>

      <p className="flex items-center gap-1.5 text-xs text-muted">
        <Lock className="h-3 w-3 shrink-0" aria-hidden="true" />
        Future dates are locked.
      </p>
    </div>
  );
}