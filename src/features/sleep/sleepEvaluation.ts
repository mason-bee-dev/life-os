import type { Period, SleepRecord } from "./types";
import {
  avgNapDuration,
  avgNightSleepDuration,
  avgNightWakings,
  avgTimeOfDay,
  bedtimeExtremes,
  bedtimeSpreadMinutes,
  formatDuration,
  formatMinutesOnly,
  hasNap,
  hasNightSleep,
  qualityDistribution,
} from "./sleepStats";

export type CriterionLevel = "good" | "ok" | "attention" | "unknown";

export type EvaluationCriterion = {
  key: string;
  label: string;
  level: CriterionLevel;
  detail: string;
  /** 0–1 contribution when known; ignored when unknown */
  score01: number | null;
};

export type SleepEvaluation = {
  verdict: "good" | "ok" | "attention";
  verdictLabel: string;
  /** 0–100 weighted score; null if no scorable criteria */
  score: number | null;
  periodLabel: string;
  criteria: EvaluationCriterion[];
  tips: string[];
  disclaimer: string | null;
  /** True when everything looks fine — UI can collapse */
  allGood: boolean;
};

const NIGHT_TARGET_MINS = 7 * 60;
const NAP_IDEAL_MIN = 15;
const NAP_IDEAL_MAX = 30;
const NAP_LONG_MINS = 60;
/** Nap starting at/after 16:00 is late. */
const NAP_LATE_START_MINS = 16 * 60;

/** Apple-inspired weights (sum 100). */
const NIGHT_WEIGHTS: Record<string, number> = {
  duration: 40,
  consistency: 25,
  wakings: 20,
  quality: 15,
};

const NAP_WEIGHTS: Record<string, number> = {
  duration: 60,
  timing: 40,
};

function periodLabel(period: Period): string {
  if (period === "day") return "hôm nay";
  if (period === "week") return "tuần này";
  return "tháng này";
}

function verdictFromScore(score: number): "good" | "ok" | "attention" {
  if (score >= 80) return "good";
  if (score >= 50) return "ok";
  return "attention";
}

