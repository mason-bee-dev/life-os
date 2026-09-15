import type { WorkAggregate } from "./workStats";
import { formatHoursPlain } from "./workStats";

export type Observation = {
  id: string;
  text: string;
};

type Detector = (agg: WorkAggregate) => Observation | null;

const emptyTaskDetector: Detector = (agg) => {
  const n = agg.loadDistribution.empty;
  if (n <= 0) return null;
  return {
    id: "empty-task",
    text: `Kỳ này có ${n} ngày trống task.`,
  };
};

const dominantProjectDetector: Detector = (agg) => {
  const top = agg.hoursByProject[0];
  if (!top || top.hours <= 0) return null;
  const total = agg.companyHours + agg.personalHours;
  if (total <= 0) return null;
  if (top.hours / total < 0.4) return null;
  return {
    id: "dominant-project",
    text: `Phần lớn thời gian đổ vào ${top.project}.`,
  };
};

const coverageDetector: Detector = (agg) => {
  const { loggedDays, workDays } = agg.coverage;
  if (workDays <= 0) return null;
  if (loggedDays / workDays >= 0.4) return null;
  return {
    id: "low-coverage",
    text: `Số liệu dựa trên ${loggedDays}/${workDays} ngày có log chi tiết.`,
  };
};

const deltaPersonalDetector: Detector = (agg) => {
  const delta = agg.deltaVsPrev?.personalHours;
  if (delta == null || delta === 0) return null;
  const sign = delta > 0 ? "+" : "–";
  const abs = formatHoursPlain(Math.abs(delta));
  return {
    id: "delta-personal",
    text: `Giờ cá nhân ${sign}${abs}h so với kỳ trước.`,
  };
};

const DETECTORS: Detector[] = [
  emptyTaskDetector,
  dominantProjectDetector,
  coverageDetector,
  deltaPersonalDetector,
];

/** Objective observations only — max 2–3 lines, no verdict. */
export function buildWorkObservations(agg: WorkAggregate): Observation[] {
  const out: Observation[] = [];
  for (const detect of DETECTORS) {
    const obs = detect(agg);
    if (obs) out.push(obs);
    if (out.length >= 3) break;
  }
  return out;
}
