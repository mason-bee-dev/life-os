export type DayType = "work" | "weekend" | "holiday" | "leave";
export type WorkLoad = "full" | "half" | "empty";
export type WorkCategory = "company" | "personal";
export type Period = "day" | "week" | "month" | "year";
export type CategoryFilter = "all" | WorkCategory;

export interface WorkDay {
  date: string;
  dayType: DayType;
  load: WorkLoad | null;
  note?: string | null;
}

export interface WorkLog {
  id: string;
  date: string;
  category: WorkCategory;
  project: string;
  hours: number | null;
  note?: string | null;
}

export type WorkDayInput = {
  date: string;
  dayType: DayType;
  load?: WorkLoad | null;
  note?: string | null;
};

export type WorkLogInput = {
  id?: string;
  date: string;
  category: WorkCategory;
  project: string;
  hours: number | null;
  note?: string | null;
};

export const STANDARD_DAY_HOURS = 8;
export const FULL_DAY_THRESHOLD = 6;
export const HOUR_CHIPS = [1, 2, 4, 6, 8] as const;

export const PROJECT_SUGGESTIONS: Record<WorkCategory, string[]> = {
  company: ["KintraX", "Mittaria", "Arbeat", "4DOS", "EngageRM", "LightLink"],
  personal: ["Life OS", "Content"],
};

export const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "day", label: "Ngày" },
  { value: "week", label: "Tuần" },
  { value: "month", label: "Tháng" },
  { value: "year", label: "Năm" },
];

export const CATEGORY_FILTER_OPTIONS: {
  value: CategoryFilter;
  label: string;
}[] = [
  { value: "all", label: "Tất cả" },
  { value: "company", label: "Công ty" },
  { value: "personal", label: "Cá nhân" },
];

export const LOAD_LABEL: Record<WorkLoad, string> = {
  full: "Cả ngày",
  half: "Nửa ngày",
  empty: "Trống task",
};

export const CATEGORY_LABEL: Record<WorkCategory, string> = {
  company: "Công ty",
  personal: "Cá nhân",
};
