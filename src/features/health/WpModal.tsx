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
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate: string;
  initialCount?: number;
  initialNote?: string | null;
  isSaving?: boolean;
  onSave: (input: { date: string; count: number; note: string }) => void;
};

export function WpModal({
  open,
  onOpenChange,
  defaultDate,
  initialCount = 0,
  initialNote = "",
  isSaving,
  onSave,
}: Props) {
  const [date, setDate] = useState(defaultDate);
  const [count, setCount] = useState(initialCount);
  const [note, setNote] = useState(initialNote ?? "");
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDate(defaultDate);
    setCount(initialCount);
    setNote(initialNote ?? "");
    setDatePickerOpen(false);
  }, [open, defaultDate, initialCount, initialNote]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ghi nhận WP</DialogTitle>
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
            <Label>Số lần WP</Label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCount((c) => Math.max(0, c - 1))}
                className="grid h-9 w-9 place-items-center rounded-xl border border-border hover:border-primary hover:text-primary"
              >
                <Minus size={14} />
              </button>
              <span className="min-w-[2rem] text-center text-lg tabular-nums">
                {count}
              </span>
              <button
                type="button"
                onClick={() => setCount((c) => c + 1)}
                className="grid h-9 w-9 place-items-center rounded-xl border border-border hover:border-primary hover:text-primary"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="wp-note">Ghi chú</Label>
            <textarea
              id="wp-note"
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
            disabled={isSaving}
            onClick={() => onSave({ date, count, note: note.trim() })}
          >
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
