import { useMemo, useState } from "react";
import { Briefcase, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { WorkLogModal } from "./WorkLogModal";
import { useWorkData } from "./useWorkData";
import { resolveDayLoad } from "./workStats";
import {
  type DayType,
  type WorkLoad,
  type WorkLog,
  type WorkLogInput,
} from "./types";

const card = "rounded-2xl border border-border bg-card p-5";

type ShapeOption =
  | { id: "full"; label: "Cả ngày"; kind: "load"; load: WorkLoad }
  | { id: "half"; label: "Nửa ngày"; kind: "load"; load: WorkLoad }
  | { id: "empty"; label: "Trống"; kind: "load"; load: WorkLoad }
  | { id: "leave"; label: "Nghỉ"; kind: "leave" };

const SHAPE_OPTIONS: ShapeOption[] = [
  { id: "full", label: "Cả ngày", kind: "load", load: "full" },
  { id: "half", label: "Nửa ngày", kind: "load", load: "half" },
  { id: "empty", label: "Trống", kind: "load", load: "empty" },
  { id: "leave", label: "Nghỉ", kind: "leave" },
];

export function TodayWorkWidget() {
  const { notify } = useToast();
  const {
    days,
    logs,
    isSaving,
    isDeleting,
    todayKey,
    saveDay,
    saveLog,
    deleteLog,
  } = useWorkData({ work: "day" });

  const [modalOpen, setModalOpen] = useState(false);
  const [editLog, setEditLog] = useState<WorkLog | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const todayDay = days.find((d) => d.date === todayKey);
  const sortedTodayLogs = useMemo(
    () =>
      [...logs.filter((l) => l.date === todayKey)].sort((a, b) =>
        a.id.localeCompare(b.id),
      ),
    [logs, todayKey],
  );

  const companyHours = sortedTodayLogs
    .filter((l) => l.category === "company" && l.hours != null)
    .reduce((s, l) => s + (l.hours ?? 0), 0);
  const hoursLockLoad = companyHours > 0;

  const resolved = resolveDayLoad(todayDay, sortedTodayLogs, todayKey);

  const activeId: ShapeOption["id"] | null =
    resolved === "full" ||
    resolved === "half" ||
    resolved === "empty" ||
    resolved === "leave"
      ? resolved
      : null;

  const knownProjects = useMemo(
    () => [...new Set(logs.map((l) => l.project).filter(Boolean))],
    [logs],
  );

  const applyShape = (opt: ShapeOption) => {
    if (hoursLockLoad && opt.kind === "load") {
      // Derived from company hours — don't contradict real logs.
      return;
    }

    if (opt.kind === "leave") {
      const nextType: DayType =
        todayDay?.dayType === "leave" ? "work" : "leave";
      saveDay(
        {
          date: todayKey,
          dayType: nextType,
          load: nextType === "leave" ? null : (todayDay?.load ?? null),
          note: todayDay?.note ?? null,
        },
        {
          onSuccess: () =>
            notify(nextType === "leave" ? "Đã đánh dấu nghỉ" : "Đã bỏ nghỉ"),
          onError: () => notify("Không lưu được. Thử lại sau."),
        },
      );
      return;
    }

    const same = todayDay?.dayType === "work" && todayDay?.load === opt.load;
    saveDay(
      {
        date: todayKey,
        dayType: "work",
        load: same ? null : opt.load,
        note: todayDay?.note ?? null,
      },
      {
        onSuccess: () => notify("Đã cập nhật ngày"),
        onError: () => notify("Không lưu được. Thử lại sau."),
      },
    );
  };

  const openCreate = () => {
    setEditLog(null);
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
    <div className={card}>
      <div className="mb-4 flex items-center gap-2">
        <span
          className="grid h-[26px] w-[26px] place-items-center rounded-lg"
          style={{
            color: "var(--primary)",
            background:
              "color-mix(in srgb, var(--primary) 12.5490196078%, transparent)",
          }}
        >
          <Briefcase size={15} />
        </span>
        <span className="text-[15px] font-semibold tracking-tight">
          Công việc hôm nay
        </span>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {SHAPE_OPTIONS.map((opt) => {
          const active = activeId === opt.id;
          const locked =
            hoursLockLoad && opt.kind === "load" && opt.id !== activeId;
          return (
            <button
              key={opt.id}
              type="button"
              disabled={isSaving || (hoursLockLoad && opt.kind === "load")}
              onClick={() => applyShape(opt)}
              className={
                "rounded-lg border px-3 py-2 text-[13px] font-semibold transition-colors disabled:opacity-60 " +
                (active
                  ? "border-primary bg-primary/10 text-primary"
                  : locked
                    ? "border-border text-muted-foreground"
                    : "border-border text-muted-foreground hover:border-primary hover:text-primary")
              }
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {hoursLockLoad ? (
        <p className="mb-3 text-[12px] text-muted-foreground">
          Hình dạng ngày đang suy từ giờ công ty đã log.
        </p>
      ) : null}

      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="text-[13px] text-muted-foreground">Chi tiết (tuỳ chọn)</div>
        <Button type="button" size="sm" variant="outline" onClick={openCreate}>
          <Plus className="size-3.5" />
          Thêm log
        </Button>
      </div>

      {sortedTodayLogs.length === 0 ? (
        <p className="text-[13px] text-muted-foreground">Chưa có log hôm nay.</p>
      ) : (
        <ul className="space-y-2">
          {sortedTodayLogs.map((log) => {
            const confirming = confirmId === log.id;
            const hoursLabel =
              log.hours != null ? `${log.hours}h` : "—";
            const note = log.note?.trim();
            return (
              <li
                key={log.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border px-3 py-2"
              >
                <div className="min-w-0 text-[13px]">
                  <span className="font-medium">{log.project}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    · {hoursLabel}
                    {note ? ` · ${note}` : ""}
                  </span>
                </div>
                {confirming ? (
                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      disabled={isDeleting}
                      onClick={() => handleDelete(log.id)}
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
                      aria-label="Sửa"
                      onClick={() => {
                        setEditLog(log);
                        setModalOpen(true);
                      }}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      aria-label="Xoá"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setConfirmId(log.id)}
                    >
                      <Trash2 className="size-3.5 text-destructive" />
                    </Button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

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
