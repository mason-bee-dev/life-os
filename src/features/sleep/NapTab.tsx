import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { Pencil, Plus, Sun, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { TableCell } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NapModal } from "./NapModal";
import { SleepDataTable } from "./SleepDataTable";
import { SleepPeriodFilter } from "./SleepPeriodFilter";
import { SleepStatsCards } from "./SleepStatsCards";
import {
  computeNapStats,
  formatMinutesOnly,
  napDuration,
  napRecordsInPeriod,
  periodBounds,
  periodDayCount,
} from "./sleepStats";
import type { NapInput, Period, SleepRecord } from "./types";

type Props = {
  period: Period;
  onPeriodChange: (p: Period) => void;
  records: SleepRecord[];
  refDate: string;
  todayKey: string;
  isSaving: boolean;
  isDeleting: boolean;
  getRecord: (date: string) => SleepRecord | undefined;
  onSave: (input: NapInput, opts?: { onSuccess?: () => void; onError?: () => void }) => void;
  onClear: (record: SleepRecord, opts?: { onSuccess?: () => void; onError?: () => void }) => void;
};

const columns = [
  { key: "date", header: "Ngày" },
  { key: "range", header: "Giờ bắt đầu → dậy" },
  { key: "duration", header: "Thời lượng" },
  { key: "note", header: "Ghi chú" },
  { key: "actions", header: "Thao tác" },
];

export function NapTab({
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

  const napRows = useMemo(() => {
    return [...napRecordsInPeriod(records, period, refDate)].sort((a, b) =>
      b.date.localeCompare(a.date),
    );
  }, [records, period, refDate]);

  const bounds = periodBounds(refDate, period);
  const totalDays = periodDayCount(refDate, period);
  const stats = computeNapStats(napRows, totalDays);

  const editRecord = editDate ? getRecord(editDate) : undefined;

  const openCreate = () => {
    setEditDate(null);
    setModalOpen(true);
  };

  const openEdit = (date: string) => {
    setEditDate(date);
    setModalOpen(true);
  };

  const handleSave = (input: NapInput) => {
    const existing = getRecord(input.date);
    const isEdit = Boolean(editRecord?.napStart && editRecord?.napEnd);
    const conflict =
      !isEdit &&
      existing?.napStart &&
      existing?.napEnd &&
      existing.date === input.date;

    if (conflict) {
      const ok = window.confirm(
        `Ngày ${dayjs(input.date).format("DD/MM/YYYY")} đã có giấc ngủ trưa. Ghi đè?`,
      );
      if (!ok) return;
    }

    onSave(input, {
      onSuccess: () => {
        notify("Đã lưu giấc ngủ trưa");
        setModalOpen(false);
      },
      onError: () => notify("Không lưu được. Thử lại sau."),
    });
  };

  const handleClear = (record: SleepRecord) => {
    onClear(record, {
      onSuccess: () => {
        notify("Đã xoá giấc ngủ trưa");
        setModalOpen(false);
        setConfirmId(null);
      },
      onError: () => notify("Không xoá được. Thử lại sau."),
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SleepPeriodFilter value={period} onChange={onPeriodChange} />
        <Button type="button" onClick={openCreate}>
          <Plus className="size-4" />
          Thêm giấc ngủ
        </Button>
      </div>

      <div className="text-[13px] text-muted-foreground">
        {dayjs(bounds.from).format("DD/MM")} –{" "}
        {dayjs(bounds.to).format("DD/MM/YYYY")}
      </div>

      <SleepStatsCards
        cards={[
          { label: "Ngủ trưa TB", value: stats.avgDurationLabel },
          { label: "Tỷ lệ ngủ trưa", value: stats.frequencyLabel },
          { label: "Giờ bắt đầu TB", value: stats.avgStartLabel },
          { label: "Đã ghi nhận", value: stats.loggedLabel },
        ]}
      />

      <SleepDataTable
        key={`nap-${period}`}
        rows={napRows}
        rowKey={(r) => r.id || r.date}
        columns={columns}
        empty={
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card py-12 text-center">
            <Sun className="size-8 text-faint opacity-50" strokeWidth={1.5} />
            <p className="text-[13px] text-muted-foreground">
              Chưa có dữ liệu giấc ngủ trưa trong kỳ này
            </p>
            <Button type="button" size="sm" onClick={openCreate}>
              <Plus className="size-3.5" />
              Thêm giấc ngủ
            </Button>
          </div>
        }
        renderRow={(r) => {
          const mins = napDuration(r);
          const confirming = confirmId === r.id;
          const note = r.note?.trim() ?? "";
          const truncated =
            note.length > 40 ? `${note.slice(0, 40)}…` : note || "—";
          return (
            <>
              <TableCell className="tabular-nums">
                {dayjs(r.date).format("DD/MM/YYYY")}
              </TableCell>
              <TableCell className="tabular-nums text-muted-foreground">
                {r.napStart} → {r.napEnd}
              </TableCell>
              <TableCell className="tabular-nums">
                {mins != null ? formatMinutesOnly(mins) : "—"}
              </TableCell>
              <TableCell className="max-w-[14rem]">
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

      <NapModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        record={editRecord}
        defaultDate={todayKey}
        isSaving={isSaving}
        isDeleting={isDeleting}
        onSave={handleSave}
        onDelete={
          editRecord?.napStart && editRecord?.napEnd
            ? () => handleClear(editRecord)
            : undefined
        }
      />
    </div>
  );
}
