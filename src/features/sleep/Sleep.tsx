import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { useToast } from "@/components/ui/toast";
import { SleepQuickLog } from "./SleepQuickLog";
import { SleepEntryDialog } from "./SleepEntryDialog";
import { SleepStatsCards } from "./SleepStatsCards";
import { SleepTrendChart } from "./SleepTrendChart";
import { SleepQualityBreakdown } from "./SleepQualityBreakdown";
import { SleepNightWakingChart } from "./SleepNightWakingChart";
import { SleepNapChart } from "./SleepNapChart";
import { SleepHistoryTable } from "./SleepHistoryTable";
import {
  periodBounds,
  previousPeriodBounds,
  recordsInPeriod,
} from "./stats";
import { useSleepRecords } from "./useSleepRecords";
import type { Period, SleepRecord } from "./types";

type Props = {
  date: Date;
  onDateChange: (d: Date) => void;
};

export function Sleep({ date, onDateChange }: Props) {
  const { notify } = useToast();
  const [period, setPeriod] = useState<Period>("week");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogDate, setDialogDate] = useState<string>(
    () => dayjs().format("YYYY-MM-DD"),
  );

  const refDate = dayjs(date).format("YYYY-MM-DD");
  const todayKey = dayjs().format("YYYY-MM-DD");

  useEffect(() => {
    onDateChange(dayjs().startOf("day").toDate());
  }, [onDateChange]);

  const fetchRange = useMemo(() => {
    const current = periodBounds(refDate, period);
    const prev = previousPeriodBounds(refDate, period);
    const from = [prev.from, current.from, todayKey, dialogDate].sort()[0];
    const candidatesTo = [current.to, todayKey, dialogDate].sort();
    const to = candidatesTo[candidatesTo.length - 1];
    return { from, to };
  }, [refDate, period, todayKey, dialogDate]);

  const {
    records,
    isLoading,
    error,
    isSaving,
    isDeleting,
    getRecord,
    saveRecord,
    deleteRecord,
  } = useSleepRecords(fetchRange);

  const currentRecords = useMemo(
    () => recordsInPeriod(records, period, refDate),
    [records, period, refDate],
  );

  const previousRecords = useMemo(() => {
    const prev = previousPeriodBounds(refDate, period);
    return records.filter((r) => r.date >= prev.from && r.date <= prev.to);
  }, [records, refDate, period]);

  const todayRecord = getRecord(todayKey);
  const dialogRecord = getRecord(dialogDate);
  const bounds = periodBounds(refDate, period);

  const openDialog = (isoDate: string) => {
    setDialogDate(isoDate);
    setDialogOpen(true);
  };

  const handleQuickSave = (patch: Partial<SleepRecord> & { date: string }) => {
    saveRecord(patch, {
      onSuccess: () => notify("Đã lưu giấc ngủ"),
      onError: () => notify("Không lưu được. Thử lại sau."),
    });
  };

  const handleDialogSave = (patch: Partial<SleepRecord> & { date: string }) => {
    saveRecord(patch, {
      onSuccess: () => {
        notify("Đã lưu giấc ngủ");
        setDialogOpen(false);
      },
      onError: () => notify("Không lưu được. Thử lại sau."),
    });
  };

  const handleDelete = (id: string) => {
    deleteRecord(id, {
      onSuccess: () => {
        notify("Đã xoá bản ghi");
        setDialogOpen(false);
      },
      onError: () => notify("Không xoá được. Thử lại sau."),
    });
  };

  return (
    <div className="mx-auto flex w-full flex-col gap-4 px-0 py-1 lg:px-0">
      <SleepQuickLog
        date={todayKey}
        record={todayRecord}
        isSaving={isSaving}
        period={period}
        onPeriodChange={setPeriod}
        onSave={handleQuickSave}
        onOpenDetail={() => openDialog(todayKey)}
        onBackfill={openDialog}
      />

      <div className="text-[13px] text-muted-foreground">
        Phân tích · {dayjs(bounds.from).format("DD/MM")} –{" "}
        {dayjs(bounds.to).format("DD/MM/YYYY")}
      </div>

      {isLoading && (
        <div className="text-[13px] text-muted-foreground">Đang tải…</div>
      )}
      {error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-[13px] text-destructive">
          Không tải được dữ liệu giấc ngủ. Kiểm tra bảng{" "}
          <code className="text-[12px]">sleep_records</code> trên Supabase.
        </div>
      )}

      <SleepStatsCards current={currentRecords} previous={previousRecords} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SleepTrendChart
          records={currentRecords}
          onLog={() => openDialog(todayKey)}
          className="lg:col-span-2"
        />
        <SleepQualityBreakdown
          records={currentRecords}
          onLog={() => openDialog(todayKey)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SleepNightWakingChart
          records={currentRecords}
          onLog={() => openDialog(todayKey)}
        />
        <SleepNapChart
          records={currentRecords}
          onLog={() => openDialog(todayKey)}
        />
      </div>

      <SleepHistoryTable
        records={currentRecords}
        onEdit={openDialog}
        onDelete={handleDelete}
        onLog={() => openDialog(todayKey)}
        isDeleting={isDeleting}
      />

      <SleepEntryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        date={dialogDate}
        onDateChange={setDialogDate}
        record={dialogRecord}
        isSaving={isSaving}
        isDeleting={isDeleting}
        onSave={handleDialogSave}
        onDelete={handleDelete}
      />
    </div>
  );
}
