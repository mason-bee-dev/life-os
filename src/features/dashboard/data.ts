import type { SparkPoint } from "@/types";

const spark = (arr: number[]): SparkPoint[] => arr.map((v, i) => ({ i, v }));

export const energyData = spark([60, 58, 63, 61, 66, 64, 70, 68, 74, 71, 78, 82]);
export const moodData = spark([3.8, 4.0, 3.9, 4.2, 4.1, 4.3, 4.0, 4.2, 4.4, 4.1, 4.3, 4.2]);
export const sleepData = spark([6.4, 6.8, 6.5, 7.0, 6.9, 7.2, 6.8, 6.7, 7.1, 7.3, 7.0, 7.2]);
export const prodData = spark([62, 60, 65, 63, 68, 66, 70, 68, 72, 71, 74, 76]);

export type WeekPoint = { day: string; date: string; v: number };
export const weekData: WeekPoint[] = [
  { day: "T2", date: "26/08/2026", v: 73 },
  { day: "T3", date: "27/08/2026", v: 79 },
  { day: "T4", date: "28/08/2026", v: 78 },
  { day: "T5", date: "29/08/2026", v: 72 },
  { day: "T6", date: "30/08/2026", v: 74 },
  { day: "T7", date: "31/08/2026", v: 76 },
  { day: "CN", date: "01/09/2026", v: 81 },
];

// August 2026: Aug 1 = Saturday, Aug 31 = Monday (today)
export const calWeeks: number[][] = [
  [27, 28, 29, 30, 31, 1, 2],
  [3, 4, 5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14, 15, 16],
  [17, 18, 19, 20, 21, 22, 23],
  [24, 25, 26, 27, 28, 29, 30],
  [31, 1, 2, 3, 4, 5, 6],
];

export const quality: Record<number, string> = {
  1: "avg", 2: "exc", 3: "good", 4: "good", 5: "exc", 6: "avg", 7: "good",
  8: "avg", 9: "low", 10: "good", 11: "exc", 12: "good", 13: "avg", 14: "good",
  15: "exc", 16: "exc", 17: "good", 18: "avg", 19: "good", 20: "exc", 21: "good",
  22: "exc", 23: "exc", 24: "good", 25: "good", 26: "avg", 27: "good", 28: "exc",
  29: "exc", 30: "exc",
};
