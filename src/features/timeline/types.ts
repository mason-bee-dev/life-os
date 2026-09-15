import type { LucideIcon } from "lucide-react";
import {
  Baby,
  Brain,
  Car,
  Coffee,
  Dumbbell,
  Gamepad2,
  Home,
  Moon,
  Users,
  Utensils,
} from "lucide-react";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { DEFAULT_PAGE_SIZE } from "@/components/DataTable";

dayjs.extend(isoWeek);

export type Period = "day" | "week" | "month" | "year";

export const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "day", label: "Ngày" },
  { value: "week", label: "Tuần" },
  { value: "month", label: "Tháng" },
  { value: "year", label: "Năm" },
];

export const PAGE_SIZE = DEFAULT_PAGE_SIZE;

export type ActivityGroup = {
  id: string;
  name: string;
  color: string;
};

/** Five activity groups — segment blocks use group color. */
export const GROUPS: ActivityGroup[] = [
  { id: "rest", name: "Nghỉ ngơi", color: "#6366f1" },
  { id: "work", name: "Công việc", color: "#3b82f6" },
  { id: "body", name: "Thể chất", color: "#16a34a" },
  { id: "home", name: "Gia đình & nhà", color: "#d97706" },
  { id: "leisure", name: "Giải trí", color: "#db2777" },
];

export const GROUP_BY_ID: Record<string, ActivityGroup> = Object.fromEntries(
  GROUPS.map((g) => [g.id, g]),
);

export type ActivityIconName =
  | "Moon"
  | "Brain"
  | "Users"
  | "Utensils"
  | "Coffee"
  | "Baby"
  | "Home"
  | "Gamepad2"
  | "Dumbbell"
  | "Car";

export const ACTIVITY_ICONS: Record<
  ActivityIconName,
  LucideIcon
> = {
  Moon,
  Brain,
  Users,
  Utensils,
  Coffee,
  Baby,
  Home,
  Gamepad2,
  Dumbbell,
  Car,
};

export const ACTIVITY_ICON_LABELS: Record<ActivityIconName, string> = {
  Moon: "Ngủ",
  Brain: "Tập trung",
  Users: "Họp",
  Utensils: "Ăn",
  Coffee: "Cà phê",
  Baby: "Con cái",
  Home: "Nhà",
  Gamepad2: "Giải trí",
  Dumbbell: "Tập luyện",
  Car: "Di chuyển",
};

export const ACTIVITY_ICON_OPTIONS = Object.keys(
  ACTIVITY_ICONS,
) as ActivityIconName[];

export function isActivityIconName(v: string): v is ActivityIconName {
  return v in ACTIVITY_ICONS;
}

export function getActivityIcon(name: string): LucideIcon {
  return isActivityIconName(name) ? ACTIVITY_ICONS[name] : Moon;
}

export type Activity = {
  id: string;
  name: string;
  icon: string;
  color: string;
  groupId: string;
  archived: boolean;
  sortOrder: number;
};

export type ActivitySegment = {
  id: string;
  activityId: string;
  date: string;
  startMin: number;
  endMin: number;
  note: string | null;
};

export type ActivityInput = {
  name: string;
  icon: string;
  color: string;
  groupId: string;
  sortOrder?: number;
};

export type SegmentInput = {
  activityId: string;
  date: string;
  startMin: number;
  endMin: number;
  note?: string | null;
};

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

export function minutesToHHMM(min: number): string {
  const clamped = Math.max(0, Math.min(1440, Math.round(min)));
  const h = Math.floor(clamped / 60) % 24;
  const m = clamped % 60;
  if (clamped === 1440) return "24:00";
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function hhmmToMinutes(t: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(t.trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h === 24 && m === 0) return 1440;
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

export function formatDuration(mins: number): string {
  const total = Math.max(0, Math.round(mins));
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m}p`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}p`;
}

export function groupColor(groupId: string): string {
  return GROUP_BY_ID[groupId]?.color ?? "#64748b";
}

export function segmentsOverlap(
  a: { startMin: number; endMin: number },
  b: { startMin: number; endMin: number },
): boolean {
  return a.startMin < b.endMin && b.startMin < a.endMin;
}
