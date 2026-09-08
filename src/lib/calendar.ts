import dayjs from "dayjs";

/** Fixed reference "today" used by the demo data (Aug 31, 2026). */
export const DEMO_TODAY = dayjs("2026-08-31").toDate();

/** Quality-of-day color map used by the calendar + legend. */
export const qColor: Record<string, string> = {
  low: "var(--destructive)",
  avg: "var(--metric-productivity)",
  good: "var(--score-good)",
  exc: "var(--primary)",
};
