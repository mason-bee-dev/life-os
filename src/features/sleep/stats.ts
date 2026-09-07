import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import type { Period, SleepQuality, SleepRecord } from "./types";

dayjs.extend(isoWeek);

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

/** Minutes between start and end; handles crossing midnight. */
export function durationMinutes(start: string, end: string): number {
  const s = timeToMinutes(start);
  const e = timeToMinutes(end);
  return s > e ? 1440 - s + e : e - s;
}

export function nightSleepDuration(r: SleepRecord): number | null {
  if (!r.bedtime || !r.wakeTime) return null;
  return durationMinutes(r.bedtime, r.wakeTime);
}

export function napDuration(r: SleepRecord): number | null {
  if (!r.napStart || !r.napEnd) return null;
  return durationMinutes(r.napStart, r.napEnd);
}

/** Format minutes as "7h15p" / "45 phút" / "7h". */
export function formatDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  if (h <= 0) return `${m} phút`;
  if (m === 0) return `${h}h`;
  return `${h}h${String(m).padStart(2, "0")}p`;
}

export function avgTimeOfDay(times: string[]): string | null {
  if (times.length === 0) return null;
  const shifted = times.map((t) => {
    const m = timeToMinutes(t);
    return m < 12 * 60 ? m + 1440 : m;
  });
  const avg = shifted.reduce((a, b) => a + b, 0) / shifted.length;
  const normalized = Math.round(avg) % 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function periodBounds(refDate: string, period: Period): { from: string; to: string } {
  const ref = dayjs(refDate);
  const unit = period === "day" ? "day" : period === "week" ? "isoWeek" : period;
  return {
    from: ref.startOf(unit).format("YYYY-MM-DD"),
    to: ref.endOf(unit).format("YYYY-MM-DD"),
  };
}

export function previousPeriodBounds(refDate: string, period: Period): { from: string; to: string } {
  const ref = dayjs(refDate);
  const shifted =
    period === "day"
      ? ref.subtract(1, "day")
      : period === "week"
        ? ref.subtract(1, "week")
        : period === "month"
          ? ref.subtract(1, "month")
          : ref.subtract(1, "year");
  return periodBounds(shifted.format("YYYY-MM-DD"), period);
}

export function recordsInPeriod(
  records: SleepRecord[],
  period: Period,
  refDate: string,
): SleepRecord[] {
  const { from, to } = periodBounds(refDate, period);
  return records.filter((r) => r.date >= from && r.date <= to);
}

export function avgNightWakings(records: SleepRecord[]): number | null {
  const withNight = records.filter((r) => r.bedtime && r.wakeTime);
  if (!withNight.length) return null;
  return (
    withNight.reduce((s, r) => s + r.nightWakingTimes.length, 0) /
    withNight.length
  );
}

/** Typical night-waking clock time across the period (circular mean). */
export function typicalNightWakingTime(records: SleepRecord[]): string | null {
  const all = records.flatMap((r) => r.nightWakingTimes);
  return avgTimeOfDay(all);
}

/** Count of night wakings per hour-of-day (0–23). */
export function nightWakingHourDistribution(records: SleepRecord[]): number[] {
  const hours = Array.from({ length: 24 }, () => 0);
  for (const r of records) {
    for (const t of r.nightWakingTimes) {
      const h = Number(t.slice(0, 2));
      if (h >= 0 && h < 24) hours[h] += 1;
    }
  }
  return hours;
}

/** % of days in the list that have a nap logged. */
export function napFrequency(records: SleepRecord[]): number | null {
  if (!records.length) return null;
  const withNap = records.filter((r) => r.napStart && r.napEnd).length;
  return (withNap / records.length) * 100;
}

export function avgNightSleepDuration(records: SleepRecord[]): number | null {
  const durations = records
    .map(nightSleepDuration)
    .filter((n): n is number => n != null);
  if (!durations.length) return null;
  return durations.reduce((a, b) => a + b, 0) / durations.length;
}

export function avgNapDuration(records: SleepRecord[]): number | null {
  const durations = records
    .map(napDuration)
    .filter((n): n is number => n != null);
  if (!durations.length) return null;
  return durations.reduce((a, b) => a + b, 0) / durations.length;
}

export function qualityDistribution(
  records: SleepRecord[],
): Record<SleepQuality, number> {
  const out: Record<SleepQuality, number> = {
    kho_ngu: 0,
    binh_thuong: 0,
    ngu_ngon: 0,
  };
  for (const r of records) {
    if (r.quality) out[r.quality] += 1;
  }
  return out;
}

export type TrendPoint = {
  date: string;
  dateKey: string;
  durationHours: number | null;
  bedtimeMinutes: number | null;
  wakeMinutes: number | null;
};

export function toTrendSeries(records: SleepRecord[]): TrendPoint[] {
  return [...records]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((r) => {
      const night = nightSleepDuration(r);
      return {
        date: dayjs(r.date).format("DD/MM"),
        dateKey: r.date,
        durationHours: night != null ? Math.round((night / 60) * 10) / 10 : null,
        bedtimeMinutes: r.bedtime ? timeToMinutes(r.bedtime) : null,
        wakeMinutes: r.wakeTime ? timeToMinutes(r.wakeTime) : null,
      };
    });
}

export function deltaPct(current: number | null, previous: number | null): {
  dir: "up" | "down";
  value: string;
} | null {
  if (current == null || previous == null || previous === 0) return null;
  const pct = ((current - previous) / Math.abs(previous)) * 100;
  if (Math.abs(pct) < 0.5) return null;
  return {
    dir: pct >= 0 ? "up" : "down",
    value: `${Math.abs(pct).toFixed(1)}% so với kỳ trước`,
  };
}
