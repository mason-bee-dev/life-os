import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { Moon, Pencil, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { TableCell } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NightSleepModal } from "./NightSleepModal";
import { SleepChart } from "./SleepChart";
import { SleepDateCell } from "./SleepDateCell";
import { SleepEvaluationBox } from "./SleepEvaluationBox";
import { evaluateNightSleep } from "./sleepEvaluation";
import {
  computeNightStats,
  formatDuration,
  nightDurationSeries,
  nightRecordsInPeriod,
  nightSleepDuration,
  periodBounds,
  periodDayCount,
} from "./sleepStats";
import { PERIOD_OPTIONS, qualityEmojis, qualityLabels } from "./types";
import type { NightSleepInput, Period, SleepRecord } from "./types";
import { DataTable } from "@/components/DataTable";
import { PeriodFilter } from "@/components/PeriodFilter";
import { StatsCards } from "@/components/StatsCards";

type Props = {
  period: Period;
  onPeriodChange: (p: Period) => void;
  records: SleepRecord[];
  refDate: string;
  todayKey: string;
  isSaving: boolean;
  isDeleting: boolean;
  getRecord: (date: string) => SleepRecord | undefined;
  onSave: (input: NightSleepInput, opts?: { onSuccess?: () => void; onError?: () => void }) => void;
  onClear: (record: SleepRecord, opts?: { onSuccess?: () => void; onError?: () => void }) => void;
};

const columns = [
  { key: "date", header: "Ngày" },
  { key: "range", header: "Giờ ngủ → dậy" },
  { key: "duration", header: "Thời lượng" },
  { key: "wakings", header: "Dậy đêm" },
  { key: "quality", header: "Chất lượng" },
  { key: "note", header: "Ghi chú" },
  { key: "actions", header: "Thao tác" },
];

