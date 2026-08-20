import { describe, expect, it } from "vitest";
import {
  addMonths,
  compareDateKeys,
  daysBetween,
  formatTodayHeading,
  getDateKeyInTz,
  getMonthGrid,
  getServerToday,
  isValidDateKey,
  parseDateKey,
  toDateKey,
} from "@/lib/dates";

describe("getDateKeyInTz", () => {
  it("returns YYYY-MM-DD for a known timezone", () => {
    const now = new Date("2026-08-20T00:00:00Z");
    expect(getDateKeyInTz(now, "UTC")).toBe("2026-08-20");
    expect(getDateKeyInTz(now, "Asia/Tokyo")).toBe("2026-08-20");
    expect(getDateKeyInTz(now, "America/New_York")).toBe("2026-08-19");
  });

  it("rolls the date at midnight in the user's timezone, not UTC", () => {
    const now = new Date("2026-08-20T23:30:00Z");
    expect(getDateKeyInTz(now, "UTC")).toBe("2026-08-20");
    expect(getDateKeyInTz(now, "America/New_York")).toBe("2026-08-20");
    expect(getDateKeyInTz(now, "Asia/Tokyo")).toBe("2026-08-21");
  });
});

describe("getServerToday", () => {
  it("normalizes to UTC midnight", () => {
    const today = getServerToday(new Date("2026-08-20T15:30:00Z"), "UTC");
    expect(today.toISOString()).toBe("2026-08-20T00:00:00.000Z");
  });

  it("respects the user's timezone for the calendar day", () => {
    const today = getServerToday(
      new Date("2026-08-20T23:30:00Z"),
      "Asia/Tokyo",
    );
    expect(toDateKey(today)).toBe("2026-08-21");
  });
});

describe("parseDateKey / toDateKey", () => {
  it("round-trips valid keys", () => {
    expect(toDateKey(parseDateKey("2026-08-20"))).toBe("2026-08-20");
  });

  it("rejects invalid keys", () => {
    expect(() => parseDateKey("2026-02-31")).toThrow();
    expect(() => parseDateKey("not-a-date")).toThrow();
    expect(() => parseDateKey("2026-13-01")).toThrow();
    expect(isValidDateKey("2026-02-30")).toBe(false);
    expect(isValidDateKey("2026-08-20")).toBe(true);
  });
});

describe("compareDateKeys", () => {
  it("orders dates correctly", () => {
    expect(compareDateKeys("2026-08-19", "2026-08-20")).toBe(-1);
    expect(compareDateKeys("2026-08-20", "2026-08-20")).toBe(0);
    expect(compareDateKeys("2026-08-21", "2026-08-20")).toBe(1);
  });
});

describe("daysBetween", () => {
  it("counts day differences", () => {
    expect(daysBetween("2026-08-20", "2026-08-20")).toBe(0);
    expect(daysBetween("2026-08-20", "2026-08-19")).toBe(-1);
    expect(daysBetween("2026-08-20", "2026-09-01")).toBe(12);
  });
});

describe("getMonthGrid", () => {
  it("builds a Monday-first grid with leading blanks", () => {
    // August 1, 2026 is a Saturday -> 5 leading blanks (Mon..Fri).
    const cells = getMonthGrid(2026, 7);
    expect(cells.length % 7).toBe(0);
    expect(cells.findIndex((c) => c !== null)).toBe(5);
    expect(cells.filter((c) => c !== null)).toHaveLength(31);
    expect(cells.find((c) => c?.key === "2026-08-20")?.day).toBe(20);
  });
});

describe("addMonths", () => {
  it("navigates across year boundaries", () => {
    expect(addMonths(2026, 7, 1)).toEqual({ year: 2026, month: 8 });
    expect(addMonths(2026, 0, -1)).toEqual({ year: 2025, month: 11 });
    expect(addMonths(2026, 11, 1)).toEqual({ year: 2027, month: 0 });
  });
});

describe("formatTodayHeading", () => {
  it("formats weekday and full date", () => {
    const heading = formatTodayHeading("2026-08-20");
    expect(heading.weekday).toBe("Thursday");
    expect(heading.fullDate).toBe("August 20, 2026");
  });
});