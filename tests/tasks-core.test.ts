import { describe, expect, it } from "vitest";
import {
  enforceTodayOnly,
  enforceViewableDate,
  validateTitle,
} from "@/lib/tasks-core";

const TODAY = "2026-08-20";

describe("enforceTodayOnly (task mutations)", () => {
  it("allows mutating today's tasks", () => {
    expect(enforceTodayOnly("2026-08-20", TODAY).ok).toBe(true);
  });

  it("rejects a future task even if the client crafts the request", () => {
    const res = enforceTodayOnly("2026-08-21", TODAY);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.code).toBe("FUTURE_DATE");
      expect(res.error).toContain("isn't available");
    }
  });

  it("rejects tasks from a previous day", () => {
    const res = enforceTodayOnly("2026-08-19", TODAY);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.code).toBe("NOT_TODAY");
  });
});

describe("enforceViewableDate (read access)", () => {
  it("allows viewing today and past dates", () => {
    expect(enforceViewableDate("2026-08-20", TODAY).ok).toBe(true);
    expect(enforceViewableDate("2026-08-01", TODAY).ok).toBe(true);
  });

  it("rejects future dates via crafted requests", () => {
    const res = enforceViewableDate("2026-09-01", TODAY);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.code).toBe("FUTURE_DATE");
  });
});

describe("validateTitle", () => {
  it("accepts and trims normal titles", () => {
    const res = validateTitle("  Study C — Functions  ");
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.data.title).toBe("Study C — Functions");
  });

  it("rejects empty titles", () => {
    expect(validateTitle("").ok).toBe(false);
    expect(validateTitle("   ").ok).toBe(false);
  });

  it("rejects oversized titles", () => {
    expect(validateTitle("x".repeat(501)).ok).toBe(false);
  });

  it("rejects non-string input", () => {
    expect(validateTitle(123).ok).toBe(false);
    expect(validateTitle(null).ok).toBe(false);
    expect(validateTitle(undefined).ok).toBe(false);
  });
});