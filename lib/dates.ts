const MS_PER_DAY = 86_400_000;

export const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const DAY_ABBREVIATIONS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidTimezone(tz: string): boolean {
  try {
    Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export function getDefaultTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

/**
 * Returns the calendar date (YYYY-MM-DD) for `now` in the given timezone.
 * Used to determine what the server considers "today" for a user.
 */
export function getDateKeyInTz(now: Date, tz: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

export function toDateKey(date: Date): string {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(
    date.getUTCDate(),
  )}`;
}

/**
 * Parses a YYYY-MM-DD key into a Date at UTC midnight. Throws for invalid keys.
 */
export function parseDateKey(key: string): Date {
  if (!DATE_KEY_RE.test(key)) {
    throw new Error(`Invalid date key: ${key}`);
  }
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (toDateKey(date) !== key) {
    throw new Error(`Invalid date key: ${key}`);
  }
  return date;
}

export function isValidDateKey(key: string): boolean {
  try {
    parseDateKey(key);
    return true;
  } catch {
    return false;
  }
}

/**
 * The server's notion of "today" (a UTC-midnight Date for that calendar date),
 * computed from the server clock in the user's timezone. This is the source of
 * truth for the Today-Only rule.
 */
export function getServerToday(now: Date, tz: string): Date {
  return parseDateKey(getDateKeyInTz(now, tz));
}

/** Compares two calendar-date keys lexicographically (YYYY-MM-DD sorts correctly). */
export function compareDateKeys(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

export function daysBetween(fromKey: string, toKey: string): number {
  return Math.round(
    (parseDateKey(toKey).getTime() - parseDateKey(fromKey).getTime()) /
      MS_PER_DAY,
  );
}

export function getCurrentMonth(now: Date, tz: string): { year: number; month: number } {
  const key = getDateKeyInTz(now, tz);
  const [year, month] = key.split("-").map(Number);
  return { year, month: month - 1 };
}

export function addMonths(
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } {
  const d = new Date(Date.UTC(year, month + delta, 1));
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() };
}

export function formatMonthTitle(year: number, month: number): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month, 1)));
}

export interface CalendarCell {
  key: string;
  day: number;
}

/**
 * Builds the 6-week grid for a month (Monday-first). Null cells are leading
 * blanks so the grid always aligns with weekday columns.
 */
export function getMonthGrid(year: number, month: number): Array<CalendarCell | null> {
  const first = new Date(Date.UTC(year, month, 1));
  const leadingBlanks = (first.getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells: Array<CalendarCell | null> = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const key = toDateKey(new Date(Date.UTC(year, month, d)));
    cells.push({ key, day: d });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function formatTodayHeading(todayKey: string): {
  weekday: string;
  fullDate: string;
} {
  const date = parseDateKey(todayKey);
  const weekday = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: "UTC",
  }).format(date);
  const fullDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
  return { weekday, fullDate };
}

/** Short label for a historical date, e.g. "Yesterday" or "Monday, August 19". */
export function formatHistoryDate(dateKey: string, todayKey: string): string {
  const diff = daysBetween(dateKey, todayKey);
  if (diff === 1) return "Yesterday";
  const date = parseDateKey(dateKey);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export const WEEKDAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

export type Weekday = (typeof WEEKDAYS)[number];

const DAY_INDEX_TO_WEEKDAY: Record<number, Weekday> = {
  0: "SUNDAY",
  1: "MONDAY",
  2: "TUESDAY",
  3: "WEDNESDAY",
  4: "THURSDAY",
  5: "FRIDAY",
  6: "SATURDAY",
};

export function getWeekdayFromDate(date: Date): Weekday {
  return DAY_INDEX_TO_WEEKDAY[date.getUTCDay()];
}

export function getWeekdayFromDateKey(dateKey: string): Weekday {
  return getWeekdayFromDate(parseDateKey(dateKey));
}