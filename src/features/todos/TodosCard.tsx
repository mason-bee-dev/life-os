import { useMemo, useState } from "react";
import { Check, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { cn } from "@/lib/utils";
import { PRIORITY_COLORS, PRIORITY_ORDER } from "./data";
import type { Todo } from "./types";

type StatusFilter = "all" | "active" | "done";

type Props = {
  todos: Todo[];
  onToggle: (id: number) => void;
  compact?: boolean;
  onEdit?: (todo: Todo) => void;
  onDelete?: (id: number) => void;
};

function isOverdue(todo: Todo): boolean {
  if (!todo.dueDate || todo.done) return false;
  return dayjs(todo.dueDate).isBefore(dayjs(), "day");
}

export function TodosCard({ todos, onToggle, compact = false, onEdit, onDelete }: Props) {
  const navigate = useNavigate();
  const [status, setStatus] = useState<StatusFilter>("all");

  const visible = useMemo(() => {
    let list = [...todos];

    if (compact) {
      list = list
        .filter((t) => !t.done)
        .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
        .slice(0, 5);
      return list;
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
          <button
            type="button"
            onClick={() => navigate("/todos")}
            className="text-[12.5px] font-semibold text-blue-500 hover:underline"
          >
            Xem tất cả →
          </button>
        )}
      </div>

      {!compact && (
        <div className="mb-3.5 flex gap-1.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatus(tab.id)}
              className={cn(
                "rounded-full border px-[11px] py-[5px] text-[12px] font-semibold transition-colors",
                status === tab.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-[#2a3752]",
              )}
            >
              {tab.label}
            </button>
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
                className="flex items-center gap-[11px] border-b border-border py-[9px] last:border-b-0"
              >
                <button
                  type="button"
                  onClick={() => onToggle(todo.id)}
                  className={cn(
                    "grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full border-2 text-white transition-colors",
                    todo.done
                      ? "border-primary bg-primary"
                      : "border-[#2a3752] hover:border-primary",
                  )}
                >
                  {todo.done && <Check size={13} strokeWidth={3} />}
                </button>

                <i
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: PRIORITY_COLORS[todo.priority] }}
                  title={todo.priority}
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
                  <div className="mt-0.5 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-accent px-2 py-px text-[11px] font-semibold text-muted-foreground">
                      {todo.category}
                    </span>
                    {todo.dueDate && (
                      <span
                        className={cn(
                          "text-[11.5px] font-medium",
                          overdue ? "text-red-500" : "text-muted-foreground",
                        )}
                      >
                        {dayjs(todo.dueDate).format("DD/MM/YYYY")}
                        {overdue ? " · Quá hạn" : ""}
                      </span>
                    )}
                  </div>
                </div>

                {!compact && (onEdit || onDelete) && (
                  <div className="flex shrink-0 gap-1">
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(todo)}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                        aria-label="Sửa"
                      >
                        <Pencil size={14} />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(todo.id)}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-red-400"
                        aria-label="Xoá"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
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
