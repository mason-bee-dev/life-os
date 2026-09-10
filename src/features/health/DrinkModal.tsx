import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { CalendarIcon, Minus, Plus } from "lucide-react";
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
  DRINK_CATEGORY_LABELS,
  DRINK_PRESETS,
  type DrinkCategory,
  type DrinkLog,
} from "./types";

const CATEGORIES: DrinkCategory[] = ["cafe", "soft_drink", "tea"];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate: string;
  /** Edit existing log; omit for create. */
  editLog?: DrinkLog | null;
  isSaving?: boolean;
  onSave: (input: {
    date: string;
    category: DrinkCategory;
    type: string;
    customType?: string;
    cups: number;
    amount: number;
    note: string;
  }) => void;
};

export function DrinkModal({
  open,
  onOpenChange,
  defaultDate,
  editLog,
  isSaving,
  onSave,
}: Props) {
  const [date, setDate] = useState(defaultDate);
  const [category, setCategory] = useState<DrinkCategory>("cafe");
  const [type, setType] = useState(DRINK_PRESETS.cafe[0]);
  const [customType, setCustomType] = useState("");
  const [cups, setCups] = useState(1);
  const [amountText, setAmountText] = useState("");
  const [note, setNote] = useState("");
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const editing = Boolean(editLog);

  useEffect(() => {
    if (!open) return;
    setDate(defaultDate);
    if (editLog) {
      setCategory(editLog.category);
      setType(editLog.type);
      setCustomType(editLog.customType ?? "");
      setCups(editLog.cups);
      setAmountText(editLog.amount > 0 ? String(editLog.amount) : "");
      setNote(editLog.note ?? "");
    } else {
      setCategory("cafe");
      setType(DRINK_PRESETS.cafe[0]);
      setCustomType("");
      setCups(1);
      setAmountText("");
      setNote("");
    }
    setDatePickerOpen(false);
  }, [open, defaultDate, editLog]);

  const presets = DRINK_PRESETS[category];
  const amount = Number(amountText.replace(/\D/g, "")) || 0;
  const canSave =
    cups >= 1 &&
    (type !== "Khác" || customType.trim().length > 0);

  const handleCategory = (c: DrinkCategory) => {
    setCategory(c);
    setType(DRINK_PRESETS[c][0]);
    setCustomType("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Sửa đồ uống" : "Thêm đồ uống"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-1">
          <div className="space-y-1.5">
            <Label>Ngày</Label>
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start tabular-nums"
                  disabled={editing}
                >
                  <CalendarIcon className="size-4" />
                  {dayjs(date).format("DD/MM/YYYY")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dayjs(date).toDate()}
                  onSelect={(d) => {
                    if (!d) return;
                    setDate(dayjs(d).format("YYYY-MM-DD"));
                    setDatePickerOpen(false);
                  }}
                  disabled={{ after: dayjs().endOf("day").toDate() }}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Nhóm</Label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleCategory(c)}
                  className={
                    "rounded-lg border px-2.5 py-1 text-[12.5px] font-semibold transition-colors " +
                    (category === c
                      ? "border-metric-productivity bg-metric-productivity/10 text-metric-productivity"
                      : "border-border text-muted-foreground hover:border-metric-productivity")
                  }
                >
                  {DRINK_CATEGORY_LABELS[c]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Loại</Label>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={
                    "rounded-lg border px-2.5 py-1 text-[12.5px] font-semibold transition-colors " +
                    (type === t
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary hover:text-primary")
                  }
                >
                  {t}
                </button>
              ))}
            </div>
            {type === "Khác" && (
              <Input
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                placeholder="Nhập tên loại…"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label>Số cốc</Label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCups((c) => Math.max(1, c - 1))}
                className="grid h-9 w-9 place-items-center rounded-xl border border-border hover:border-primary hover:text-primary"
              >
                <Minus size={14} />
              </button>
              <span className="min-w-[2rem] text-center text-lg tabular-nums">
                {cups}
              </span>
              <button
                type="button"
                onClick={() => setCups((c) => c + 1)}
                className="grid h-9 w-9 place-items-center rounded-xl border border-border hover:border-primary hover:text-primary"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="drink-amount">Số tiền (đ)</Label>
            <Input
              id="drink-amount"
              inputMode="numeric"
              value={amountText}
              onChange={(e) => setAmountText(e.target.value.replace(/[^\d]/g, ""))}
              placeholder="vd. 35200"
            />
            {amount > 0 ? (
              <p className="text-[12.5px] text-muted-foreground tabular-nums">
                = {amount.toLocaleString("vi-VN")}đ
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="drink-note">Ghi chú</Label>
            <textarea
              id="drink-note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Tuỳ chọn…"
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-body placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Huỷ
          </Button>
          <Button
            type="button"
            disabled={isSaving || !canSave}
            onClick={() =>
              onSave({
                date,
                category,
                type,
                ...(type === "Khác" ? { customType: customType.trim() } : {}),
                cups,
                amount,
                note: note.trim(),
              })
            }
          >
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
