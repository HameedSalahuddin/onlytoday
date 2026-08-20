"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * Automatically rolls the workspace over to the new day. A timer fires just
 * after local midnight (and on refocus/visibility change) and refreshes the
 * server-rendered page, so the new day's tasks are loaded without a manual
 * reload. "Today" is still determined server-side; this only triggers a refresh.
 */
export function DayRollover({ todayKey }: { todayKey: string }) {
  const router = useRouter();
  const todayKeyRef = useRef(todayKey);

  useEffect(() => {
    todayKeyRef.current = todayKey;
  }, [todayKey]);

  useEffect(() => {
    let timer: number | undefined;

    function check() {
      let localKey: string;
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
        localKey = new Intl.DateTimeFormat("en-CA", {
          timeZone: tz,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(new Date());
      } catch {
        return;
      }
      if (localKey !== todayKeyRef.current) {
        router.refresh();
      } else {
        schedule();
      }
    }

    function schedule() {
      const now = new Date();
      const nextMidnight = new Date(now);
      nextMidnight.setHours(24, 0, 1, 0);
      timer = window.setTimeout(check, nextMidnight.getTime() - now.getTime());
    }

    schedule();

    const onVisible = () => {
      if (document.visibilityState === "visible") check();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);

    return () => {
      if (timer) window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [router]);

  return null;
}