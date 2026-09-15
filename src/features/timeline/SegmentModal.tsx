import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { CalendarIcon } from "lucide-react";
import { TimeField } from "@/components/TimeField";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type Activity,
  type ActivitySegment,
  type SegmentInput,
  formatDuration,
  getActivityIcon,
  hhmmToMinutes,
  minutesToHHMM,
} from "./types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activities: Activity[];
  segment?: ActivitySegment | null;
  defaultDate: string;
  /** Prefill start (minutes) when creating from timeline click / quick-add. */
  defaultStartMin?: number | null;
  /** End of previous segment — quick-add default when no click prefill. */
  previousEndMin?: number | null;
  isSaving: boolean;
  onSave: (input: SegmentInput & { id?: string }) => void;
};

export function SegmentModal({
  open,
  onOpenChange,
  activities,
  segment,
  defaultDate,
  defaultStartMin,
  previousEndMin,
  isSaving,
  onSave,
}: Props) {
  const activeActivities = useMemo(
    () => activities.filter((a) => !a.archived || a.id === segment?.activityId),
    [activities, segment?.activityId],
  );

  const [date, setDate] = useState(defaultDate);
  const [activityId, setActivityId] = useState("");
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const editing = Boolean(segment);

  useEffect(() => {
    if (!open) return;
    if (segment) {
      setDate(segment.date);
      setActivityId(segment.activityId);
      setStartTime(minutesToHHMM(segment.startMin));
      setEndTime(minutesToHHMM(segment.endMin));
      setNote(segment.note ?? "");
    } else {
      setDate(defaultDate);
      const first = activeActivities[0]?.id ?? "";
      setActivityId(first);
      const start =
        defaultStartMin != null
          ? defaultStartMin
          : previousEndMin != null
            ? previousEndMin
            : 9 * 60;
      const end = Math.min(1440, start + 30);
      setStartTime(minutesToHHMM(start));
      setEndTime(minutesToHHMM(end));
      setNote("");
    }
    setDatePickerOpen(false);
  }, [
    open,
    segment,
    defaultDate,
    defaultStartMin,
    previousEndMin,
    activeActivities,
  ]);

  const startMin = startTime ? hhmmToMinutes(startTime) : null;
  const endMin = endTime ? hhmmToMinutes(endTime) : null;
  const duration =
    startMin != null && endMin != null && endMin > startMin
      ? endMin - startMin
      : null;
  const canSave =
    Boolean(activityId) &&
    startMin != null &&
    endMin != null &&
    endMin > startMin;

  const handleSave = () => {
    if (!canSave || startMin == null || endMin == null) return;
    onSave({
      id: segment?.id,
      activityId,
      date,
      startMin,
      endMin,
      note: note.trim() || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Sửa hoạt động" : "Thêm hoạt động"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-1">
          <div className="space-y-1.5">
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 font-semibold"
                >
                  <CalendarIcon className="size-3.5" />
                  {dayjs(date).format("DD/MM/YYYY")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dayjs(date).toDate()}
                  onSelect={(d) => {
                    if (!d) return;
                    setDate(dayjs(d).format("YYYY-MM-DD"));
                    setDatePickerOpen(false);
                  }}
                  disabled={{ after: dayjs().endOf("day").toDate() }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1.5">
            <Label>Hoạt động</Label>
            <Select value={activityId} onValueChange={setActivityId}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn hoạt động" />
              </SelectTrigger>
              <SelectContent>
                {activeActivities.map((a) => {
                  const Icon = getActivityIcon(a.icon);
                  return (
                    <SelectItem key={a.id} value={a.id}>
                      <span className="inline-flex items-center gap-2">
                        <Icon className="size-3.5" />
                        {a.name}
                        {a.archived ? " (đã lưu trữ)" : ""}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <TimeField
              label="Bắt đầu"
              value={startTime}
              onChange={setStartTime}
            />
            <TimeField
              label="Kết thúc"
              value={endTime}
              onChange={setEndTime}
            />
          </div>

          <div className="space-y-1">
            <Label>Thời lượng</Label>
            <p className="text-[15px] font-semibold tabular-nums">
              {duration != null ? formatDuration(duration) : "—"}
            </p>
            {startMin != null && endMin != null && endMin <= startMin ? (
              <p className="text-[13px] text-destructive">
                Kết thúc phải sau bắt đầu.
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="segment-note">Ghi chú</Label>
            <textarea
              id="segment-note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Tuỳ chọn…"
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-body placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Huỷ
          </Button>
          <Button
            type="button"
            disabled={isSaving || !canSave}
            onClick={handleSave}
          >
            {isSaving ? "Đang lưu…" : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
