import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { CalendarIcon, Plus } from "lucide-react";
import { TimeField } from "@/components/TimeField";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PeriodTabs } from "@/features/health/PeriodTabs";
import type { Period as HealthPeriod } from "@/features/health/types";
import type { Period, SleepQuality, SleepRecord } from "./types";
import { qualityEmojis } from "./types";

const qualities: SleepQuality[] = ["kho_ngu", "binh_thuong", "ngu_ngon"];

type Props = {
  record?: SleepRecord;
  date: string;
  isSaving: boolean;
  period: Period;
  onPeriodChange: (p: Period) => void;
  onSave: (patch: Partial<SleepRecord> & { date: string }) => void;
  onOpenDetail: () => void;
  /** Chọn ngày thức dậy trong quá khứ → mở form log bù / sửa. */
  onBackfill: (isoDate: string) => void;
};

export function SleepQuickLog({
  record,
  date,
  isSaving,
  period,
  onPeriodChange,
  onSave,
  onOpenDetail,
  onBackfill,
}: Props) {
  const [bedtime, setBedtime] = useState<string | null>(record?.bedtime ?? null);
  const [wakeTime, setWakeTime] = useState<string | null>(record?.wakeTime ?? null);
  const [quality, setQuality] = useState<SleepQuality | null>(record?.quality ?? null);
  const [backfillOpen, setBackfillOpen] = useState(false);

  useEffect(() => {
    setBedtime(record?.bedtime ?? null);
    setWakeTime(record?.wakeTime ?? null);
    setQuality(record?.quality ?? null);
  }, [date, record?.id, record?.bedtime, record?.wakeTime, record?.quality]);

  const handleQuickSave = () => {
    onSave({
      date,
      bedtime,
      wakeTime,
      quality,
      nightWakingTimes: record?.nightWakingTimes ?? [],
      note: record?.note ?? null,
      napStart: record?.napStart ?? null,
      napEnd: record?.napEnd ?? null,
    });
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4 lg:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
          <div className="shrink-0 pb-1 text-[13px] font-semibold text-muted-foreground lg:pb-2">
            Đêm qua
          </div>

          <TimeField
            label="Giờ đi ngủ"
            value={bedtime}
            onChange={setBedtime}
            className="w-full sm:w-40"
          />
          <TimeField
            label="Giờ thức dậy"
            value={wakeTime}
            onChange={setWakeTime}
            className="w-full sm:w-40"
          />

          <div className="space-y-1.5">
            <div className="text-[12.5px] text-muted-foreground">Chất lượng</div>
            <div className="flex gap-1.5">
              {qualities.map((q) => (
                <button
                  key={q}
                  type="button"
                  title={q}
                  onClick={() => setQuality(q)}
                  className={
                    "grid h-9 w-9 place-items-center rounded-lg border text-base transition-colors " +
                    (quality === q
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border text-muted-foreground hover:border-primary")
                  }
                >
                  {qualityEmojis[q]}
                </button>
              ))}
            </div>
          </div>

          <Button
            type="button"
            className="lg:mb-0.5"
            disabled={isSaving || (!bedtime && !wakeTime && !quality)}
            onClick={handleQuickSave}
          >
            {isSaving ? "Đang lưu…" : "Lưu nhanh"}
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2 xl:shrink-0">
          <Popover open={backfillOpen} onOpenChange={setBackfillOpen}>
            <PopoverTrigger asChild>
              <Button type="button" variant="outline">
                <CalendarIcon className="size-4" />
                Log bù
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="border-b border-border px-3 py-2 text-[12.5px] text-muted-foreground">
                Chọn ngày thức dậy để ghi / sửa
              </div>
              <Calendar
                mode="single"
                onSelect={(d) => {
                  if (!d) return;
                  onBackfill(dayjs(d).format("YYYY-MM-DD"));
                  setBackfillOpen(false);
                }}
                disabled={{ after: dayjs().endOf("day").toDate() }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button type="button" variant="outline" onClick={onOpenDetail}>
            <Plus className="size-4" />
            Ghi chi tiết
          </Button>
          <PeriodTabs
            value={period as HealthPeriod}
            onChange={(p) => onPeriodChange(p as Period)}
          />
        </div>
      </div>
    </div>
  );
}
