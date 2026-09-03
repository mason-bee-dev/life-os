import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { PRIORITY_LABELS, TODO_CATEGORIES } from "./data";
import { TodosCard } from "./TodosCard";
import type { Priority, Todo, TodoCategory } from "./types";

type TodosProps = {
  todos: Todo[];
  addTodo: (payload: Omit<Todo, "id" | "createdAt" | "done">) => void;
  updateTodo: (id: number, patch: Partial<Todo>) => void;
  deleteTodo: (id: number) => void;
  toggleTodo: (id: number) => void;
};

type FormState = {
  text: string;
  priority: Priority;
  category: TodoCategory;
  dueDate: string;
};

const emptyForm: FormState = {
  text: "",
  priority: "medium",
  category: "Công việc",
  dueDate: "",
};

const fieldClass =
  "w-full rounded-xl border border-border bg-transparent px-3.5 py-2.5 text-sm outline-none placeholder:text-faint focus:border-primary";

export function Todos({ todos, addTodo, updateTodo, deleteTodo, toggleTodo }: TodosProps) {
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Todo | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const total = todos.length;
  const doneCount = todos.filter((t) => t.done).length;
  const activeCount = total - doneCount;
  const overdueCount = todos.filter(
    (t) => !t.done && t.dueDate && dayjs(t.dueDate).isBefore(dayjs(), "day"),
  ).length;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;

  const filtered = useMemo(() => {
    if (priorityFilter === "all") return todos;
    return todos.filter((t) => t.priority === priorityFilter);
  }, [todos, priorityFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (todo: Todo) => {
    setEditing(todo);
    setForm({
      text: todo.text,
      priority: todo.priority,
      category: todo.category,
      dueDate: todo.dueDate ?? "",
    });
    setOpen(true);
  };

  const submit = () => {
    const text = form.text.trim();
    if (!text) return;

    const payload = {
      text,
      priority: form.priority,
      category: form.category,
      dueDate: form.dueDate || undefined,
    };

    if (editing) {
      updateTodo(editing.id, payload);
    } else {
      addTodo(payload);
    }
    setOpen(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const priorities: { id: Priority | "all"; label: string }[] = [
    { id: "all", label: "Mọi mức" },
    { id: "high", label: "Cao" },
    { id: "medium", label: "Trung bình" },
    { id: "low", label: "Thấp" },
  ];

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
          <Plus size={16} /> Thêm
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
        <div className="h-[7px] overflow-hidden rounded-full bg-track">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-[width] duration-300"
            style={{ width: pct + "%" }}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {priorities.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPriorityFilter(p.id)}
            className={cn(
              "rounded-full border px-[11px] py-[5px] text-[12px] font-semibold transition-colors",
              priorityFilter === p.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-[#2a3752]",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      <TodosCard
        todos={filtered}
        onToggle={toggleTodo}
        onEdit={openEdit}
        onDelete={deleteTodo}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-border bg-card text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Sửa công việc" : "Thêm công việc"}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3.5">
            <label className="flex flex-col gap-1.5">
              <span className="text-[12.5px] font-semibold text-muted-foreground">Nội dung</span>
              <input
                value={form.text}
                onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
                placeholder="Việc cần làm..."
                className={fieldClass}
                autoFocus
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-[12.5px] font-semibold text-muted-foreground">Độ ưu tiên</span>
                <select
                  value={form.priority}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, priority: e.target.value as Priority }))
                  }
                  className={fieldClass}
                >
                  {(Object.keys(PRIORITY_LABELS) as Priority[]).map((p) => (
                    <option key={p} value={p} className="bg-card">
                      {PRIORITY_LABELS[p]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-[12.5px] font-semibold text-muted-foreground">Danh mục</span>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value as TodoCategory }))
                  }
                  className={fieldClass}
                >
                  {TODO_CATEGORIES.map((c) => (
                    <option key={c} value={c} className="bg-card">
                      {c}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-[12.5px] font-semibold text-muted-foreground">Hạn (tuỳ chọn)</span>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                className={fieldClass}
              />
            </label>
          </div>

          <DialogFooter>
            <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>
              Huỷ
            </Button>
            <Button size="sm" onClick={submit} disabled={!form.text.trim()}>
              {editing ? "Lưu" : "Thêm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
