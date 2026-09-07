export type SleepQuality = "kho_ngu" | "binh_thuong" | "ngu_ngon";

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

export const qualityLabels: Record<SleepQuality, string> = {
  kho_ngu: "Khó ngủ",
  binh_thuong: "Bình thường",
  ngu_ngon: "Ngủ ngon",
};

export const qualityEmojis: Record<SleepQuality, string> = {
  kho_ngu: "😖",
  binh_thuong: "😐",
  ngu_ngon: "😴",
};

export type Period = "day" | "week" | "month" | "year";
