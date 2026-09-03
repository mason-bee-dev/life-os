import { Sprout, Moon, Clock, type LucideIcon } from "lucide-react";

export type Insight = {
  icon: LucideIcon;
  color: string;
  bg: string;
  title: string;
  text: string;
};

export const insightItems: Insight[] = [
  {
    icon: Sprout,
    color: "#10b981",
    bg: "rgba(16,185,129,.10)",
    title: "Giấc ngủ & Năng suất",
    text: "Bạn làm việc hiệu quả hơn 23% vào những ngày ngủ trên 7 tiếng.",
  },
  {
    icon: Moon,
    color: "#8b5cf6",
    bg: "rgba(139,92,246,.10)",
    title: "Vận động & Tâm trạng",
    text: "Tâm trạng của bạn tốt hơn 18% vào những ngày có vận động.",
  },
  {
    icon: Clock,
    color: "#f59e0b",
    bg: "rgba(245,158,11,.10)",
    title: "Thời điểm tốt nhất",
    text: "Bạn làm việc hiệu quả nhất trong khoảng 9h–12h sáng.",
  },
];

export type Correlation = {
  a: string;
  b: string;
  r: number;
  dir: "pos" | "neg";
  note: string;
};
export const correlations: Correlation[] = [
  { a: "Giấc ngủ", b: "Năng suất", r: 0.72, dir: "pos", note: "Ngủ nhiều hơn → tập trung tốt hơn" },
  { a: "Vận động", b: "Tâm trạng", r: 0.61, dir: "pos", note: "Vận động giúp tâm trạng tốt hơn" },
  { a: "Vận động", b: "Năng lượng", r: 0.55, dir: "pos", note: "Những ngày vận động giúp bạn tràn đầy năng lượng" },
  { a: "Thời gian màn hình", b: "Giấc ngủ", r: -0.48, dir: "neg", note: "Xem màn hình nhiều → ngủ ít hơn" },
  { a: "Giờ làm việc", b: "Tâm trạng", r: -0.31, dir: "neg", note: "Những ngày dài dễ làm tâm trạng đi xuống" },
];

export type ScatterPoint = { s: number; p: number };
export const scatterData: ScatterPoint[] = [
  { s: 5.6, p: 52 }, { s: 6.0, p: 58 }, { s: 6.2, p: 55 }, { s: 6.5, p: 63 },
  { s: 6.6, p: 60 }, { s: 6.8, p: 66 }, { s: 6.9, p: 68 }, { s: 7.0, p: 72 },
  { s: 7.1, p: 70 }, { s: 7.3, p: 78 }, { s: 7.4, p: 74 }, { s: 7.6, p: 82 },
  { s: 7.8, p: 80 }, { s: 8.0, p: 86 }, { s: 8.1, p: 84 }, { s: 8.4, p: 90 },
];

export type CompareRow = { label: string; last: number; now: number; unit: string };
export const compareRows: CompareRow[] = [
  { label: "Điểm sống", last: 70, now: 74, unit: "" },
  { label: "Giấc ngủ", last: 6.8, now: 7.1, unit: "h" },
  { label: "Vận động", last: 3.4, now: 4.0, unit: "/wk" },
  { label: "Tập trung sâu", last: 3.5, now: 4.2, unit: "h" },
  { label: "Tâm trạng", last: 3.9, now: 4.2, unit: "/5" },
];
