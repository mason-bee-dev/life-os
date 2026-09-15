import { useEffect, useMemo, useRef } from "react";
import {
  type Activity,
  type ActivitySegment,
  getActivityIcon,
  groupColor,
  minutesToHHMM,
} from "./types";

type Props = {
  date: string;
  segments: ActivitySegment[];
  activities: Activity[];
  onEditSegment: (segment: ActivitySegment) => void;
  onCreateAt: (startMin: number) => void;
};

const HOUR_PX = 48;
const DAY_MINS = 1440;
const FALLBACK_SCROLL_MIN = 6 * 60;

/**
 * Domain-specific 24h vertical timeline.
 * Allowed deviation from tracker-page-pattern: interval logs need a day strip
 * (start/end blocks), not only stats + table like Sleep.
 */
export function DayTimeline({
  date,
  segments,
  activities,
  onEditSegment,
  onCreateAt,
}: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const activityById = useMemo(() => {
    const map = new Map<string, Activity>();
    for (const a of activities) map.set(a.id, a);
    return map;
  }, [activities]);

  const daySegments = useMemo(
    () =>
      segments
        .filter((s) => s.date === date)
        .sort((a, b) => a.startMin - b.startMin),
    [segments, date],
  );

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const targetMin =
      daySegments.length > 0 ? daySegments[0].startMin : FALLBACK_SCROLL_MIN;
    el.scrollTop = (targetMin / 60) * HOUR_PX - HOUR_PX;
  }, [date, daySegments]);

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("[data-segment]")) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top + (scrollerRef.current?.scrollTop ?? 0);
    const rawMin = (y / HOUR_PX) * 60;
    const snapped = Math.max(
      0,
      Math.min(23 * 60 + 30, Math.round(rawMin / 15) * 15),
    );
    onCreateAt(snapped);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4 md:p-5">
      <div className="mb-3 text-[13px] font-semibold text-foreground">
        Timeline 24h
      </div>
      <div
        ref={scrollerRef}
        className="relative max-h-[min(70vh,520px)] overflow-y-auto"
      >
        <div
          className="relative cursor-crosshair"
          style={{ height: (DAY_MINS / 60) * HOUR_PX }}
          onClick={handleTrackClick}
          role="presentation"
        >
          {Array.from({ length: 25 }, (_, h) => (
            <div
              key={h}
              className="pointer-events-none absolute left-0 right-0 flex items-start"
              style={{ top: h * HOUR_PX }}
            >
              <span className="w-12 shrink-0 -translate-y-1/2 pr-2 text-right text-[11px] tabular-nums text-muted-foreground">
                {String(h).padStart(2, "0")}:00
              </span>
              <div className="h-px flex-1 bg-border/70" />
            </div>
          ))}

          {daySegments.map((seg) => {
            const activity = activityById.get(seg.activityId);
            const color = groupColor(activity?.groupId ?? "");
            const Icon = getActivityIcon(activity?.icon ?? "Moon");
            const top = (seg.startMin / 60) * HOUR_PX;
            const height = Math.max(
              20,
              ((seg.endMin - seg.startMin) / 60) * HOUR_PX,
            );
            const label = activity?.name ?? "Hoạt động";
            const range = `${minutesToHHMM(seg.startMin)}–${minutesToHHMM(seg.endMin)}`;

            return (
              <button
                key={seg.id}
                type="button"
                data-segment
                onClick={(e) => {
                  e.stopPropagation();
                  onEditSegment(seg);
                }}
                className="absolute left-14 right-2 z-10 overflow-hidden rounded-md border border-black/10 px-2 py-1 text-left text-white shadow-sm transition-opacity hover:opacity-95 dark:border-white/10"
                style={{
                  top,
                  height,
                  backgroundColor: color,
                }}
                title={`${label} · ${range}`}
              >
                <div className="flex min-w-0 items-center gap-1.5">
                  <Icon
                    className="size-3.5 shrink-0 opacity-95"
                    strokeWidth={2}
                  />
                  <span className="truncate text-[12.5px] font-semibold">
                    {label}
                  </span>
                  <span className="ml-auto shrink-0 text-[11px] tabular-nums opacity-90">
                    {range}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      {daySegments.length === 0 ? (
        <p className="mt-3 text-center text-[13px] text-muted-foreground">
          Chưa ghi — bấm vùng trống để thêm khoảng giờ.
        </p>
      ) : null}
    </div>
  );
}
