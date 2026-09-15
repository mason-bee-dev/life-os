import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { Briefcase, Plus } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { NoteCell } from "@/components/NoteCell";
import { PeriodFilter } from "@/components/PeriodFilter";
import { RelativeDateCell } from "@/components/RelativeDateCell";
import { StatsCards, type StatCard } from "@/components/StatsCards";
import { TableActionsCell } from "@/components/TableActionsCell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { WorkChart } from "./WorkChart";
import { WorkLogModal } from "./WorkLogModal";
import { useWorkData } from "./useWorkData";
import { buildWorkObservations } from "./workObservations";
import {
  aggregateWork,
  formatHours,
  formatHoursPlain,
  periodBounds,
  shiftRefDate,
  type WorkAggregate,
} from "./workStats";
import {
  CATEGORY_FILTER_OPTIONS,
  CATEGORY_LABEL,
  PERIOD_OPTIONS,
  type CategoryFilter,
  type Period,
  type WorkLog,
  type WorkLogInput,
} from "./types";

const columns = [
  { key: "date", header: "Ngày" },
  { key: "category", header: "Loại" },
  { key: "project", header: "Project" },
  { key: "hours", header: "Giờ" },
  { key: "note", header: "Ghi chú" },
  { key: "actions", header: "Thao tác" },
];

type StatDef = {
  id: string;
  label: string;
  getValue: (agg: WorkAggregate) => string;
  getSub?: (agg: WorkAggregate) => string | null;
  include?: (agg: WorkAggregate) => boolean;
};

const STAT_DEFS: StatDef[] = [
  {
    id: "workDayCount",
    label: "Ngày làm việc",
    getValue: (agg) =>
      agg.workDayCount > 0 ? String(agg.workDayCount) : "—",
  },
  {
    id: "loadDistribution",
    label: "Phân bổ ngày",
    getValue: (agg) => {
      const { full, half, empty } = agg.loadDistribution;
      if (full + half + empty === 0) return "—";
      return `${full} · ${half} · ${empty}`;
    },
    getSub: () => "cả ngày · nửa ngày · trống",
  },
  {
    id: "companyHours",
    label: "Giờ công ty",
    getValue: (agg) =>
      agg.companyHours > 0 ? formatHours(agg.companyHours) : "—",
  },
  {
    id: "personalHours",
    label: "Giờ cá nhân",
    getValue: (agg) =>
      agg.personalHours > 0 ? formatHours(agg.personalHours) : "—",
  },
  {
    id: "freeBudget",
    label: "Quỹ rảnh",
    include: (agg) => agg.freeBudget != null,
    getValue: (agg) =>
      agg.freeBudget
        ? `${formatHoursPlain(agg.freeBudget.invested)}h đã dùng`
        : "—",
    getSub: (agg) =>
      agg.freeBudget
        ? `còn ${formatHoursPlain(agg.freeBudget.unused)}h chưa dùng`
        : null,
  },
];

function buildStatCards(agg: WorkAggregate): StatCard[] {
  return STAT_DEFS.filter((d) => d.include?.(agg) ?? true).map((d) => ({
    label: d.label,
    value: d.getValue(agg),
    sub: d.getSub?.(agg) ?? null,
  }));
}

