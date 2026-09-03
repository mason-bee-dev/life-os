import type { Habit } from "./types";

export const defaultHabits: Habit[] = [
  { icon: "☀️", name: "Dậy sớm", meta: "06:30", done: true },
  { icon: "🏃", name: "Vận động", meta: "Chạy bộ 5.2 km", done: true },
  { icon: "📘", name: "Học tiếng Anh", meta: "45 min", done: true },
  { icon: "📖", name: "Đọc sách", meta: "30 min", done: true },
  { icon: "🌿", name: "Thiền", meta: "10 min", done: false },
  { icon: "🍎", name: "Không ăn vặt", meta: "", done: false },
  { icon: "💧", name: "Uống đủ 2L nước", meta: "1.6 L", done: true },
];
