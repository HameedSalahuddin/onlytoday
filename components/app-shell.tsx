"use client";

import { useMemo, useState } from "react";
import type { TaskDTO } from "@/lib/tasks";
import { getCurrentMonth } from "@/lib/dates";
import { cn } from "@/lib/cn";
import { Header } from "@/components/header";
import { TodayPanel } from "@/components/today-panel";
import { HistoryView } from "@/components/history-view";
import { Calendar } from "@/components/calendar";

interface AppShellProps {
  email: string;
  tz: string;
  todayKey: string;
  weekday: string;
  fullDate: string;
  initialTasks: TaskDTO[];
}

export function AppShell({
  email,
  tz,
  todayKey,
  weekday,
  fullDate,
  initialTasks,
}: AppShellProps) {
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const initialMonth = useMemo(() => getCurrentMonth(new Date(), tz), [tz]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header email={email} />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pb-20 pt-8 sm:px-10 lg:flex-row lg:gap-0 lg:pt-10">
        <main className="flex-1">
          <div className={cn(selectedDateKey && "hidden")}>
            <TodayPanel
              key={todayKey}
              todayKey={todayKey}
              weekday={weekday}
              fullDate={fullDate}
              initialTasks={initialTasks}
            />
          </div>
          {selectedDateKey && (
            <HistoryView
              key={selectedDateKey}
              dateKey={selectedDateKey}
              todayKey={todayKey}
              onBack={() => setSelectedDateKey(null)}
            />
          )}
        </main>

        <aside className="mt-12 w-full border-t border-border pt-8 lg:mt-0 lg:w-[340px] lg:shrink-0 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
          <Calendar
            todayKey={todayKey}
            initialMonth={initialMonth}
            onSelectPast={setSelectedDateKey}
            onSelectToday={() => setSelectedDateKey(null)}
          />
        </aside>
      </div>
    </div>
  );
}