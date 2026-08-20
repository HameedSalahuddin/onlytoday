"use client";

import { useEffect } from "react";
import { setTimezone } from "@/app/actions/auth";
import { TZ_COOKIE } from "@/lib/constants";

/**
 * Detects the browser's timezone and syncs it to a cookie used by the server
 * to compute "today". On first visit (no cookie yet) this triggers one reload
 * so the page renders with the correct timezone-aware server date.
 */
export function TimezoneSync() {
  useEffect(() => {
    let tz: string;
    try {
      tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return;
    }
    if (!tz) return;

    const cookieTz = document.cookie
      .split("; ")
      .find((c) => c.startsWith(`${TZ_COOKIE}=`))
      ?.split("=")[1];
    let cookieDecoded: string | undefined;
    if (cookieTz) {
      try {
        cookieDecoded = decodeURIComponent(cookieTz);
      } catch {
        cookieDecoded = cookieTz;
      }
    }

    if (cookieDecoded === tz) return;

    void setTimezone(tz).then((res) => {
      if (res.ok) {
        window.location.reload();
      }
    });
  }, []);

  return null;
}