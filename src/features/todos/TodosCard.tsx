import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { PRIORITY_LABELS, PRIORITY_ORDER } from "./data";
import type { Priority, Todo } from "./types";

type StatusFilter = "all" | "active" | "done";

type Props = {
  todos: Todo[];
  onToggle: (id: number) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: number) => void;
  compact?: boolean;
};

const priorityBadgeClass: Record<Priority, string> = {
  high: "text-red-400 border-red-400/40",
  medium: "text-amber-400 border-amber-400/40",
  low: "text-green-400 border-green-400/40",
};

function isOverdue(todo: Todo): boolean {
  if (!todo.dueDate || todo.done) return false;
  return dayjs(todo.dueDate).isBefore(dayjs(), "day");
}

export function TodosCard({
  todos,
  onToggle,
  onEdit,
  onDelete,
  compact = false,
}: Props) {
  const navigate = useNavigate();
  const [status, setStatus] = useState<StatusFilter>("all");

  const visible = useMemo(() => {
    let list = [...todos];

    if (compact) {
      return list
        .filter((t) => !t.done)
        .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
        .slice(0, 5);
    }

    if (status === "active") list = list.filter((t) => !t.done);
    if (status === "done") list = list.filter((t) => t.done);

    return list.sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    });
  }, [todos, compact, status]);

  const tabs: { id: StatusFilter; label: string }[] = [
    { id: "all", label: "Tất cả" },
    { id: "active", label: "Đang làm" },
    { id: "done", label: "Xong" },
  ];

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-[18px]">
      <div className="mb-3.5 flex items-center justify-between">
        <span className="text-[15px] font-semibold tracking-tight">
          {compact ? "Công việc hôm nay" : "Danh sách công việc"}
        </span>
        {compact && (
          <Button
            type="button"
            variant="link"
            size="sm"
            className="h-auto p-0"
            onClick={() => navigate("/todos")}
          >
            Xem tất cả →
          </Button>
        )}
      </div>

      {!compact && (
        <div className="mb-3.5 flex gap-1.5">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              type="button"
              size="sm"
              variant={status === tab.id ? "secondary" : "ghost"}
              onClick={() => setStatus(tab.id)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      )}

      <div className="flex flex-col">
        {visible.length === 0 ? (
          <p className="py-4 text-center text-[13px] text-muted-foreground">
            Không có công việc nào.
          </p>
        ) : (
          visible.map((todo) => {
            const overdue = isOverdue(todo);
            return (
              <div
                key={todo.id}
                className="flex items-center gap-3 border-b border-border py-2.5 last:border-b-0"
              >
                <Checkbox
                  checked={todo.done}
                  onCheckedChange={() => onToggle(todo.id)}
                  aria-label={todo.done ? "Đánh dấu chưa xong" : "Đánh dấu xong"}
                />

                <div className="min-w-0 flex-1">
                  <div
                    className={cn(
                      "truncate text-[13.5px] font-medium",
                      todo.done && "text-muted-foreground line-through",
                    )}
                  >
                    {todo.text}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <Badge
                      variant="outline"
                      className={priorityBadgeClass[todo.priority]}
                    >
                      {PRIORITY_LABELS[todo.priority]}
                    </Badge>
                    <Badge variant="outline">{todo.category}</Badge>
                    {todo.dueDate && (
                      <span
                        className={cn(
                          "text-[11.5px] font-medium",
                          overdue ? "text-red-400" : "text-muted-foreground",
                        )}
                      >
                        {dayjs(todo.dueDate).format("DD/MM/YYYY")}
                        {overdue ? " · Quá hạn" : ""}
                      </span>
                    )}
                  </div>
                </div>

                {!compact && (
                  <div className="flex shrink-0 gap-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Sửa"
                      onClick={() => onEdit(todo)}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Xoá"
                      onClick={() => onDelete(todo.id)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
