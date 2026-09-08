import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { CalendarIcon, Trash2 } from "lucide-react";
import { TimeField } from "@/components/TimeField";
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
import { durationMinutes, formatMinutesOnly } from "./sleepStats";
import type { NapInput, SleepRecord } from "./types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record?: SleepRecord;
  defaultDate: string;
  isSaving: boolean;
  isDeleting?: boolean;
  onSave: (input: NapInput) => void;
  onDelete?: () => void;
};

export function NapModal({
  open,
  onOpenChange,
  record,
  defaultDate,
  isSaving,
  isDeleting,
  onSave,
  onDelete,
}: Props) {
  const [date, setDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const editing = Boolean(record?.napStart && record?.napEnd);

  useEffect(() => {
    if (!open) return;
    setDate(record?.date ?? defaultDate);
    setStartTime(record?.napStart ?? null);
    setEndTime(record?.napEnd ?? null);
    setNote(record?.note ?? "");
    setConfirmDelete(false);
  }, [open, defaultDate, record]);

  const napMins =
    startTime && endTime ? durationMinutes(startTime, endTime) : null;

  const handleSave = () => {
    if (!startTime || !endTime) return;
    onSave({
      date,
      startTime,
      endTime,
      note: note.trim() || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Sửa giấc ngủ trưa" : "Thêm giấc ngủ trưa"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-1">
          <div className="space-y-1.5">
            <Label>Ngày</Label>
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 font-semibold"
                >
                  <CalendarIcon className="size-3.5" />
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
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <TimeField
              label="Giờ bắt đầu"
              value={startTime}
              onChange={setStartTime}
            />
            <TimeField label="Giờ dậy" value={endTime} onChange={setEndTime} />
          </div>

          <div className="space-y-1">
            <Label>Thời lượng</Label>
            <p className="text-[15px] font-semibold tabular-nums">
              {napMins != null ? formatMinutesOnly(napMins) : "—"}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="nap-note">Ghi chú</Label>
            <textarea
              id="nap-note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Tuỳ chọn…"
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-body placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <div>
            {editing && onDelete &&
              (confirmDelete ? (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    disabled={isDeleting}
                    onClick={onDelete}
                  >
                    Xác nhận xoá
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setConfirmDelete(false)}
                  >
                    Huỷ
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="size-3.5" />
                  Xoá
                </Button>
              ))}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Huỷ
            </Button>
            <Button
              type="button"
              disabled={isSaving || !startTime || !endTime}
              onClick={handleSave}
            >
              {isSaving ? "Đang lưu…" : "Lưu"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
