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

export function hasNightSleep(r: SleepRecord): boolean {
  return Boolean(r.bedtime && r.wakeTime);
}

export function hasNap(r: SleepRecord): boolean {
  return Boolean(r.napStart && r.napEnd);
}

/** Format minutes as "7h 15p" / "45 phút" / "7h". */
export function formatDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  if (h <= 0) return `${m} phút`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}p`;
}

export function formatMinutesOnly(mins: number): string {
  return `${Math.round(mins)} phút`;
}

/** Shift morning times (+24h) so evening bedtimes sort before after-midnight ones. */
function bedtimeSortMinutes(t: string): number {
  const m = timeToMinutes(t);
  return m < 12 * 60 ? m + 1440 : m;
}

function minutesToHhMm(total: number): string {
  const normalized = ((total % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function avgTimeOfDay(times: string[]): string | null {
  if (times.length === 0) return null;
  const shifted = times.map(bedtimeSortMinutes);
  const avg = shifted.reduce((a, b) => a + b, 0) / shifted.length;
  return minutesToHhMm(Math.round(avg));
}

/** Earliest / latest bedtime in evening sense (21:00 earlier than 00:30). */
export function bedtimeExtremes(
  times: string[],
): { earliest: string; latest: string } | null {
  if (!times.length) return null;
  let earliest = times[0];
  let latest = times[0];
  let earliestKey = bedtimeSortMinutes(earliest);
  let latestKey = earliestKey;
  for (let i = 1; i < times.length; i++) {
    const t = times[i];
    const key = bedtimeSortMinutes(t);
    if (key < earliestKey) {
      earliest = t;
      earliestKey = key;
    }
    if (key > latestKey) {
      latest = t;
      latestKey = key;
    }
  }
  return { earliest, latest };
}

export function periodBounds(
  refDate: string,
  period: Period,
): { from: string; to: string } {
  const ref = dayjs(refDate);
  const unit = period === "day" ? "day" : period === "week" ? "isoWeek" : "month";
  return {
    from: ref.startOf(unit).format("YYYY-MM-DD"),
    to: ref.endOf(unit).format("YYYY-MM-DD"),
  };
}

export function periodDayCount(refDate: string, period: Period): number {
  const { from, to } = periodBounds(refDate, period);
  return dayjs(to).diff(dayjs(from), "day") + 1;
}

export function recordsInPeriod(
  records: SleepRecord[],
  period: Period,
  refDate: string,
): SleepRecord[] {
  const { from, to } = periodBounds(refDate, period);
  return records.filter((r) => r.date >= from && r.date <= to);
}

export function nightRecordsInPeriod(
  records: SleepRecord[],
  period: Period,
  refDate: string,
): SleepRecord[] {
  return recordsInPeriod(records, period, refDate).filter(hasNightSleep);
}

export function napRecordsInPeriod(
  records: SleepRecord[],
  period: Period,
  refDate: string,
): SleepRecord[] {
  return recordsInPeriod(records, period, refDate).filter(hasNap);
}

export function avgNightWakings(records: SleepRecord[]): number | null {
  const withNight = records.filter(hasNightSleep);
  if (!withNight.length) return null;
  return (
    withNight.reduce((s, r) => s + r.nightWakingTimes.length, 0) /
    withNight.length
  );
}

export function typicalNightWakingTime(records: SleepRecord[]): string | null {
  const all = records.flatMap((r) => r.nightWakingTimes);
  return avgTimeOfDay(all);
}

export function napFrequencyPct(
  napCount: number,
  totalDays: number,
): number | null {
  if (totalDays <= 0) return null;
  return (napCount / totalDays) * 100;
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

export type NightStats = {
  avgDurationLabel: string;
  avgBedWakeLabel: string;
  avgWakingsLabel: string;
  typicalWakingLabel: string | null;
  bedtimeRangeLabel: string;
  loggedLabel: string;
};

export type NapStats = {
  avgDurationLabel: string;
  frequencyLabel: string;
  avgStartLabel: string;
  loggedLabel: string;
};

export function computeNightStats(
  records: SleepRecord[],
  totalDays: number,
): NightStats {
  const night = records.filter(hasNightSleep);
  const avgDur = avgNightSleepDuration(night);
  const bedtimes = night.map((r) => r.bedtime!).filter(Boolean);
  const wakeTimes = night.map((r) => r.wakeTime!).filter(Boolean);
  const avgBed = avgTimeOfDay(bedtimes);
  const avgWake = avgTimeOfDay(wakeTimes);
  const wakings = avgNightWakings(night);
  const typicalWaking = typicalNightWakingTime(night);
  const extremes = bedtimeExtremes(bedtimes);

  return {
    avgDurationLabel:
      avgDur != null ? formatDuration(Math.round(avgDur)) : "—",
    avgBedWakeLabel:
      avgBed && avgWake ? `${avgBed} → ${avgWake}` : "—",
    avgWakingsLabel:
      wakings != null ? `${wakings.toFixed(1)} lần` : "—",
    typicalWakingLabel: typicalWaking,
    bedtimeRangeLabel: extremes
      ? `${extremes.earliest} / ${extremes.latest}`
      : "—",
    loggedLabel: `${night.length} / ${totalDays} đêm`,
  };
}

export function computeNapStats(
  records: SleepRecord[],
  totalDays: number,
): NapStats {
  const naps = records.filter(hasNap);
  const avgDur = avgNapDuration(naps);
  const freq = napFrequencyPct(naps.length, totalDays);
  const starts = naps.map((r) => r.napStart!).filter(Boolean);
  const avgStart = avgTimeOfDay(starts);

  return {
    avgDurationLabel:
      avgDur != null ? formatMinutesOnly(avgDur) : "—",
    frequencyLabel: freq != null ? `${Math.round(freq)}%` : "—",
    avgStartLabel: avgStart ?? "—",
    loggedLabel: `${naps.length} lần`,
  };
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
