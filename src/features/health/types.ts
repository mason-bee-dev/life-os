export type CoffeeType =
  | "Đen" | "Sữa" | "Espresso" | "Cappuccino" | "Latte"
  | "Americano" | "Bạc xỉu" | "Cà phê muối" | "Khác";

export type CoffeeLog = {
  id: number;
  type: CoffeeType;
  customType?: string;
  cups: number;
};

export type DailyRecord = {
  date: string;
  waterGlasses?: number;
  coffee?: CoffeeLog[];
  masturbationCount?: number;
  watchedPorn?: boolean;
};

export type DailyRecords = Record<string, DailyRecord>;

export type Period = "day" | "week" | "month" | "year";

export const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "day", label: "Ngày" },
  { value: "week", label: "Tuần" },
  { value: "month", label: "Tháng" },
  { value: "year", label: "Năm" },
];
