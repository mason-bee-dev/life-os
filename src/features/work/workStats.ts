import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import {
  FULL_DAY_THRESHOLD,
  STANDARD_DAY_HOURS,
  type Period,
  type WorkCategory,
  type WorkDay,
  type WorkLoad,
  type WorkLog,
} from "./types";

dayjs.extend(isoWeek);

export type ResolvedLoad =
  | WorkLoad
  | "weekend"
  | "holiday"
  | "leave"
  | "unlogged";

export interface WorkAggregate {
  workDayCount: number;
  loadDistribution: Record<WorkLoad | "unlogged", number>;
  companyHours: number;
  personalHours: number;
  hoursByProject: {
    project: string;
    category: WorkCategory;
    hours: number;
  }[];
  coverage: { loggedDays: number; workDays: number };
  freeBudget: {
    available: number;
    invested: number;
    unused: number;
  } | null;
  daySeries: {
    date: string;
    companyHours: number;
    personalHours: number;
  }[];
  deltaVsPrev?: Partial<
    Record<"companyHours" | "personalHours" | "invested", number>
  >;
}

const WEEKDAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export function isWeekend(date: string): boolean {
  const day = dayjs(date).day();
  return day === 0 || day === 6;
}

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

export function shiftRefDate(
  refDate: string,
  period: Period,
  delta: number,
): string {
  const unit =
    period === "day" ? "day" : period === "week" ? "week" : period;
  return dayjs(refDate).add(delta, unit).format("YYYY-MM-DD");
}

export function eachDateKey(from: string, to: string): string[] {
  const keys: string[] = [];
  let d = dayjs(from);
  const end = dayjs(to);
  while (!d.isAfter(end, "day")) {
    keys.push(d.format("YYYY-MM-DD"));
    d = d.add(1, "day");
  }
  return keys;
}

export function axisLabel(dateKey: string, period: Period): string {
  const d = dayjs(dateKey);
  if (period === "week") return WEEKDAY_LABELS[d.day()];
  if (period === "year") return d.format("M");
  return d.format("D");
}

export function resolveDayLoad(
  day: WorkDay | undefined,
  logsOfDay: WorkLog[],
  date: string,
): ResolvedLoad {
  if (day && day.dayType !== "work") return day.dayType;

  const companyHours = logsOfDay
    .filter((l) => l.category === "company" && l.hours != null)
    .reduce((s, l) => s + (l.hours ?? 0), 0);

  if (companyHours > 0) {
    return companyHours >= FULL_DAY_THRESHOLD ? "full" : "half";
  }

  if (day?.load) return day.load;
  if (!day && isWeekend(date)) return "weekend";
  return "unlogged";
}

function logsByDate(logs: WorkLog[]): Map<string, WorkLog[]> {
  const map = new Map<string, WorkLog[]>();
  for (const log of logs) {
    const list = map.get(log.date) ?? [];
    list.push(log);
    map.set(log.date, list);
  }
  return map;
}

function daysByDate(days: WorkDay[]): Map<string, WorkDay> {
  return new Map(days.map((d) => [d.date, d]));
}

function roundHours(n: number): number {
  return Math.round(n * 10) / 10;
}

/** Aggregate once per period — UI reads only from this struct. */
export function aggregateWork(
  days: WorkDay[],
  logs: WorkLog[],
  period: Period,
  refDate: string,
  prev?: WorkAggregate,
): WorkAggregate {
  const { from, to } = periodBounds(refDate, period);
  const dateKeys = eachDateKey(from, to);
  const dayMap = daysByDate(days);
  const logMap = logsByDate(logs);

  const loadDistribution: Record<WorkLoad | "unlogged", number> = {
    full: 0,
    half: 0,
    empty: 0,
    unlogged: 0,
  };

  let workDayCount = 0;
  let loggedDays = 0;
  let companyHours = 0;
  let personalHours = 0;
  const projectMap = new Map<
    string,
    { project: string; category: WorkCategory; hours: number }
  >();

  const daySeries = dateKeys.map((date) => {
    const day = dayMap.get(date);
    const dayLogs = logMap.get(date) ?? [];
    const resolved = resolveDayLoad(day, dayLogs, date);

    const dayCompany = dayLogs
      .filter((l) => l.category === "company" && l.hours != null)
      .reduce((s, l) => s + (l.hours ?? 0), 0);
    const dayPersonal = dayLogs
      .filter((l) => l.category === "personal" && l.hours != null)
      .reduce((s, l) => s + (l.hours ?? 0), 0);

    companyHours += dayCompany;
    personalHours += dayPersonal;

    for (const log of dayLogs) {
      if (log.hours == null || log.hours <= 0) continue;
      const key = `${log.category}::${log.project}`;
      const existing = projectMap.get(key);
      if (existing) {
        existing.hours += log.hours;
      } else {
        projectMap.set(key, {
          project: log.project,
          category: log.category,
          hours: log.hours,
        });
      }
    }

    const isOff =
      resolved === "weekend" ||
      resolved === "holiday" ||
      resolved === "leave";

    if (!isOff) {
      workDayCount += 1;
      if (resolved === "full" || resolved === "half" || resolved === "empty") {
        loadDistribution[resolved] += 1;
      } else if (resolved === "unlogged") {
        loadDistribution.unlogged += 1;
      }
      if (dayCompany > 0 || dayPersonal > 0) {
        loggedDays += 1;
      }
    }

    return {
      date,
      companyHours: roundHours(dayCompany),
      personalHours: roundHours(dayPersonal),
    };
  });

  companyHours = roundHours(companyHours);
  personalHours = roundHours(personalHours);

  const hoursByProject = [...projectMap.values()]
    .map((p) => ({ ...p, hours: roundHours(p.hours) }))
    .sort((a, b) => b.hours - a.hours);

  const coverage = { loggedDays, workDays: workDayCount };

  let freeBudget: WorkAggregate["freeBudget"] = null;
  if (coverage.loggedDays > 0) {
    const available = roundHours(
      workDayCount * STANDARD_DAY_HOURS - companyHours,
    );
    const invested = personalHours;
    freeBudget = {
      available,
      invested,
      unused: roundHours(Math.max(0, available - invested)),
    };
  }

  const agg: WorkAggregate = {
    workDayCount,
    loadDistribution,
    companyHours,
    personalHours,
    hoursByProject,
    coverage,
    freeBudget,
    daySeries,
  };

  if (prev) {
    agg.deltaVsPrev = {
      companyHours: roundHours(companyHours - prev.companyHours),
      personalHours: roundHours(personalHours - prev.personalHours),
      invested: roundHours(
        (freeBudget?.invested ?? 0) - (prev.freeBudget?.invested ?? 0),
      ),
    };
  }

  return agg;
}

export function formatHours(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  const rounded = roundHours(n);
  return Number.isInteger(rounded) ? `${rounded}h` : `${rounded}h`;
}

export function formatHoursPlain(n: number): string {
  const rounded = roundHours(n);
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}
