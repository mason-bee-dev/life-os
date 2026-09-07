import { useEffect, useState } from "react";
import { TimeField } from "@/components/TimeField";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { durationMinutes, formatDuration } from "./stats";
import type { SleepRecord } from "./types";

type Props = {
  date: string;
  record?: SleepRecord;
  isSaving: boolean;
  onSave: (patch: Partial<SleepRecord> & { date: string }) => void;
};

export function NapForm({ date, record, isSaving, onSave }: Props) {
  const [enabled, setEnabled] = useState(true);
  const [napStart, setNapStart] = useState<string | null>(record?.napStart ?? null);
  const [napEnd, setNapEnd] = useState<string | null>(record?.napEnd ?? null);

  useEffect(() => {
    if (record) {
      const on = Boolean(record.napStart || record.napEnd);
      setEnabled(on);
      setNapStart(record.napStart ?? null);
      setNapEnd(record.napEnd ?? null);
    } else {
      setEnabled(true);
      setNapStart(null);
      setNapEnd(null);
    }
  }, [date, record?.id, record?.napStart, record?.napEnd]);

  const liveMins =
    enabled && napStart && napEnd ? durationMinutes(napStart, napEnd) : null;

  const handleSave = () => {
    onSave({
      date,
      bedtime: record?.bedtime ?? null,
      wakeTime: record?.wakeTime ?? null,
      nightWakingTimes: record?.nightWakingTimes ?? [],
      quality: record?.quality ?? null,
      note: record?.note ?? null,
      napStart: enabled ? napStart : null,
      napEnd: enabled ? napEnd : null,
    });
  };

  return (
    <div className="max-w-3xl space-y-4">
      <div className="text-heading tracking-tight">Ngủ trưa</div>

      <div className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2.5">
        <Label htmlFor="nap-toggle" className="cursor-pointer text-[13px]">
          Ngủ trưa hôm nay?
        </Label>
        <div className="flex items-center gap-2">
          <span className="text-[12.5px] text-muted-foreground">
            {enabled ? "Có" : "Không"}
          </span>
          <Switch
            id="nap-toggle"
            checked={enabled}
            onCheckedChange={setEnabled}
          />
        </div>
      </div>

      {enabled && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <TimeField
              label="Giờ bắt đầu"
              value={napStart}
              onChange={setNapStart}
            />
            <TimeField label="Giờ dậy" value={napEnd} onChange={setNapEnd} />
          </div>
          {liveMins != null && (
            <p className="text-[13px] text-muted-foreground">
              Ngủ trưa:{" "}
              <span className="font-semibold text-foreground">
                {formatDuration(liveMins)}
              </span>
            </p>
          )}
        </>
      )}

      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? "Đang lưu…" : "Lưu"}
      </Button>
    </div>
  );
}
