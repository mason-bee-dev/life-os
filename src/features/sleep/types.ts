export type SleepQuality = "kho_ngu" | "binh_thuong" | "ngu_ngon";

/** One daily row in Supabase — night + nap fields share the same date key. */
export type SleepRecord = {
  id: string;
  date: string;
  bedtime: string | null;
  wakeTime: string | null;
  nightWakingTimes: string[];
  quality: SleepQuality | null;
  note: string | null;
  napStart: string | null;
  napEnd: string | null;
};

export type NightSleepInput = {
  date: string;
  bedtime: string;
  wakeTime: string;
  nightWakingTimes: string[];
  quality?: SleepQuality | null;
  note?: string | null;
};

export type NapInput = {
  date: string;
  startTime: string;
  endTime: string;
  note?: string | null;
};

export const qualityLabels: Record<SleepQuality, string> = {
  kho_ngu: "Khó ngủ",
  binh_thuong: "Bình thường",
  ngu_ngon: "Ngủ ngon",
};

export const qualityEmojis: Record<SleepQuality, string> = {
  kho_ngu: "😣",
  binh_thuong: "😌",
  ngu_ngon: "😴",
};

export type Period = "day" | "week" | "month";

export type SleepTab = "night" | "nap";

export const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "day", label: "Ngày" },
  { value: "week", label: "Tuần" },
  { value: "month", label: "Tháng" },
];

