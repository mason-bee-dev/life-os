import { useState } from "react";
import dayjs from "dayjs";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TodoFormDialog } from "./TodoFormDialog";
import { TodosCard } from "./TodosCard";
import type { Todo } from "./types";

type TodosProps = {
  todos: Todo[];
  addTodo: (payload: Omit<Todo, "id" | "createdAt" | "done">) => void;
  updateTodo: (id: number, patch: Partial<Todo>) => void;
  deleteTodo: (id: number) => void;
  toggleTodo: (id: number) => void;
};

export function Todos({ todos, addTodo, updateTodo, deleteTodo, toggleTodo }: TodosProps) {
  const [open, setOpen] = useState(false);
  const [editTodo, setEditTodo] = useState<Todo | undefined>(undefined);

  const total = todos.length;
  const doneCount = todos.filter((t) => t.done).length;
  const activeCount = total - doneCount;
  const overdueCount = todos.filter(
    (t) => !t.done && t.dueDate && dayjs(t.dueDate).isBefore(dayjs(), "day"),
  ).length;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;

  const openCreate = () => {
    setEditTodo(undefined);
    setOpen(true);
  };

  const openEdit = (todo: Todo) => {
    setEditTodo(todo);
    setOpen(true);
  };

  const handleSave = (payload: Omit<Todo, "id" | "createdAt" | "done">) => {
    if (editTodo) {
      updateTodo(editTodo.id, payload);
    } else {
      addTodo(payload);
    }
    setEditTodo(undefined);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-semibold tracking-tight">Công việc</h2>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Theo dõi và hoàn thành việc trong ngày.
          </p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus /> Thêm
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Tổng", value: total },
          { label: "Đang làm", value: activeCount },
          { label: "Xong", value: doneCount },
          { label: "Quá hạn", value: overdueCount },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card px-4 py-3">
            <div className="text-[11.5px] font-semibold uppercase tracking-wide text-faint">
              {s.label}
            </div>
            <div className="mt-1 text-[22px] font-bold tracking-tight">{s.value}</div>
          </div>
        ))}
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between text-[12.5px] text-muted-foreground">
          <span>Tiến độ</span>
          <span className="font-semibold text-foreground">{pct}%</span>
        </div>
        <Progress value={pct} />
      </div>

      <TodosCard
        todos={todos}
        onToggle={toggleTodo}
        onEdit={openEdit}
        onDelete={deleteTodo}
      />

      <TodoFormDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setEditTodo(undefined);
        }}
        todo={editTodo}
        onSave={handleSave}
      />
    </div>
  );
}
