import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import type { DailyRecord, DailyRecords, DrinkLog, Period } from "./types";
import { drinkDisplayName, formatVnd } from "./types";

dayjs.extend(isoWeek);

const WEEKDAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export function periodBounds(
  refDate: string,
  period: Period,
): { from: string; to: string } {
  const ref = dayjs(refDate);
  const unit =
    period === "day" ? "day" : period === "week" ? "isoWeek" : period;
  return {
    from: ref.startOf(unit).format("YYYY-MM-DD"),
    to: ref.endOf(unit).format("YYYY-MM-DD"),
  };
}

export function periodDayCount(refDate: string, period: Period): number {
  const { from, to } = periodBounds(refDate, period);
  return dayjs(to).diff(dayjs(from), "day") + 1;
}

export function periodMoneyLabel(period: Period): string {
  if (period === "day") return "Tổng tiền ngày";
  if (period === "week") return "Tổng tiền tuần";
  if (period === "month") return "Tổng tiền tháng";
  return "Tổng tiền năm";
}

export function recordsInPeriod(
  records: DailyRecords,
  period: Period,
  refDate: string,
): DailyRecord[] {
  const { from, to } = periodBounds(refDate, period);
  return Object.values(records).filter((r) => r.date >= from && r.date <= to);
}

export function drinksOf(r: DailyRecord): DrinkLog[] {
  return r.drinks ?? r.coffee ?? [];
}

export function sumWaterLiters(list: DailyRecord[]): number {
  return list.reduce((s, r) => s + (r.waterGlasses ?? 0) * 0.25, 0);
}

export function avgWaterLiters(list: DailyRecord[]): number {
  const withData = list.filter(
    (r) => r.waterGlasses != null && r.waterGlasses > 0,
  );
  return withData.length ? sumWaterLiters(withData) / withData.length : 0;
}

export function countWaterDays(list: DailyRecord[]): number {
  return list.filter((r) => (r.waterGlasses ?? 0) > 0).length;
}

export function sumCoffeeCups(list: DailyRecord[]): number {
  return list.reduce(
    (s, r) => s + drinksOf(r).reduce((cs, c) => cs + c.cups, 0),
    0,
  );
}

export function sumDrinkAmount(list: DailyRecord[]): number {
  return list.reduce(
    (s, r) => s + drinksOf(r).reduce((as, c) => as + (c.amount ?? 0), 0),
    0,
  );
}

export function countCoffeeDays(list: DailyRecord[]): number {
  return list.filter((r) => drinksOf(r).length > 0).length;
}

export function mostCommonCoffeeType(list: DailyRecord[]): string | null {
  const counts: Record<string, number> = {};
  for (const r of list) {
    for (const c of drinksOf(r)) {
      const label = drinkDisplayName(c);
      counts[label] = (counts[label] ?? 0) + c.cups;
    }
  }
  let best: string | null = null;
  let max = 0;
  for (const [k, v] of Object.entries(counts)) {
    if (v > max) {
      max = v;
      best = k;
    }
  }
  return best;
}

export function sumMasturbation(list: DailyRecord[]): number {
  return list.reduce((s, r) => s + (r.masturbationCount ?? 0), 0);
}

export function calcCleanStreak(
  records: DailyRecords,
  todayKey: string,
): number {
  let streak = 0;
  let d = dayjs(todayKey);
  while (true) {
    d = d.subtract(1, "day");
    const key = d.format("YYYY-MM-DD");
    const r = records[key];
    if (!r) break;
    if ((r.masturbationCount ?? 0) > 0) break;
    streak++;
  }
  return streak;
}

export type ChartDatum = {
  date: string;
  dateLabel: string;
  v: number;
  hasData: boolean;
  /** Tooltip lines, e.g. "1 cốc · Bạc xỉu · 35.200đ" */
  details?: string[];
};

function eachDateKey(from: string, to: string): string[] {
  const keys: string[] = [];
  let d = dayjs(from);
  const end = dayjs(to);
  while (!d.isAfter(end, "day")) {
    keys.push(d.format("YYYY-MM-DD"));
    d = d.add(1, "day");
  }
  return keys;
}

function axisLabel(dateKey: string, period: Period): string {
  const d = dayjs(dateKey);
  if (period === "week") return WEEKDAY_LABELS[d.day()];
  if (period === "month") return d.format("D");
  return d.format("DD/MM");
}

export function drinkDetailLines(drinks: DrinkLog[]): string[] {
  return drinks.map((d) => {
    const cups = `${d.cups} cốc · ${drinkDisplayName(d)}`;
    return d.amount > 0 ? `${cups} · ${formatVnd(d.amount)}` : cups;
  });
}

/** Daily series filling every day in range (gaps = 0). */
export function toFilledSeries(
  records: DailyRecords,
  period: Period,
  refDate: string,
  valueFn: (r: DailyRecord | undefined) => {
    value: number;
    hasData: boolean;
    details?: string[];
  },
): ChartDatum[] {
  if (period === "year") {
    return toMonthlySeries(records, refDate, valueFn);
  }

  const { from, to } = periodBounds(refDate, period);
  const byDate = new Map(
    Object.values(records).map((r) => [r.date, r] as const),
  );

  return eachDateKey(from, to).map((dateKey) => {
    const r = byDate.get(dateKey);
    const { value, hasData, details } = valueFn(r);
    return {
      date: axisLabel(dateKey, period),
      dateLabel: dayjs(dateKey).format("DD/MM/YYYY"),
      v: hasData ? value : 0,
      hasData,
      details,
    };
  });
}

function toMonthlySeries(
  records: DailyRecords,
  refDate: string,
  valueFn: (r: DailyRecord | undefined) => {
    value: number;
    hasData: boolean;
    details?: string[];
  },
): ChartDatum[] {
  const year = dayjs(refDate).year();
  const byDate = new Map(
    Object.values(records).map((r) => [r.date, r] as const),
  );

  return Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const start = dayjs(`${year}-${String(month).padStart(2, "0")}-01`);
    const end = start.endOf("month");
    let sum = 0;
    let hasData = false;
    const details: string[] = [];
    let d = start;
    while (!d.isAfter(end, "day")) {
      const key = d.format("YYYY-MM-DD");
      const result = valueFn(byDate.get(key));
      if (result.hasData) {
        sum += result.value;
        hasData = true;
        if (result.details?.length) details.push(...result.details);
      }
      d = d.add(1, "day");
    }
    return {
      date: `T${month}`,
      dateLabel: start.format("MM/YYYY"),
      v: hasData ? Math.round(sum * 100) / 100 : 0,
      hasData,
      details: details.length ? details.slice(0, 8) : undefined,
    };
  });
}
