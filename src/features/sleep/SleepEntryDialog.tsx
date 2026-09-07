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
import { Switch } from "@/components/ui/switch";
import { durationMinutes, formatDuration } from "./stats";
import type { SleepQuality, SleepRecord } from "./types";
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
  date: string;
  onDateChange?: (isoDate: string) => void;
  record?: SleepRecord;
  isSaving: boolean;
  isDeleting?: boolean;
  onSave: (patch: Partial<SleepRecord> & { date: string }) => void;
  onDelete?: (id: string) => void;
};

export function SleepEntryDialog({
  open,
  onOpenChange,
  date,
  onDateChange,
  record,
  isSaving,
  isDeleting,
  onSave,
  onDelete,
}: Props) {
  const [bedtime, setBedtime] = useState<string | null>(null);
  const [wakeTime, setWakeTime] = useState<string | null>(null);
  const [nightWakingTimes, setNightWakingTimes] = useState<string[]>([]);
  const [quality, setQuality] = useState<SleepQuality | null>(null);
  const [note, setNote] = useState("");
  const [napEnabled, setNapEnabled] = useState(true);
  const [napStart, setNapStart] = useState<string | null>(null);
  const [napEnd, setNapEnd] = useState<string | null>(null);
  const [addingManual, setAddingManual] = useState(false);
  const [manualTime, setManualTime] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    setBedtime(record?.bedtime ?? null);
    setWakeTime(record?.wakeTime ?? null);
    setNightWakingTimes(record?.nightWakingTimes ?? []);
    setQuality(record?.quality ?? null);
    setNote(record?.note ?? "");
    if (record) {
      const on = Boolean(record.napStart || record.napEnd);
      setNapEnabled(on);
      setNapStart(record.napStart ?? null);
      setNapEnd(record.napEnd ?? null);
    } else {
      setNapEnabled(true);
      setNapStart(null);
      setNapEnd(null);
    }
    setAddingManual(false);
    setManualTime(null);
    setConfirmDelete(false);
  }, [open, date, record]);

  const sortedWakings = useMemo(
    () => sortTimesAsc(nightWakingTimes),
    [nightWakingTimes],
  );

  const nightMins =
    bedtime && wakeTime ? durationMinutes(bedtime, wakeTime) : null;
  const napMins =
    napEnabled && napStart && napEnd
      ? durationMinutes(napStart, napEnd)
      : null;

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
    onSave({
      date,
      bedtime,
      wakeTime,
      nightWakingTimes,
      quality,
      note: note.trim() || null,
      napStart: napEnabled ? napStart : null,
      napEnd: napEnabled ? napEnd : null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            <span>Giấc ngủ</span>
            {onDateChange ? (
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" size="sm" className="gap-1.5 font-semibold">
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
                      onDateChange(dayjs(d).format("YYYY-MM-DD"));
                      setDatePickerOpen(false);
                    }}
                    disabled={{ after: dayjs().endOf("day").toDate() }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            ) : (
              <span>· {dayjs(date).format("DD/MM/YYYY")}</span>
            )}
            {!record && (
              <span className="text-[12.5px] font-normal text-muted-foreground">
                (log bù)
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-1">
          <div className="grid gap-3 sm:grid-cols-2">
            <TimeField label="Giờ đi ngủ" value={bedtime} onChange={setBedtime} />
            <TimeField label="Giờ thức dậy" value={wakeTime} onChange={setWakeTime} />
          </div>
          {nightMins != null && (
            <p className="text-[13px] text-muted-foreground">
              Ngủ được:{" "}
              <span className="font-semibold tabular-nums text-foreground">
                {formatDuration(nightMins)}
              </span>
            </p>
          )}

          <div className="space-y-2.5">
            <div className="text-[13px] text-muted-foreground">Dậy đêm</div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => appendWaking(dayjs().format("HH:mm"))}
            >
              <Plus className="size-4" />
              Dậy lúc này
            </Button>
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
            {!addingManual ? (
              <button
                type="button"
                onClick={() => setAddingManual(true)}
                className="text-[12.5px] font-semibold text-primary hover:underline"
              >
                ＋ Thêm giờ thủ công
              </button>
            ) : (
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
                    setAddingManual(false);
                  }}
                >
                  Thêm
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setAddingManual(false);
                    setManualTime(null);
                  }}
                >
                  Huỷ
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="text-[13px] text-muted-foreground">Trạng thái giấc ngủ</div>
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
            <Label htmlFor="sleep-note">Ghi chú</Label>
            <textarea
              id="sleep-note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Tuỳ chọn…"
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-body placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-3 rounded-xl border border-border p-3">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="nap-toggle" className="cursor-pointer text-[13px]">
                Ngủ trưa hôm nay?
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-[12.5px] text-muted-foreground">
                  {napEnabled ? "Có" : "Không"}
                </span>
                <Switch
                  id="nap-toggle"
                  checked={napEnabled}
                  onCheckedChange={setNapEnabled}
                />
              </div>
            </div>
            {napEnabled && (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <TimeField
                    label="Giờ bắt đầu"
                    value={napStart}
                    onChange={setNapStart}
                  />
                  <TimeField label="Giờ dậy" value={napEnd} onChange={setNapEnd} />
                </div>
                {napMins != null && (
                  <p className="text-[13px] text-muted-foreground">
                    Ngủ trưa:{" "}
                    <span className="font-semibold tabular-nums text-foreground">
                      {formatDuration(napMins)}
                    </span>
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <div>
            {record && onDelete && (
              confirmDelete ? (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    disabled={isDeleting}
                    onClick={() => onDelete(record.id)}
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
              )
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Huỷ
            </Button>
            <Button type="button" disabled={isSaving} onClick={handleSave}>
              {isSaving ? "Đang lưu…" : "Lưu"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