function verdictLabel(verdict: "good" | "ok" | "attention"): string {
  if (verdict === "good") return "Tốt";
  if (verdict === "ok") return "Ổn";
  return "Cần chú ý";
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function levelFromScore01(s: number): "good" | "ok" | "attention" {
  if (s >= 0.8) return "good";
  if (s >= 0.5) return "ok";
  return "attention";
}

function computeWeightedScore(
  criteria: EvaluationCriterion[],
  weights: Record<string, number>,
): number | null {
  let totalW = 0;
  let earned = 0;
  for (const c of criteria) {
    if (c.score01 == null) continue;
    const w = weights[c.key] ?? 0;
    if (w <= 0) continue;
    totalW += w;
    earned += w * c.score01;
  }
  if (totalW <= 0) return null;
  return Math.round((earned / totalW) * 100);
}

function formatSpread(mins: number): string {
  if (mins < 60) return `${Math.round(mins)} phút`;
  return formatDuration(Math.round(mins));
}

function evaluateDuration(
  avgMins: number | null,
  period: Period,
): EvaluationCriterion {
  if (avgMins == null) {
    return {
      key: "duration",
      label: "Đủ giờ",
      level: "unknown",
      detail: "Chưa đủ dữ liệu thời lượng",
      score01: null,
    };
  }

  const label = formatDuration(Math.round(avgMins));
  const delta = Math.round(avgMins - NIGHT_TARGET_MINS);
  const absDelta = Math.abs(delta);
  const deltaLabel =
    absDelta < 5
      ? "đúng mục tiêu 7h"
      : delta > 0
        ? `thừa ${formatDuration(absDelta)} so với mục tiêu 7h`
        : `thiếu ${formatDuration(absDelta)} so với mục tiêu 7h`;

  let score01: number;
  if (avgMins >= 7 * 60 && avgMins <= 9 * 60) {
    score01 = 1;
  } else if (avgMins >= 6 * 60 && avgMins < 7 * 60) {
    // 6h → 0.55, approaching 7h → 1
    score01 = 0.55 + 0.45 * ((avgMins - 6 * 60) / 60);
  } else if (avgMins > 9 * 60 && avgMins <= 10 * 60) {
    score01 = 1 - 0.4 * ((avgMins - 9 * 60) / 60);
  } else if (avgMins < 6 * 60) {
    score01 = Math.max(0, (avgMins / (6 * 60)) * 0.45);
  } else {
    score01 = Math.max(0.2, 0.6 - (avgMins - 10 * 60) / (4 * 60));
  }

  const scope = period === "day" ? "Ngủ" : "Ngủ TB";
  return {
    key: "duration",
    label: "Đủ giờ",
    level: levelFromScore01(score01),
    detail: `${scope} ${label} — ${deltaLabel}`,
    score01,
  };
}

function evaluateConsistency(
  records: SleepRecord[],
  period: Period,
): EvaluationCriterion {
  if (period === "day") {
    return {
      key: "consistency",
      label: "Ổn định lịch",
      level: "unknown",
      detail: "Cần nhiều đêm để đánh giá độ ổn định",
      score01: null,
    };
  }

  const bedtimes = records
    .map((r) => r.bedtime)
    .filter((t): t is string => Boolean(t));
  const spread = bedtimeSpreadMinutes(bedtimes);
  const extremes = bedtimeExtremes(bedtimes);

  if (spread == null || !extremes || bedtimes.length < 2) {
    return {
      key: "consistency",
      label: "Ổn định lịch",
      level: "unknown",
      detail: "Cần ≥2 đêm để đánh giá độ ổn định",
      score01: null,
    };
  }

  // good: <45p | ok: 45–90p | attention: >90p
  let score01: number;
  if (spread < 45) {
    score01 = 1 - (spread / 45) * 0.15; // 0 → 1.0, 45 → 0.85
  } else if (spread <= 90) {
    score01 = 0.85 - ((spread - 45) / 45) * 0.35; // 45 → 0.85, 90 → 0.5
  } else {
    score01 = Math.max(0, 0.45 - (spread - 90) / 180);
  }

  return {
    key: "consistency",
    label: "Ổn định lịch",
    level: levelFromScore01(score01),
    detail: `Giờ ngủ dao động ${formatSpread(spread)} (${extremes.earliest} → ${extremes.latest})`,
    score01,
  };
}

function evaluateWakings(
  records: SleepRecord[],
  period: Period,
): EvaluationCriterion {
  const wakings = avgNightWakings(records);
  if (wakings == null) {
    return {
      key: "wakings",
      label: "Dậy đêm",
      level: "unknown",
      detail: "Chưa đủ dữ liệu dậy đêm",
      score01: null,
    };
  }

  const typical = avgTimeOfDay(records.flatMap((r) => r.nightWakingTimes));
  let score01: number;
  if (wakings <= 0.5) score01 = 1;
  else if (wakings <= 1.5) score01 = 1 - (wakings - 0.5); // 0.5→1, 1.5→0
  else score01 = Math.max(0, 0.45 - (wakings - 1.5) / 4);

  const countLabel =
    period === "day"
      ? wakings === 0
        ? "Không dậy đêm"
        : `Dậy ${Math.round(wakings)} lần`
      : wakings === 0
        ? "Không dậy đêm"
        : `TB ${wakings.toFixed(1)} lần/đêm`;

  const detail = typical ? `${countLabel}, thường lúc ${typical}` : countLabel;

  return {
    key: "wakings",
    label: "Dậy đêm",
    level: levelFromScore01(score01),
    detail,
    score01,
  };
}

function evaluateQuality(
  records: SleepRecord[],
  period: Period,
): EvaluationCriterion {
  const withQuality = records.filter((r) => r.quality);
  if (!withQuality.length) {
    return {
      key: "quality",
      label: "Cảm nhận",
      level: "unknown",
      detail: "Chưa ghi chất lượng giấc ngủ",
      score01: null,
    };
  }

  const dist = qualityDistribution(withQuality);
  const total = withQuality.length;
  // Score: ngủ ngon=1, bình thường=0.55, khó ngủ=0
  const points =
    dist.ngu_ngon * 1 + dist.binh_thuong * 0.55 + dist.kho_ngu * 0;
  const score01 = points / total;

  const parts: string[] = [];
  if (dist.ngu_ngon) parts.push(`${dist.ngu_ngon} ngủ ngon`);
  if (dist.binh_thuong) parts.push(`${dist.binh_thuong} bình thường`);
  if (dist.kho_ngu) parts.push(`${dist.kho_ngu} khó ngủ`);

  const suffix =
    period === "day" ? parts.join(", ") : `${parts.join(", ")} (${total} đêm có ghi)`;

  return {
    key: "quality",
    label: "Cảm nhận",
    level: levelFromScore01(score01),
    detail: suffix,
    score01,
  };
}

function nightTips(
  criteria: EvaluationCriterion[],
  records: SleepRecord[],
): string[] {
  const byKey = Object.fromEntries(criteria.map((c) => [c.key, c]));
  const tips: string[] = [];

  if (byKey.wakings?.level === "attention") {
    tips.push(
      "Thử hạn chế caffeine sau 14h và giữ phòng tối, mát — giảm dậy giữa đêm.",
    );
  }
  if (byKey.consistency?.level === "attention") {
    tips.push("Cố định giờ đi ngủ trong khung ±30 phút mỗi đêm.");
  }
  if (byKey.duration?.level === "attention") {
    const avg = avgNightSleepDuration(records.filter(hasNightSleep));
    if (avg != null && avg < NIGHT_TARGET_MINS) {
      tips.push(
        "Cố gắng đi ngủ sớm hơn 20–30 phút để tiến gần mục tiêu 7 giờ.",
      );
    } else {
      tips.push(
        "Ngủ quá dài có thể làm uể oải — thử dậy cố định hơn vào buổi sáng.",
      );
    }
  }
  if (byKey.quality?.level === "attention") {
    tips.push(
      "Nhiều đêm khó ngủ — thử thói quen thư giãn 30 phút trước khi ngủ (không màn hình).",
    );
  }

  if (tips.length === 0) {
    if (criteria.every((c) => c.level === "good" || c.level === "unknown")) {
      tips.push("Giấc ngủ đang ổn — duy trì lịch ngủ đều đặn.");
    } else {
      tips.push("Theo dõi thêm vài ngày để thấy xu hướng rõ hơn.");
    }
  }

  return tips.slice(0, 2);
}

export function evaluateNightSleep(
  records: SleepRecord[],
  totalDays: number,
  period: Period,
): SleepEvaluation | null {
  const night = records.filter(hasNightSleep);
  if (!night.length) return null;

  const avgDur = avgNightSleepDuration(night);
  const criteria = [
    evaluateDuration(avgDur, period),
    evaluateConsistency(night, period),
    evaluateWakings(night, period),
    evaluateQuality(night, period),
  ];

  const score = computeWeightedScore(criteria, NIGHT_WEIGHTS);
  const knownLevels = criteria
    .filter((c) => c.level !== "unknown")
    .map((c) => c.level);
  const verdict =
    score != null
      ? verdictFromScore(score)
      : knownLevels.includes("attention")
        ? "attention"
        : knownLevels.every((l) => l === "good")
          ? "good"
          : "ok";

  const coverage = night.length / Math.max(totalDays, 1);
  const disclaimer =
    period !== "day" && coverage < 0.5
      ? `Chỉ có ${night.length}/${totalDays} đêm được ghi — kết quả mang tính tham khảo.`
      : null;

  const allGood =
    verdict === "good" &&
    !disclaimer &&
    knownLevels.every((l) => l === "good");

  return {
    verdict,
    verdictLabel: verdictLabel(verdict),
    score,
    periodLabel: periodLabel(period),
    criteria,
    tips: nightTips(criteria, night),
    disclaimer,
    allGood,
  };
}

function evaluateNapDuration(
  avgMins: number | null,
  period: Period,
): EvaluationCriterion {
  if (avgMins == null) {
    return {
      key: "duration",
      label: "Thời lượng",
      level: "unknown",
      detail: "Chưa đủ dữ liệu thời lượng",
      score01: null,
    };
  }

  const label = formatMinutesOnly(Math.round(avgMins));
  let score01: number;
  let detail: string;

  if (avgMins >= NAP_IDEAL_MIN && avgMins <= NAP_IDEAL_MAX) {
    score01 = 1;
    detail =
      period === "day"
        ? `${label} — trong khung power nap lý tưởng (15–30 phút)`
        : `TB ${label} — trong khung power nap lý tưởng (15–30 phút)`;
  } else if (avgMins < NAP_IDEAL_MIN) {
    score01 = Math.max(0.4, avgMins / NAP_IDEAL_MIN);
    detail =
      period === "day"
        ? `${label} — hơi ngắn, có thể chưa kịp hồi phục`
        : `TB ${label} — hơi ngắn, có thể chưa kịp hồi phục`;
  } else if (avgMins <= NAP_LONG_MINS) {
    // 30–60: taper from 0.85 → 0.5
    score01 = 0.85 - ((avgMins - NAP_IDEAL_MAX) / (NAP_LONG_MINS - NAP_IDEAL_MAX)) * 0.35;
    detail =
      period === "day"
        ? `${label} — hơi dài so với power nap`
        : `TB ${label} — hơi dài so với power nap`;
  } else {
    score01 = Math.max(0, 0.45 - (avgMins - NAP_LONG_MINS) / 120);
    detail =
      period === "day"
        ? `${label} — dễ say giấc và ảnh hưởng giấc đêm`
        : `TB ${label} — dễ say giấc và ảnh hưởng giấc đêm`;
  }

  return {
    key: "duration",
    label: "Thời lượng",
    level: levelFromScore01(score01),
    detail,
    score01,
  };
}

function evaluateNapTiming(
  records: SleepRecord[],
  period: Period,
): EvaluationCriterion {
  const starts = records
    .map((r) => r.napStart)
    .filter((t): t is string => Boolean(t));
  const avgStart = avgTimeOfDay(starts);

  if (!avgStart) {
    return {
      key: "timing",
      label: "Thời điểm",
      level: "unknown",
      detail: "Chưa đủ dữ liệu giờ bắt đầu",
      score01: null,
    };
  }

  const mins = timeToMinutes(avgStart);
  let score01: number;
  let detail: string;
  const prefix = period === "day" ? "Bắt đầu lúc" : "Bắt đầu TB lúc";

  if (mins < NAP_LATE_START_MINS) {
    score01 = 1;
    detail = `${prefix} ${avgStart} — trước 16h, ít ảnh hưởng giấc đêm`;
  } else if (mins < 17 * 60) {
    score01 = 0.6;
    detail = `${prefix} ${avgStart} — hơi muộn trong ngày`;
  } else {
    score01 = Math.max(0, 0.4 - (mins - 17 * 60) / (3 * 60));
    detail = `${prefix} ${avgStart} — muộn, dễ làm trễ giờ ngủ đêm`;
  }

  return {
    key: "timing",
    label: "Thời điểm",
    level: levelFromScore01(score01),
    detail,
    score01,
  };
}

function napTips(criteria: EvaluationCriterion[]): string[] {
  const byKey = Object.fromEntries(criteria.map((c) => [c.key, c]));
  const tips: string[] = [];

  if (byKey.timing?.level === "attention") {
    tips.push("Thử ngủ trưa trước 15h để tránh ảnh hưởng giấc ngủ đêm.");
  }
  if (byKey.duration?.level === "attention") {
    tips.push("Giới hạn ngủ trưa khoảng 20–30 phút — đặt báo thức nếu cần.");
  }

  if (tips.length === 0) {
    if (criteria.every((c) => c.level === "good" || c.level === "unknown")) {
      tips.push("Ngủ trưa đang hợp lý — giữ khung 15–30 phút trước 16h.");
    } else {
      tips.push("Theo dõi thêm để điều chỉnh thời lượng và giờ bắt đầu.");
    }
  }

  return tips.slice(0, 2);
}

export function evaluateNapSleep(
  records: SleepRecord[],
  totalDays: number,
  period: Period,
): SleepEvaluation | null {
  const naps = records.filter(hasNap);
  if (!naps.length) return null;

  const avgDur = avgNapDuration(naps);
  const criteria = [
    evaluateNapDuration(avgDur, period),
    evaluateNapTiming(naps, period),
  ];

  const score = computeWeightedScore(criteria, NAP_WEIGHTS);
  const knownLevels = criteria
    .filter((c) => c.level !== "unknown")
    .map((c) => c.level);
  const verdict =
    score != null
      ? verdictFromScore(score)
      : knownLevels.includes("attention")
        ? "attention"
        : knownLevels.every((l) => l === "good")
          ? "good"
          : "ok";

  const coverage = naps.length / Math.max(totalDays, 1);
  const disclaimer =
    period !== "day" && coverage < 0.35 && naps.length < 3
      ? `Chỉ có ${naps.length} lần ngủ trưa trong kỳ — kết quả mang tính tham khảo.`
      : null;

  const allGood =
    verdict === "good" &&
    !disclaimer &&
    knownLevels.every((l) => l === "good");

  return {
    verdict,
    verdictLabel: verdictLabel(verdict),
    score,
    periodLabel: periodLabel(period),
    criteria,
    tips: napTips(criteria),
    disclaimer,
    allGood,
  };
}
