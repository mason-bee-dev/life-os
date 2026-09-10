import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { CalendarIcon, Plus, Trash2, X } from "lucide-react";
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
import { durationMinutes, formatDuration } from "./sleepStats";
import type { NightSleepInput, SleepQuality, SleepRecord } from "./types";
import { qualityEmojis, qualityLabels } from "./types";

const qualities: SleepQuality[] = ["kho_ngu", "binh_thuong", "ngu_ngon"];

function sortTimesAsc(times: string[]): string[] {
  return [...times].sort((a, b) => {
    const [ah, am] = a.split(":").map(Number);
    const [bh, bm] = b.split(":").map(Number);
    return ah * 60 + am - (bh * 60 + bm);
  });
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record?: SleepRecord;
  defaultDate: string;
  isSaving: boolean;
  isDeleting?: boolean;
  onSave: (input: NightSleepInput) => void;
  onDelete?: () => void;
};

export function NightSleepModal({
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
  const [bedtime, setBedtime] = useState<string | null>(null);
  const [wakeTime, setWakeTime] = useState<string | null>(null);
  const [nightWakingTimes, setNightWakingTimes] = useState<string[]>([]);
  const [quality, setQuality] = useState<SleepQuality | null>("binh_thuong");
  const [note, setNote] = useState("");
  const [manualTime, setManualTime] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const editing = Boolean(record?.bedtime && record?.wakeTime);

  useEffect(() => {
    if (!open) return;
    setDate(record?.date ?? defaultDate);
    setBedtime(record?.bedtime ?? null);
    setWakeTime(record?.wakeTime ?? null);
    setNightWakingTimes(record?.nightWakingTimes ?? []);
    setQuality(record?.quality ?? "binh_thuong");
    setNote(record?.note ?? "");
    setManualTime(null);
    setConfirmDelete(false);
  }, [open, defaultDate, record]);

  const sortedWakings = useMemo(
    () => sortTimesAsc(nightWakingTimes),
    [nightWakingTimes],
  );

  const nightMins =
    bedtime && wakeTime ? durationMinutes(bedtime, wakeTime) : null;

  const appendWaking = (t: string) => {
    setNightWakingTimes((prev) => [...prev, t]);
  };

  const removeWaking = (indexInSorted: number) => {
    const target = sortedWakings[indexInSorted];
    setNightWakingTimes((prev) => {
      const i = prev.indexOf(target);
      if (i < 0) return prev;
      return [...prev.slice(0, i), ...prev.slice(i + 1)];
    });
  };

  const handleSave = () => {
    if (!bedtime || !wakeTime) return;
    onSave({
      date,
      bedtime,
      wakeTime,
      nightWakingTimes,
      quality,
      note: note.trim() || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Sửa giấc ngủ đêm" : "Thêm giấc ngủ đêm"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-1">
          <div className="space-y-1.5">
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
              label="Giờ đi ngủ"
              value={bedtime}
              onChange={setBedtime}
            />
            <TimeField
              label="Giờ thức dậy"
              value={wakeTime}
              onChange={setWakeTime}
            />
          </div>

          <div className="space-y-1">
            <Label>Thời lượng ngủ</Label>
            <p className="text-[15px] font-semibold tabular-nums">
              {nightMins != null ? formatDuration(nightMins) : "—"}
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="text-[13px] text-muted-foreground">Dậy đêm</div>
            <div className="flex flex-wrap items-end gap-2">
              <TimeField
                label="Giờ dậy"
                value={manualTime}
                onChange={setManualTime}
                className="min-w-[10rem]"
              />
              <Button
                type="button"
                size="sm"
                disabled={!manualTime}
                onClick={() => {
                  if (!manualTime) return;
                  appendWaking(manualTime);
                  setManualTime(null);
                }}
              >
                <Plus className="size-3.5" />
                Thêm
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => appendWaking(dayjs().format("HH:mm"))}
              >
                Dậy lúc này
              </Button>
            </div>
            {sortedWakings.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {sortedWakings.map((t, i) => (
                  <span
                    key={`${t}-${i}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/40 px-2.5 py-1 text-[13px] tabular-nums"
                  >
                    {t}
                    <button
                      type="button"
                      aria-label={`Xoá ${t}`}
                      onClick={() => removeWaking(i)}
                      className="rounded p-0.5 text-muted-foreground hover:text-destructive"
                    >
                      <X className="size-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className="text-[13px] text-muted-foreground">
              Số lần dậy đêm:{" "}
              <span className="tabular-nums text-foreground">
                {nightWakingTimes.length}
              </span>
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-[13px] text-muted-foreground">Chất lượng</div>
            <div className="flex flex-wrap gap-2">
              {qualities.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQuality(q)}
                  className={
                    "rounded-lg border px-3 py-2 text-[13px] font-semibold transition-colors " +
                    (quality === q
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary hover:text-primary")
                  }
                >
                  {qualityEmojis[q]} {qualityLabels[q]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="night-note">Ghi chú</Label>
            <textarea
              id="night-note"
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
            {editing &&
              onDelete &&
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
              disabled={isSaving || !bedtime || !wakeTime}
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
