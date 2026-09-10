import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { NoteCell } from "@/components/NoteCell";
import { PeriodFilter } from "@/components/PeriodFilter";
import { RelativeDateCell } from "@/components/RelativeDateCell";
import { StatsCards } from "@/components/StatsCards";
import { TableActionsCell } from "@/components/TableActionsCell";
import { Button } from "@/components/ui/button";
import { TableCell } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { HealthChart } from "./HealthChart";
import { WpModal } from "./WpModal";
import {
  calcCleanStreak,
  periodBounds,
  periodDayCount,
  recordsInPeriod,
  sumMasturbation,
  toFilledSeries,
} from "./stats";
import { PERIOD_OPTIONS, type Period } from "./types";
import { useDailyRecords } from "./useDailyRecords";

type WpRow = {
  date: string;
  wp: number;
  note: string | null;
};

export function PersonalHabits() {
  const { notify } = useToast();
  const { records, todayKey, getRecord, updateRecord, isSaving } =
    useDailyRecords();
  const todayCount = getRecord(todayKey).masturbationCount ?? 0;

  const [period, setPeriod] = useState<Period>("week");
  const [modalOpen, setModalOpen] = useState(false);
  const [editDate, setEditDate] = useState<string | null>(null);
  const [confirmKey, setConfirmKey] = useState<string | null>(null);

  const bounds = periodBounds(todayKey, period);
  const totalDays = periodDayCount(todayKey, period);
  const list = recordsInPeriod(records, period, todayKey);
  const totalWp = sumMasturbation(list);
  const streak = calcCleanStreak(records, todayKey);
  const daysWithActivity = list.filter(
    (r) => (r.masturbationCount ?? 0) > 0,
  ).length;

  const modalDate = editDate ?? todayKey;
  const modalCount = getRecord(modalDate).masturbationCount ?? 0;
  const modalNote = getRecord(modalDate).wpNote ?? "";

  const chartData = useMemo(() => {
    if (period === "day") return null;
    return toFilledSeries(records, period, todayKey, (r) => {
      const n = r?.masturbationCount ?? 0;
      return { value: n, hasData: n > 0 };
    });
  }, [records, period, todayKey]);

  const rows: WpRow[] = useMemo(
    () =>
      list
        .filter((r) => (r.masturbationCount ?? 0) > 0)
        .map((r) => ({
          date: r.date,
          wp: r.masturbationCount ?? 0,
          note: r.wpNote ?? null,
        }))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [list],
  );

  const openCreate = () => {
    setEditDate(null);
    setModalOpen(true);
  };

  const openEdit = (date: string) => {
    setEditDate(date);
    setModalOpen(true);
  };

  const handleSave = ({
    date,
    count,
    note,
  }: {
    date: string;
    count: number;
    note: string;
  }) => {
    updateRecord(date, {
      masturbationCount: count,
      wpNote: note || null,
    });
    notify("Đã lưu WP");
    setModalOpen(false);
  };

  const handleClear = (date: string) => {
    updateRecord(date, { masturbationCount: 0, wpNote: null });
    notify("Đã xoá WP");
    setConfirmKey(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PeriodFilter
          value={period}
          onChange={setPeriod}
          options={PERIOD_OPTIONS}
        />
        <Button type="button" onClick={openCreate}>
          <Plus className="size-4" />
          Ghi nhận WP
        </Button>
      </div>

      <div className="text-[13px] text-muted-foreground">
        {dayjs(bounds.from).format("DD/MM")} –{" "}
        {dayjs(bounds.to).format("DD/MM/YYYY")}
        <span className="ml-2 tabular-nums text-foreground">
          · Hôm nay {todayCount} lần
        </span>
      </div>

      <StatsCards
        cards={[
          { label: "Tổng WP", value: String(totalWp) },
          {
            label: "Streak",
            value: `${streak}`,
          },
          {
            label: "Có hoạt động",
            value: `${daysWithActivity} / ${totalDays} ngày`,
          },
        ]}
      />

      {chartData ? (
        <HealthChart
          title={period === "year" ? "WP theo tháng" : "WP theo ngày"}
          data={chartData}
          color="var(--muted-foreground)"
          unit="lần"
          yAllowDecimals={false}
        />
      ) : null}

      <DataTable
        key={`wp-${period}`}
        rows={rows}
        rowKey={(r) => r.date}
        columns={[
          { key: "date", header: "Ngày" },
          { key: "wp", header: "WP" },
          { key: "note", header: "Ghi chú" },
          { key: "actions", header: "Thao tác" },
        ]}
        empty={
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card py-12 text-center">
            <p className="text-[13px] text-muted-foreground">
              Không có WP trong kỳ này
            </p>
            <Button type="button" size="sm" onClick={openCreate}>
              <Plus className="size-3.5" />
              Ghi nhận WP
            </Button>
          </div>
        }
        renderRow={(r) => (
          <>
            <TableCell className="tabular-nums">
              <RelativeDateCell date={r.date} todayKey={todayKey} />
            </TableCell>
            <TableCell className="tabular-nums">{r.wp}</TableCell>
            <NoteCell note={r.note} />
            <TableActionsCell
              confirming={confirmKey === r.date}
              onEdit={() => openEdit(r.date)}
              onAskDelete={() => setConfirmKey(r.date)}
              onConfirmDelete={() => handleClear(r.date)}
              onCancelDelete={() => setConfirmKey(null)}
            />
          </>
        )}
      />

      <WpModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        defaultDate={modalDate}
        initialCount={modalCount}
        initialNote={modalNote}
        isSaving={isSaving}
        onSave={handleSave}
      />
    </div>
  );
}