export function Work() {
  const { notify } = useToast();
  const [period, setPeriod] = useState<Period>("week");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editLog, setEditLog] = useState<WorkLog | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const {
    days,
    logs,
    isLoading,
    error,
    isSaving,
    isDeleting,
    todayKey,
    refDate,
    saveLog,
    deleteLog,
  } = useWorkData({ work: period });

  const bounds = periodBounds(refDate, period);

  const prevAgg = useMemo(() => {
    const prevRef = shiftRefDate(refDate, period, -1);
    const prevBounds = periodBounds(prevRef, period);
    const prevDays = days.filter(
      (d) => d.date >= prevBounds.from && d.date <= prevBounds.to,
    );
    const prevLogs = logs.filter(
      (l) => l.date >= prevBounds.from && l.date <= prevBounds.to,
    );
    return aggregateWork(prevDays, prevLogs, period, prevRef);
  }, [days, logs, period, refDate]);

  const agg = useMemo(() => {
    const periodDays = days.filter(
      (d) => d.date >= bounds.from && d.date <= bounds.to,
    );
    const periodLogs = logs.filter(
      (l) => l.date >= bounds.from && l.date <= bounds.to,
    );
    return aggregateWork(periodDays, periodLogs, period, refDate, prevAgg);
  }, [days, logs, bounds.from, bounds.to, period, refDate, prevAgg]);

  const observations = useMemo(() => buildWorkObservations(agg), [agg]);
  const cards = useMemo(() => buildStatCards(agg), [agg]);

  const tableRows = useMemo(() => {
    return logs
      .filter((l) => l.date >= bounds.from && l.date <= bounds.to)
      .filter((l) => (category === "all" ? true : l.category === category))
      .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  }, [logs, bounds.from, bounds.to, category]);

  const knownProjects = useMemo(
    () => [...new Set(logs.map((l) => l.project).filter(Boolean))],
    [logs],
  );

  const openCreate = () => {
    setEditLog(null);
    setModalOpen(true);
  };

  const openEdit = (log: WorkLog) => {
    setEditLog(log);
    setModalOpen(true);
  };

  const handleSave = (input: WorkLogInput) => {
    saveLog(input, {
      onSuccess: () => {
        notify(editLog ? "Đã cập nhật log" : "Đã thêm log");
        setModalOpen(false);
        setEditLog(null);
      },
      onError: () => notify("Không lưu được. Thử lại sau."),
    });
  };

  const handleDelete = (id: string) => {
    deleteLog(id, {
      onSuccess: () => {
        notify("Đã xoá log");
        setConfirmId(null);
      },
      onError: () => notify("Không xoá được. Thử lại sau."),
    });
  };

  return (
    <div className="mx-auto flex w-full flex-col gap-4 px-0 py-1">
      {isLoading && (
        <div className="text-[13px] text-muted-foreground">Đang tải…</div>
      )}
      {error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-[13px] text-destructive">
          Không tải được dữ liệu công việc. Kiểm tra bảng{" "}
          <code className="text-[12px]">work_days</code> /{" "}
          <code className="text-[12px]">work_logs</code> trên Supabase.
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <PeriodFilter
              value={period}
              onChange={setPeriod}
              options={PERIOD_OPTIONS}
            />
            <PeriodFilter
              value={category}
              onChange={setCategory}
              options={CATEGORY_FILTER_OPTIONS}
            />
          </div>
          <Button type="button" onClick={openCreate}>
            <Plus className="size-4" />
            Thêm log
          </Button>
        </div>

        <div className="text-[13px] text-muted-foreground">
          {dayjs(bounds.from).format("DD/MM")} –{" "}
          {dayjs(bounds.to).format("DD/MM/YYYY")}
        </div>

        {observations.length > 0 ? (
          <div className="rounded-2xl border border-border bg-card p-4 md:p-5">
            <ul className="space-y-1.5 text-[13px] text-muted-foreground">
              {observations.map((o) => (
                <li key={o.id}>{o.text}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <StatsCards cards={cards} columns={cards.length >= 5 ? 5 : 4} />

        {period !== "day" ? (
          <WorkChart series={agg.daySeries} period={period} />
        ) : null}

        <DataTable
          key={`${period}-${category}`}
          rows={tableRows}
          rowKey={(r) => r.id}
          columns={columns}
          empty={
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card py-12 text-center">
              <Briefcase
                className="size-8 text-faint opacity-50"
                strokeWidth={1.5}
              />
              <p className="text-[13px] text-muted-foreground">
                Chưa có log nào trong kỳ này.
              </p>
              <Button type="button" size="sm" onClick={openCreate}>
                <Plus className="size-3.5" />
                Thêm log
              </Button>
            </div>
          }
          renderRow={(r) => {
            const confirming = confirmId === r.id;
            return (
              <>
                <TableCell className="tabular-nums">
                  <RelativeDateCell date={r.date} todayKey={todayKey} />
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      r.category === "company"
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-border"
                    }
                  >
                    {CATEGORY_LABEL[r.category]}
                  </Badge>
                </TableCell>
                <TableCell>{r.project}</TableCell>
                <TableCell className="tabular-nums">
                  {r.hours != null ? formatHours(r.hours) : "—"}
                </TableCell>
                <NoteCell note={r.note} />
                <TableActionsCell
                  confirming={confirming}
                  editLabel
                  isDeleting={isDeleting}
                  onEdit={() => openEdit(r)}
                  onAskDelete={() => setConfirmId(r.id)}
                  onConfirmDelete={() => handleDelete(r.id)}
                  onCancelDelete={() => setConfirmId(null)}
                />
              </>
            );
          }}
        />
      </div>

      <WorkLogModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        record={editLog}
        defaultDate={todayKey}
        isSaving={isSaving}
        knownProjects={knownProjects}
        onSave={handleSave}
      />
    </div>
  );
}