export function NightSleepTab({
  period,
  onPeriodChange,
  records,
  refDate,
  todayKey,
  isSaving,
  isDeleting,
  getRecord,
  onSave,
  onClear,
}: Props) {
  const { notify } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editDate, setEditDate] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const nightRows = useMemo(() => {
    return [...nightRecordsInPeriod(records, period, refDate)].sort((a, b) =>
      b.date.localeCompare(a.date),
    );
  }, [records, period, refDate]);

  const bounds = periodBounds(refDate, period);
  const totalDays = periodDayCount(refDate, period);
  const stats = computeNightStats(nightRows, totalDays);
  const evaluation = useMemo(
    () => evaluateNightSleep(nightRows, totalDays, period),
    [nightRows, totalDays, period],
  );
  const chartData = useMemo(() => {
    if (period !== "week" && period !== "month") return null;
    return nightDurationSeries(nightRows, bounds.from, bounds.to, period);
  }, [nightRows, bounds.from, bounds.to, period]);

  const editRecord = editDate ? getRecord(editDate) : undefined;

  const openCreate = () => {
    setEditDate(null);
    setModalOpen(true);
  };

  const openEdit = (date: string) => {
    setEditDate(date);
    setModalOpen(true);
  };

  const handleSave = (input: NightSleepInput) => {
    const existing = getRecord(input.date);
    const isEdit = Boolean(editRecord?.bedtime && editRecord?.wakeTime);
    const conflict =
      !isEdit &&
      existing?.bedtime &&
      existing?.wakeTime &&
      existing.date === input.date;

    if (conflict) {
      const ok = window.confirm(
        `Ngày ${dayjs(input.date).format("DD/MM/YYYY")} đã có giấc ngủ đêm. Ghi đè?`,
      );
      if (!ok) return;
    }

    onSave(input, {
      onSuccess: () => {
        notify("Đã lưu giấc ngủ đêm");
        setModalOpen(false);
      },
      onError: () => notify("Không lưu được. Thử lại sau."),
    });
  };

  const handleClear = (record: SleepRecord) => {
    onClear(record, {
      onSuccess: () => {
        notify("Đã xoá giấc ngủ đêm");
        setModalOpen(false);
        setConfirmId(null);
      },
      onError: () => notify("Không xoá được. Thử lại sau."),
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PeriodFilter
          value={period}
          onChange={onPeriodChange}
          options={PERIOD_OPTIONS}
        />
        <Button type="button" onClick={openCreate}>
          <Plus className="size-4" />
          Thêm giấc ngủ
        </Button>
      </div>

      <div className="text-[13px] text-muted-foreground">
        {dayjs(bounds.from).format("DD/MM")} –{" "}
        {dayjs(bounds.to).format("DD/MM/YYYY")}
      </div>

      {evaluation ? (
        <SleepEvaluationBox
          evaluation={evaluation}
          title="Đánh giá giấc ngủ đêm"
        />
      ) : null}

      <StatsCards
        cards={[
          { label: "Ngủ đêm TB", value: stats.avgDurationLabel },
          { label: "Giờ ngủ / dậy TB", value: stats.avgBedWakeLabel },
          {
            label: "Dậy đêm TB",
            value: stats.avgWakingsLabel,
            sub: stats.typicalWakingLabel
              ? `Giờ TB: ${stats.typicalWakingLabel}`
              : null,
          },
          {
            label: "Ngủ sớm / muộn nhất",
            value: stats.bedtimeRangeLabel,
          },
          { label: "Đã ghi nhận", value: stats.loggedLabel },
        ]}
      />

      {chartData ? (
        <SleepChart
          title="Thời lượng ngủ đêm theo ngày"
          data={chartData}
          unit="hours"
          referenceValue={7}
          referenceLabel="7h"
          color="var(--metric-sleep)"
        />
      ) : null}

      <DataTable
        key={`night-${period}`}
        rows={nightRows}
        rowKey={(r) => r.id || r.date}
        columns={columns}
        empty={
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card py-12 text-center">
            <Moon className="size-8 text-faint opacity-50" strokeWidth={1.5} />
            <p className="text-[13px] text-muted-foreground">
              Chưa có dữ liệu giấc ngủ đêm trong kỳ này
            </p>
            <Button type="button" size="sm" onClick={openCreate}>
              <Plus className="size-3.5" />
              Thêm giấc ngủ
            </Button>
          </div>
        }
        renderRow={(r) => {
          const mins = nightSleepDuration(r);
          const confirming = confirmId === r.id;
          const note = r.note?.trim() ?? "";
          const truncated =
            note.length > 40 ? `${note.slice(0, 40)}…` : note || "—";
          return (
            <>
              <TableCell className="tabular-nums">
                <SleepDateCell date={r.date} todayKey={todayKey} />
              </TableCell>
              <TableCell className="tabular-nums text-muted-foreground">
                {r.bedtime} → {r.wakeTime}
              </TableCell>
              <TableCell className="tabular-nums">
                {mins != null ? formatDuration(mins) : "—"}
              </TableCell>
              <TableCell className="tabular-nums text-muted-foreground">
                {r.nightWakingTimes.length > 0 ? (
                  <span>
                    {r.nightWakingTimes.length} lần ·{" "}
                    {r.nightWakingTimes.join(", ")}
                  </span>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell>
                {r.quality ? (
                  <span>
                    {qualityEmojis[r.quality]} {qualityLabels[r.quality]}
                  </span>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell className="max-w-[12rem]">
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="block truncate">{truncated}</span>
                    </TooltipTrigger>
                    {note ? (
                      <TooltipContent className="max-w-xs">{note}</TooltipContent>
                    ) : null}
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
              <TableCell>
                {confirming ? (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      disabled={isDeleting}
                      onClick={() => handleClear(r)}
                    >
                      Xác nhận
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setConfirmId(null)}
                    >
                      Huỷ
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => openEdit(r.date)}
                    >
                      <Pencil className="size-3.5" />
                      Sửa
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setConfirmId(r.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                )}
              </TableCell>
            </>
          );
        }}
      />

      <NightSleepModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        record={editRecord}
        defaultDate={todayKey}
        isSaving={isSaving}
        isDeleting={isDeleting}
        onSave={handleSave}
        onDelete={
          editRecord?.bedtime && editRecord?.wakeTime
            ? () => handleClear(editRecord)
            : undefined
        }
      />
    </div>
  );
}
