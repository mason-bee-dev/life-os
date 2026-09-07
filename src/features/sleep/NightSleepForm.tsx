import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Plus, X } from "lucide-react";
import { TimeField } from "@/components/TimeField";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
  date: string;
  record?: SleepRecord;
  isSaving: boolean;
  onSave: (patch: Partial<SleepRecord> & { date: string }) => void;
};

export function NightSleepForm({ date, record, isSaving, onSave }: Props) {
  const [bedtime, setBedtime] = useState<string | null>(record?.bedtime ?? null);
  const [wakeTime, setWakeTime] = useState<string | null>(record?.wakeTime ?? null);
  const [nightWakingTimes, setNightWakingTimes] = useState<string[]>(
    record?.nightWakingTimes ?? [],
  );
  const [quality, setQuality] = useState<SleepQuality | null>(record?.quality ?? null);
  const [note, setNote] = useState(record?.note ?? "");
  const [addingManual, setAddingManual] = useState(false);
  const [manualTime, setManualTime] = useState<string | null>(null);

  useEffect(() => {
    setBedtime(record?.bedtime ?? null);
    setWakeTime(record?.wakeTime ?? null);
    setNightWakingTimes(record?.nightWakingTimes ?? []);
    setQuality(record?.quality ?? null);
    setNote(record?.note ?? "");
    setAddingManual(false);
    setManualTime(null);
  }, [
    date,
    record?.id,
    record?.bedtime,
    record?.wakeTime,
    record?.nightWakingTimes,
    record?.quality,
    record?.note,
  ]);

  const sortedWakings = useMemo(
    () => sortTimesAsc(nightWakingTimes),
    [nightWakingTimes],
  );

  const liveMins =
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
    onSave({
      date,
      bedtime,
      wakeTime,
      nightWakingTimes,
      quality,
      note: note.trim() || null,
      napStart: record?.napStart ?? null,
      napEnd: record?.napEnd ?? null,
    });
  };

  return (
    <div className="max-w-3xl space-y-4">
      <div className="text-heading tracking-tight">Đêm qua</div>

      <div className="grid gap-3 sm:grid-cols-2">
        <TimeField label="Giờ đi ngủ" value={bedtime} onChange={setBedtime} />
        <TimeField label="Giờ thức dậy" value={wakeTime} onChange={setWakeTime} />
      </div>

      {liveMins != null && (
        <p className="text-[13px] text-muted-foreground">
          Ngủ được:{" "}
          <span className="font-semibold text-foreground">
            {formatDuration(liveMins)}
          </span>
        </p>
      )}

      <div className="space-y-2.5">
        <div className="text-[13px] text-muted-foreground">Dậy đêm</div>
        <Button
          type="button"
          variant="secondary"
          className="w-full sm:w-auto"
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
                className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/40 px-2.5 py-1 text-[13px]"
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
          <span className="text-foreground">{nightWakingTimes.length}</span>
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
          {qualities.map((q) => {
            const selected = quality === q;
            return (
              <button
                key={q}
                type="button"
                onClick={() => setQuality(q)}
                className={
                  "rounded-lg border px-3 py-2 text-[13px] font-semibold transition-colors " +
                  (selected
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary hover:text-primary")
                }
              >
                {qualityEmojis[q]} {qualityLabels[q]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="sleepNote">Ghi chú</Label>
        <textarea
          id="sleepNote"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Tuỳ chọn…"
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-body placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? "Đang lưu…" : "Lưu"}
      </Button>
    </div>
  );
}
