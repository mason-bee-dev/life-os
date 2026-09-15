import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { CalendarIcon, Clock, Plus } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { NoteCell } from "@/components/NoteCell";
import { PeriodFilter } from "@/components/PeriodFilter";
import { RelativeDateCell } from "@/components/RelativeDateCell";
import { TableActionsCell } from "@/components/TableActionsCell";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TableCell } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { ActivityManagerModal } from "./ActivityManagerModal";
import { DayTimeline } from "./DayTimeline";
import { SegmentModal } from "./SegmentModal";
import { useTimelineData } from "./useTimelineData";
import {
  PERIOD_OPTIONS,
  type ActivitySegment,
  type Period,
  type SegmentInput,
  formatDuration,
  getActivityIcon,
  groupColor,
  minutesToHHMM,
  periodBounds,
  segmentsOverlap,
} from "./types";

const columns = [
  { key: "date", header: "Ngày" },
  { key: "start", header: "Bắt đầu" },
  { key: "end", header: "Kết thúc" },
  { key: "duration", header: "Thời lượng" },
  { key: "activity", header: "Hoạt động" },
  { key: "note", header: "Ghi chú" },
  { key: "actions", header: "Thao tác" },
];

export function Timeline() {
  const { notify } = useToast();
  const [period, setPeriod] = useState<Period>("day");
  const [viewDate, setViewDate] = useState(() => dayjs().format("YYYY-MM-DD"));
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const [segmentModalOpen, setSegmentModalOpen] = useState(false);
  const [editSegment, setEditSegment] = useState<ActivitySegment | null>(null);
  const [prefillStartMin, setPrefillStartMin] = useState<number | null>(null);
  const [managerOpen, setManagerOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const {
    activities,
    segments,
    isLoading,
    error,
    isSaving,
    isDeleting,
    todayKey,
    createActivity,
    updateActivity,
    deleteActivity,
    saveSegment,
    deleteSegment,
  } = useTimelineData(period, viewDate);

  const bounds = periodBounds(viewDate, period);

  const periodRows = useMemo(() => {
    return segments
      .filter((s) => s.date >= bounds.from && s.date <= bounds.to)
      .sort((a, b) => {
        const byDate = b.date.localeCompare(a.date);
        if (byDate !== 0) return byDate;
        return b.startMin - a.startMin;
      });
  }, [segments, bounds.from, bounds.to]);

  const daySegmentsSorted = useMemo(
    () =>
      segments
        .filter((s) => s.date === viewDate)
        .sort((a, b) => a.startMin - b.startMin),
    [segments, viewDate],
  );

  const previousEndMin =
    daySegmentsSorted.length > 0
      ? daySegmentsSorted[daySegmentsSorted.length - 1].endMin
      : null;

  const activityById = useMemo(() => {
    const map = new Map(activities.map((a) => [a.id, a]));
    return map;
  }, [activities]);

  const openCreate = (startMin?: number) => {
    setEditSegment(null);
    setPrefillStartMin(startMin ?? null);
    setSegmentModalOpen(true);
  };

  const openEdit = (segment: ActivitySegment) => {
    setEditSegment(segment);
    setPrefillStartMin(null);
    setSegmentModalOpen(true);
  };

  const handleSaveSegment = (input: SegmentInput & { id?: string }) => {
    const others = segments.filter(
      (s) => s.date === input.date && s.id !== input.id,
    );
    const conflict = others.find((s) =>
      segmentsOverlap(s, { startMin: input.startMin, endMin: input.endMin }),
    );
    if (conflict) {
      const ok = window.confirm(
        `Khoảng ${minutesToHHMM(input.startMin)}–${minutesToHHMM(input.endMin)} trùng với bản ghi đã có trong ngày. Vẫn lưu?`,
      );
      if (!ok) return;
    }

    saveSegment(input, {
      onSuccess: () => {
        notify(input.id ? "Đã cập nhật bản ghi" : "Đã thêm hoạt động");
        setSegmentModalOpen(false);
        setEditSegment(null);
        setPrefillStartMin(null);
      },
      onError: () => notify("Không lưu được. Thử lại sau."),
    });
  };

  const handleDeleteSegment = (id: string) => {
    deleteSegment(id, {
      onSuccess: () => {
        notify("Đã xoá bản ghi");
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
          Không tải được dữ liệu dòng thời gian. Kiểm tra bảng{" "}
          <code className="text-[12px]">activities</code> /{" "}
          <code className="text-[12px]">activity_segments</code> trên Supabase.
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
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 font-semibold"
                >
                  <CalendarIcon className="size-3.5" />
                  {dayjs(viewDate).format("DD/MM/YYYY")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dayjs(viewDate).toDate()}
                  onSelect={(d) => {
                    if (!d) return;
                    setViewDate(dayjs(d).format("YYYY-MM-DD"));
                    setDatePickerOpen(false);
                  }}
                  disabled={{ after: dayjs().endOf("day").toDate() }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setManagerOpen(true)}
            >
              Quản lý hoạt động
            </Button>
            <Button type="button" onClick={() => openCreate()}>
              <Plus className="size-4" />
              Thêm hoạt động
            </Button>
          </div>
        </div>

        <div className="text-[13px] text-muted-foreground">
          {dayjs(bounds.from).format("DD/MM")} –{" "}
          {dayjs(bounds.to).format("DD/MM/YYYY")}
        </div>

        {/* Stats / insight — reserved for a later prompt */}

        <DayTimeline
          date={viewDate}
          segments={segments}
          activities={activities}
          onEditSegment={openEdit}
          onCreateAt={(startMin) => openCreate(startMin)}
        />

        <DataTable
          key={`timeline-${period}-${viewDate}`}
          rows={periodRows}
          rowKey={(r) => r.id}
          columns={columns}
          empty={
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card py-12 text-center">
              <Clock
                className="size-8 text-faint opacity-50"
                strokeWidth={1.5}
              />
              <p className="text-[13px] text-muted-foreground">
                Chưa có bản ghi trong kỳ này
              </p>
              <Button type="button" size="sm" onClick={() => openCreate()}>
                <Plus className="size-3.5" />
                Thêm hoạt động
              </Button>
            </div>
          }
          renderRow={(r) => {
            const activity = activityById.get(r.activityId);
            const Icon = getActivityIcon(activity?.icon ?? "Moon");
            const color = groupColor(activity?.groupId ?? "");
            const confirming = confirmId === r.id;
            return (
              <>
                <TableCell className="tabular-nums">
                  <RelativeDateCell date={r.date} todayKey={todayKey} />
                </TableCell>
                <TableCell className="tabular-nums text-muted-foreground">
                  {minutesToHHMM(r.startMin)}
                </TableCell>
                <TableCell className="tabular-nums text-muted-foreground">
                  {minutesToHHMM(r.endMin)}
                </TableCell>
                <TableCell className="tabular-nums">
                  {formatDuration(r.endMin - r.startMin)}
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <Icon className="size-3.5 shrink-0 text-muted-foreground" />
                    <span>{activity?.name ?? "—"}</span>
                  </span>
                </TableCell>
                <NoteCell note={r.note} />
                <TableActionsCell
                  confirming={confirming}
                  editLabel
                  isDeleting={isDeleting}
                  onEdit={() => openEdit(r)}
                  onAskDelete={() => setConfirmId(r.id)}
                  onConfirmDelete={() => handleDeleteSegment(r.id)}
                  onCancelDelete={() => setConfirmId(null)}
                />
              </>
            );
          }}
        />
      </div>

      <SegmentModal
        open={segmentModalOpen}
        onOpenChange={(open) => {
          setSegmentModalOpen(open);
          if (!open) {
            setEditSegment(null);
            setPrefillStartMin(null);
          }
        }}
        activities={activities}
        segment={editSegment}
        defaultDate={viewDate}
        defaultStartMin={prefillStartMin}
        previousEndMin={previousEndMin}
        isSaving={isSaving}
        onSave={handleSaveSegment}
      />

      <ActivityManagerModal
        open={managerOpen}
        onOpenChange={setManagerOpen}
        activities={activities}
        isSaving={isSaving}
        onCreate={createActivity}
        onUpdate={updateActivity}
        onDelete={deleteActivity}
      />
    </div>
  );
}
