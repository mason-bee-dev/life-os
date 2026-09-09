import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { PeriodFilter } from "@/components/PeriodFilter";
import { RelativeDateCell } from "@/components/RelativeDateCell";
import { StatsCards } from "@/components/StatsCards";
import { TableActionsCell } from "@/components/TableActionsCell";
import { Button } from "@/components/ui/button";
import { TableCell } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { HealthChart } from "./HealthChart";
import { WaterModal } from "./WaterModal";
import {
  avgWaterLiters,
  countWaterDays,
  periodBounds,
  periodDayCount,
  recordsInPeriod,
  sumWaterLiters,
  toFilledSeries,
} from "./stats";
import { PERIOD_OPTIONS, type Period } from "./types";
import { useDailyRecords } from "./useDailyRecords";

const WATER_GOAL_L = 2;

type WaterRow = {
  date: string;
  glasses: number;
  liters: number;
};

export function WaterTracker() {
  const { notify } = useToast();
  const { records, todayKey, getRecord, updateRecord, isSaving } =
    useDailyRecords();
  const glasses = getRecord(todayKey).waterGlasses ?? 0;
  const [period, setPeriod] = useState<Period>("week");
  const [modalOpen, setModalOpen] = useState(false);
  const [editDate, setEditDate] = useState<string | null>(null);
  const [confirmKey, setConfirmKey] = useState<string | null>(null);

  const bounds = periodBounds(todayKey, period);
  const totalDays = periodDayCount(todayKey, period);
  const list = recordsInPeriod(records, period, todayKey);
  const total = sumWaterLiters(list);
  const avg = avgWaterLiters(list);
  const daysLogged = countWaterDays(list);
  const todayL = glasses * 0.25;
  const goalPct =
    avg > 0 ? Math.min(100, Math.round((avg / WATER_GOAL_L) * 100)) : 0;

  const modalDate = editDate ?? todayKey;
  const modalGlasses = getRecord(modalDate).waterGlasses ?? 0;

  const chartData = useMemo(() => {
    if (period === "day") return null;
    return toFilledSeries(records, period, todayKey, (r) => {
      const g = r?.waterGlasses ?? 0;
      return { value: Math.round(g * 0.25 * 100) / 100, hasData: g > 0 };
    });
  }, [records, period, todayKey]);

  const rows: WaterRow[] = useMemo(
    () =>
      list
        .filter((r) => (r.waterGlasses ?? 0) > 0)
        .map((r) => ({
          date: r.date,
          glasses: r.waterGlasses ?? 0,
          liters: (r.waterGlasses ?? 0) * 0.25,
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
    glasses: next,
  }: {
    date: string;
    glasses: number;
  }) => {
    updateRecord(date, { waterGlasses: next });
    notify("Đã lưu uống nước");
    setModalOpen(false);
  };

  const handleClear = (date: string) => {
    updateRecord(date, { waterGlasses: 0 });
    notify("Đã xoá bản ghi nước");
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
          Ghi nhận
        </Button>
      </div>

      <div className="text-[13px] text-muted-foreground">
        {dayjs(bounds.from).format("DD/MM")} –{" "}
        {dayjs(bounds.to).format("DD/MM/YYYY")}
        <span className="ml-2 tabular-nums text-foreground">
          · Hôm nay {todayL.toFixed(2)} L
        </span>
      </div>

      <StatsCards
        cards={[
          { label: "Tổng", value: `${total.toFixed(2)} L` },
          {
            label: "TB / ngày có ghi",
            value: avg > 0 ? `${avg.toFixed(2)} L` : "—",
            sub: avg > 0 ? `~${goalPct}% mục tiêu` : null,
          },
          {
            label: "Đã ghi nhận",
            value: `${daysLogged} / ${totalDays} ngày`,
          },
        ]}
      />

      {chartData ? (
        <HealthChart
          title={
            period === "year" ? "Lít nước theo tháng" : "Lít nước theo ngày"
          }
          data={chartData}
          color="var(--metric-water)"
          unit="L"
          formatValue={(v) => `${v.toFixed(2)} L`}
        />
      ) : null}

      <DataTable
        key={`water-${period}`}
        rows={rows}
        rowKey={(r) => r.date}
        columns={[
          { key: "date", header: "Ngày" },
          { key: "glasses", header: "Số ly" },
          { key: "liters", header: "Thể tích" },
          { key: "actions", header: "Thao tác" },
        ]}
        empty={
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card py-12 text-center">
            <p className="text-[13px] text-muted-foreground">
              Chưa có dữ liệu uống nước trong kỳ này
            </p>
            <Button type="button" size="sm" onClick={openCreate}>
              <Plus className="size-3.5" />
              Ghi nhận
            </Button>
          </div>
        }
        renderRow={(r) => (
          <>
            <TableCell className="tabular-nums">
              <RelativeDateCell date={r.date} todayKey={todayKey} />
            </TableCell>
            <TableCell className="tabular-nums">{r.glasses}</TableCell>
            <TableCell className="tabular-nums">
              {r.liters.toFixed(2)} L
            </TableCell>
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

      <WaterModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        defaultDate={modalDate}
        initialGlasses={modalGlasses}
        isSaving={isSaving}
        onSave={handleSave}
      />
    </div>
  );
}
