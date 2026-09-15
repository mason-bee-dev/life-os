import type { ActivityIconName } from "./types";
import { GROUPS } from "./types";
import { createActivity, fetchActivities } from "./api";

type SeedDef = {
  name: string;
  icon: ActivityIconName;
  color: string;
  groupId: string;
  sortOrder: number;
};

const DEFAULT_ACTIVITIES: SeedDef[] = [
  { name: "Ngủ", icon: "Moon", color: "#6366f1", groupId: "rest", sortOrder: 0 },
  {
    name: "Làm việc sâu",
    icon: "Brain",
    color: "#3b82f6",
    groupId: "work",
    sortOrder: 1,
  },
  {
    name: "Họp",
    icon: "Users",
    color: "#2563eb",
    groupId: "work",
    sortOrder: 2,
  },
  {
    name: "Ăn",
    icon: "Utensils",
    color: "#16a34a",
    groupId: "body",
    sortOrder: 3,
  },
  {
    name: "Cà phê",
    icon: "Coffee",
    color: "#ca8a04",
    groupId: "body",
    sortOrder: 4,
  },
  {
    name: "Chơi với con",
    icon: "Baby",
    color: "#d97706",
    groupId: "home",
    sortOrder: 5,
  },
  {
    name: "Việc nhà",
    icon: "Home",
    color: "#b45309",
    groupId: "home",
    sortOrder: 6,
  },
  {
    name: "Nghỉ/Giải trí",
    icon: "Gamepad2",
    color: "#db2777",
    groupId: "leisure",
    sortOrder: 7,
  },
  {
    name: "Tập thể dục",
    icon: "Dumbbell",
    color: "#059669",
    groupId: "body",
    sortOrder: 8,
  },
  {
    name: "Di chuyển",
    icon: "Car",
    color: "#64748b",
    groupId: "leisure",
    sortOrder: 9,
  },
];

/** Seed default activities once when the user has none. */
export async function seedDefaultActivitiesIfEmpty(): Promise<boolean> {
  const existing = await fetchActivities();
  if (existing.length > 0) return false;

  const validGroupIds = new Set(GROUPS.map((g) => g.id));
  for (const def of DEFAULT_ACTIVITIES) {
    if (!validGroupIds.has(def.groupId)) continue;
    await createActivity({
      name: def.name,
      icon: def.icon,
      color: def.color,
      groupId: def.groupId,
      sortOrder: def.sortOrder,
    });
  }
  return true;
}
