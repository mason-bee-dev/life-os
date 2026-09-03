export type Priority = "high" | "medium" | "low";
export type TodoCategory = "Công việc" | "Cá nhân" | "Học tập" | "Sức khỏe" | "Khác";

export type Todo = {
  id: number;
  text: string;
  priority: Priority;
  category: TodoCategory;
  done: boolean;
  createdAt: string; // ISO string
  dueDate?: string; // "YYYY-MM-DD", optional
};
