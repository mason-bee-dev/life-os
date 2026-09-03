import dayjs from "dayjs";
import type { Todo } from "./types";

export const PRIORITY_ORDER: Record<Todo["priority"], number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export const PRIORITY_COLORS: Record<Todo["priority"], string> = {
  high: "#EF4444",
  medium: "#F59E0B",
  low: "#22C55E",
};

export const PRIORITY_LABELS: Record<Todo["priority"], string> = {
  high: "Cao",
  medium: "Trung bình",
  low: "Thấp",
};

export const TODO_CATEGORIES = [
  "Công việc",
  "Cá nhân",
  "Học tập",
  "Sức khỏe",
  "Khác",
] as const;

export const defaultTodos: Todo[] = [
  {
    id: 1,
    text: "Hoàn thành báo cáo tuần",
    priority: "high",
    category: "Công việc",
    done: false,
    createdAt: dayjs().subtract(2, "day").toISOString(),
    dueDate: dayjs().subtract(1, "day").format("YYYY-MM-DD"),
  },
  {
    id: 2,
    text: "Đặt lịch khám răng",
    priority: "medium",
    category: "Sức khỏe",
    done: false,
    createdAt: dayjs().subtract(1, "day").toISOString(),
    dueDate: dayjs().add(3, "day").format("YYYY-MM-DD"),
  },
  {
    id: 3,
    text: "Ôn chương 4 tiếng Anh",
    priority: "medium",
    category: "Học tập",
    done: false,
    createdAt: dayjs().toISOString(),
    dueDate: dayjs().format("YYYY-MM-DD"),
  },
  {
    id: 4,
    text: "Mua rau và trứng",
    priority: "low",
    category: "Cá nhân",
    done: true,
    createdAt: dayjs().subtract(3, "day").toISOString(),
  },
  {
    id: 5,
    text: "Dọn hộp thư đến",
    priority: "low",
    category: "Khác",
    done: false,
    createdAt: dayjs().toISOString(),
    dueDate: dayjs().add(1, "day").format("YYYY-MM-DD"),
  },
];
