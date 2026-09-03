import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { PRIORITY_LABELS, TODO_CATEGORIES } from "./data";
import type { Priority, Todo, TodoCategory } from "./types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  todo?: Todo;
  onSave: (payload: Omit<Todo, "id" | "createdAt" | "done">) => void;
};

type FormState = {
  text: string;
  priority: Priority;
  category: TodoCategory;
  dueDate: Date | undefined;
};

function toForm(todo?: Todo): FormState {
  return {
    text: todo?.text ?? "",
    priority: todo?.priority ?? "medium",
    category: todo?.category ?? "Công việc",
    dueDate: todo?.dueDate ? dayjs(todo.dueDate).toDate() : undefined,
  };
}

export function TodoFormDialog({ open, onOpenChange, todo, onSave }: Props) {
  const [form, setForm] = useState<FormState>(() => toForm(todo));

  useEffect(() => {
    if (open) setForm(toForm(todo));
  }, [open, todo]);

  const submit = () => {
    const text = form.text.trim();
    if (!text) return;
    onSave({
      text,
      priority: form.priority,
      category: form.category,
      dueDate: form.dueDate ? dayjs(form.dueDate).format("YYYY-MM-DD") : undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{todo ? "Sửa công việc" : "Thêm công việc"}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-1">
          <div className="flex flex-col gap-2">
            <Label htmlFor="todo-text">Nội dung</Label>
            <Input
              id="todo-text"
              value={form.text}
              onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
              placeholder="Việc cần làm..."
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label>Độ ưu tiên</Label>
              <Select
                value={form.priority}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, priority: v as Priority }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(PRIORITY_LABELS) as Priority[]).map((p) => (
                    <SelectItem key={p} value={p}>
                      {PRIORITY_LABELS[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Danh mục</Label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, category: v as TodoCategory }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TODO_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Hạn (tuỳ chọn)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !form.dueDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.dueDate
                    ? dayjs(form.dueDate).format("DD/MM/YYYY")
                    : "Chọn ngày"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={form.dueDate}
                  onSelect={(date) => setForm((f) => ({ ...f, dueDate: date }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {form.dueDate && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="self-start"
                onClick={() => setForm((f) => ({ ...f, dueDate: undefined }))}
              >
                Xoá hạn
              </Button>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            Huỷ
          </Button>
          <Button size="sm" onClick={submit} disabled={!form.text.trim()}>
            {todo ? "Lưu" : "Thêm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
