import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import type { DailyRecord, DailyRecords, Period } from "./types";

dayjs.extend(isoWeek);

export function recordsInPeriod(
  records: DailyRecords,
  period: Period,
  refDate: string,
): DailyRecord[] {
  const ref = dayjs(refDate);
  const start = ref.startOf(period === "day" ? "day" : period === "week" ? "isoWeek" : period);
  const end = ref.endOf(period === "day" ? "day" : period === "week" ? "isoWeek" : period);

  return Object.values(records).filter((r) => {
    const d = dayjs(r.date);
    return d.isValid() && !d.isBefore(start, "day") && !d.isAfter(end, "day");
  });
}

export function sumWaterLiters(list: DailyRecord[]): number {
  return list.reduce((s, r) => s + (r.waterGlasses ?? 0) * 0.25, 0);
}

export function avgWaterLiters(list: DailyRecord[]): number {
  const withData = list.filter((r) => r.waterGlasses != null && r.waterGlasses > 0);
  return withData.length ? sumWaterLiters(withData) / withData.length : 0;
}

export function sumCoffeeCups(list: DailyRecord[]): number {
  return list.reduce(
    (s, r) => s + (r.coffee ?? []).reduce((cs, c) => cs + c.cups, 0),
    0,
  );
}

export function mostCommonCoffeeType(list: DailyRecord[]): string | null {
  const counts: Record<string, number> = {};
  for (const r of list) {
    for (const c of r.coffee ?? []) {
      const label = c.type === "Khác" ? (c.customType || "Khác") : c.type;
      counts[label] = (counts[label] ?? 0) + c.cups;
    }
  }
  let best: string | null = null;
  let max = 0;
  for (const [k, v] of Object.entries(counts)) {
    if (v > max) { max = v; best = k; }
  }
  return best;
}

export function sumMasturbation(list: DailyRecord[]): number {
  return list.reduce((s, r) => s + (r.masturbationCount ?? 0), 0);
}

export function countPornDays(list: DailyRecord[]): number {
  return list.filter((r) => r.watchedPorn === true).length;
}

export function toDailySeries(
  list: DailyRecord[],
  valueFn: (r: DailyRecord) => number,
): { date: string; v: number }[] {
  return [...list]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((r) => ({ date: dayjs(r.date).format("DD/MM"), v: valueFn(r) }));
}
