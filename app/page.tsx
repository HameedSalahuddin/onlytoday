import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession, readTimezone } from "@/lib/auth";
import { formatTodayHeading, getServerToday, toDateKey } from "@/lib/dates";
import { getTasksForUser } from "@/lib/tasks";
import { AppShell } from "@/components/app-shell";
import { ToastProvider } from "@/components/toast";
import { TimezoneSync } from "@/components/timezone-sync";
import { DayRollover } from "@/components/day-rollover";

export default async function Home() {
  const session = await getSession();
  if (!session) redirect("/login");

  const store = await cookies();
  const tz = readTimezone(store);
  const today = getServerToday(new Date(), tz);
  const todayKey = toDateKey(today);
  const heading = formatTodayHeading(todayKey);
  const tasks = await getTasksForUser(session.userId, today);

  return (
    <ToastProvider>
      <TimezoneSync />
      <DayRollover todayKey={todayKey} />
      <AppShell
        email={session.email}
        tz={tz}
        todayKey={todayKey}
        weekday={heading.weekday}
        fullDate={heading.fullDate}
        initialTasks={tasks}
      />
    </ToastProvider>
  );
}