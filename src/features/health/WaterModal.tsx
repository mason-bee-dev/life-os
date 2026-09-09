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
  initialGlasses?: number;
  isSaving?: boolean;
  onSave: (input: { date: string; glasses: number }) => void;
};

export function WaterModal({
  open,
  onOpenChange,
  defaultDate,
  initialGlasses = 0,
  isSaving,
  onSave,
}: Props) {
  const [date, setDate] = useState(defaultDate);
  const [glasses, setGlasses] = useState(initialGlasses);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDate(defaultDate);
    setGlasses(initialGlasses);
    setDatePickerOpen(false);
  }, [open, defaultDate, initialGlasses]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ghi nhận uống nước</DialogTitle>
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
            <Label>Số ly (0.25 L / ly)</Label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setGlasses((g) => Math.max(0, g - 1))}
                className="grid h-9 w-9 place-items-center rounded-xl border border-border hover:border-primary hover:text-primary"
              >
                <Minus size={14} />
              </button>
              <span className="min-w-[3rem] text-center text-lg tabular-nums">
                {glasses}
              </span>
              <button
                type="button"
                onClick={() => setGlasses((g) => Math.min(20, g + 1))}
                className="grid h-9 w-9 place-items-center rounded-xl border border-border hover:border-primary hover:text-primary"
              >
                <Plus size={14} />
              </button>
              <span className="text-[13px] text-muted-foreground tabular-nums">
                = {(glasses * 0.25).toFixed(2)} L
              </span>
            </div>
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
            onClick={() => onSave({ date, glasses })}
          >
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
