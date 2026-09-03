import dayjs from "dayjs";

/** "Aug 31, 2026" */
export function formatDate(d: dayjs.ConfigType): string {
  return dayjs(d).format("DD/MM/YYYY");
}

/** Shift a date by n days and return a new Date. */
export function shiftDate(d: Date, n: number): Date {
  return dayjs(d).add(n, "day").toDate();
}

/** Fixed reference "today" used by the demo data (Aug 31, 2026). */
export const DEMO_TODAY = dayjs("2026-08-31").toDate();

/** Quality-of-day color map used by the calendar + legend. */
export const qColor: Record<string, string> = {
  low: "#ef4444",
  avg: "#f59e0b",
  good: "#eab308",
  exc: "#10b981",
};
