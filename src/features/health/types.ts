export type DrinkCategory = "cafe" | "soft_drink" | "tea";

export const DRINK_CATEGORY_LABELS: Record<DrinkCategory, string> = {
  cafe: "Cà phê",
  soft_drink: "Nước ngọt",
  tea: "Trà",
};

export const DRINK_PRESETS: Record<DrinkCategory, string[]> = {
  cafe: [
    "Đen đá",
    "Nâu đá",
    "Bạc xỉu",
    "Cafe muối",
    "Cafe cốt dừa",
    "Khác",
  ],
  soft_drink: ["Redbull", "Rockstar", "Sting", "Coca", "Khác"],
  tea: ["Trà đá", "Trà chanh", "Trà sữa", "Khác"],
};

export type DrinkLog = {
  id: number;
  category: DrinkCategory;
  /** Preset name, or "Khác" when custom. */
  type: string;
  customType?: string;
  cups: number;
  /** VND; 0 if not set. */
  amount: number;
  note?: string | null;
};

/** @deprecated Use DrinkLog — kept for localStorage migrate compat. */
export type CoffeeLog = DrinkLog;
/** @deprecated */
export type CoffeeType = string;

export type DailyRecord = {
  date: string;
  waterGlasses?: number;
  drinks?: DrinkLog[];
  /** Legacy localStorage key — prefer drinks. */
  coffee?: DrinkLog[];
  masturbationCount?: number;
  /** Optional note attached to WP for that date. */
  wpNote?: string | null;
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

export function drinkDisplayName(d: DrinkLog): string {
  if (d.type === "Khác") return d.customType?.trim() || "Khác";
  return d.type;
}

export function formatVnd(amount: number): string {
  return `${Math.round(amount).toLocaleString("vi-VN")}đ`;
}

export function drinkTableLabel(d: DrinkLog): string {
  const name = drinkDisplayName(d);
  if (d.amount > 0) return `${name} - ${formatVnd(d.amount)}`;
  return name;
}
