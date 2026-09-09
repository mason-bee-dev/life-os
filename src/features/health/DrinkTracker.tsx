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
import { DrinkModal } from "./DrinkModal";
import { HealthChart } from "./HealthChart";
import {
  countCoffeeDays,
  drinkDetailLines,
  drinksOf,
  mostCommonCoffeeType,
  periodBounds,
  periodDayCount,
  periodMoneyLabel,
  recordsInPeriod,
  sumCoffeeCups,
  sumDrinkAmount,
  toFilledSeries,
} from "./stats";
import {
  DRINK_CATEGORY_LABELS,
  PERIOD_OPTIONS,
  drinkTableLabel,
  formatVnd,
  type DrinkLog,
  type Period,
} from "./types";
import { useDailyRecords } from "./useDailyRecords";

type DrinkRow = DrinkLog & { date: string };

export function DrinkTracker() {
  const { notify } = useToast();
  const { records, todayKey, getRecord, updateRecord, isSaving } =
    useDailyRecords();
  const [period, setPeriod] = useState<Period>("week");
  const [modalOpen, setModalOpen] = useState(false);
  const [editRow, setEditRow] = useState<DrinkRow | null>(null);
  const [confirmKey, setConfirmKey] = useState<string | null>(null);

  const bounds = periodBounds(todayKey, period);
  const totalDays = periodDayCount(todayKey, period);
  const list = recordsInPeriod(records, period, todayKey);
  const totalCups = sumCoffeeCups(list);
  const totalAmount = sumDrinkAmount(list);
  const topType = mostCommonCoffeeType(list);
  const daysLogged = countCoffeeDays(list);
  const avgCups = daysLogged > 0 ? totalCups / daysLogged : 0;

  const chartData = useMemo(() => {
    if (period === "day") return null;
    return toFilledSeries(records, period, todayKey, (r) => {
      const drinks = r ? drinksOf(r) : [];
      const n = drinks.reduce((s, c) => s + c.cups, 0);
      return {
        value: n,
        hasData: n > 0,
        details: n > 0 ? drinkDetailLines(drinks) : undefined,
      };
    });
  }, [records, period, todayKey]);

  const rows: DrinkRow[] = useMemo(
    () =>
      list
        .flatMap((r) =>
          drinksOf(r).map((c) => ({
            ...c,
            date: r.date,
          })),
        )
        .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id),
    [list],
  );

  const openCreate = () => {
    setEditRow(null);
    setModalOpen(true);
  };

  const openEdit = (row: DrinkRow) => {
    setEditRow(row);
    setModalOpen(true);
  };

  const handleSave = (input: {
    date: string;
    category: DrinkLog["category"];
    type: string;
    customType?: string;
    cups: number;
    amount: number;
    note: string;
  }) => {
    const existing = drinksOf(getRecord(input.date));
    let next: DrinkLog[];

    if (editRow) {
      next = existing.map((d) =>
        d.id === editRow.id
          ? {
              ...d,
              category: input.category,
              type: input.type,
              customType: input.customType,
              cups: input.cups,
              amount: input.amount,
              note: input.note || null,
            }
          : d,
      );
    } else {
      next = [
        ...existing,
        {
          id: Date.now(),
          category: input.category,
          type: input.type,
          customType: input.customType,
          cups: input.cups,
          amount: input.amount,
          note: input.note || null,
        },
      ];
    }

    updateRecord(input.date, { drinks: next });
    notify(editRow ? "Đã cập nhật đồ uống" : "Đã thêm đồ uống");
    setModalOpen(false);
  };

  const removeLog = (date: string, id: number) => {
    const next = drinksOf(getRecord(date)).filter((c) => c.id !== id);
    updateRecord(date, { drinks: next });
    notify("Đã xoá đồ uống");
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
          Thêm đồ uống
        </Button>
      </div>

      <div className="text-[13px] text-muted-foreground">
        {dayjs(bounds.from).format("DD/MM")} –{" "}
        {dayjs(bounds.to).format("DD/MM/YYYY")}
      </div>

      <StatsCards
        cards={[
          { label: "Tổng cốc", value: String(totalCups) },
          {
            label: periodMoneyLabel(period),
            value: totalAmount > 0 ? formatVnd(totalAmount) : "—",
          },
          {
            label: "TB / ngày có ghi",
            value: daysLogged > 0 ? avgCups.toFixed(1) : "—",
          },
          {
            label: "Hay uống nhất",
            value: topType ?? "—",
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
            period === "year" ? "Số cốc theo tháng" : "Số cốc theo ngày"
          }
          data={chartData}
          color="var(--metric-productivity)"
          unit="cốc"
          yAllowDecimals={false}
        />
      ) : null}

      <DataTable
        key={`drinks-${period}`}
        rows={rows}
        rowKey={(r) => `${r.date}-${r.id}`}
        columns={[
          { key: "date", header: "Ngày" },
          { key: "category", header: "Nhóm" },
          { key: "type", header: "Loại" },
          { key: "cups", header: "Cốc" },
          { key: "note", header: "Ghi chú" },
          { key: "actions", header: "Thao tác" },
        ]}
        empty={
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card py-12 text-center">
            <p className="text-[13px] text-muted-foreground">
              Chưa có đồ uống trong kỳ này
            </p>
            <Button type="button" size="sm" onClick={openCreate}>
              <Plus className="size-3.5" />
              Thêm đồ uống
            </Button>
          </div>
        }
        renderRow={(r) => (
          <>
            <TableCell className="whitespace-nowrap tabular-nums">
              <RelativeDateCell date={r.date} todayKey={todayKey} />
            </TableCell>
            <TableCell className="whitespace-nowrap text-muted-foreground">
              {DRINK_CATEGORY_LABELS[r.category]}
            </TableCell>
            <TableCell className="max-w-[11rem] sm:max-w-[16rem]">
              <span className="line-clamp-2">{drinkTableLabel(r)}</span>
            </TableCell>
            <TableCell className="tabular-nums">{r.cups}</TableCell>
            <NoteCell note={r.note} />
            <TableActionsCell
              confirming={confirmKey === `${r.date}-${r.id}`}
              onEdit={() => openEdit(r)}
              onAskDelete={() => setConfirmKey(`${r.date}-${r.id}`)}
              onConfirmDelete={() => removeLog(r.date, r.id)}
              onCancelDelete={() => setConfirmKey(null)}
            />
          </>
        )}
      />

      <DrinkModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        defaultDate={editRow?.date ?? todayKey}
        editLog={editRow}
        isSaving={isSaving}
        onSave={handleSave}
      />
    </div>
  );
}
