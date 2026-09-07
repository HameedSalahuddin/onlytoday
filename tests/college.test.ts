import { describe, expect, it } from "vitest";
import {
  getWeekdayFromDate,
  getWeekdayFromDateKey,
  parseDateKey,
} from "@/lib/dates";

describe("getWeekdayFromDate / getWeekdayFromDateKey", () => {
  it("correctly identifies Monday for 2026-09-07", () => {
    expect(getWeekdayFromDateKey("2026-09-07")).toBe("MONDAY");
  });

  it("correctly identifies Tuesday for 2026-09-08", () => {
    expect(getWeekdayFromDateKey("2026-09-08")).toBe("TUESDAY");
  });

  it("correctly identifies Wednesday for 2026-09-09", () => {
    expect(getWeekdayFromDateKey("2026-09-09")).toBe("WEDNESDAY");
  });

  it("correctly identifies Thursday for 2026-09-10", () => {
    expect(getWeekdayFromDateKey("2026-09-10")).toBe("THURSDAY");
  });

  it("correctly identifies Friday for 2026-09-11", () => {
    expect(getWeekdayFromDateKey("2026-09-11")).toBe("FRIDAY");
  });

  it("correctly identifies Saturday for 2026-09-12", () => {
    expect(getWeekdayFromDateKey("2026-09-12")).toBe("SATURDAY");
  });

  it("correctly identifies Sunday for 2026-09-13", () => {
    expect(getWeekdayFromDateKey("2026-09-13")).toBe("SUNDAY");
  });

  it("handles UTC dates directly", () => {
    const d = new Date(Date.UTC(2026, 8, 7)); // September 7, 2026
    expect(getWeekdayFromDate(d)).toBe("MONDAY");
  });
});

describe("Timetable sorting and time comparisons", () => {
  it("sorts timetable entries chronologically by 24h start time", () => {
    const rawEntries = [
      { startTime: "14:00", subject: "Lab" },
      { startTime: "08:30", subject: "Math" },
      { startTime: "10:20", subject: "C Programming" },
      { startTime: "09:20", subject: "Chemistry" },
    ];

    const sorted = [...rawEntries].sort((a, b) =>
      a.startTime.localeCompare(b.startTime),
    );

    expect(sorted.map((e) => e.startTime)).toEqual([
      "08:30",
      "09:20",
      "10:20",
      "14:00",
    ]);
  });
});
