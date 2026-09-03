import { useState } from "react";
import { EyeOff, Eye, Minus, Plus } from "lucide-react";
import dayjs from "dayjs";
import { useDailyRecords } from "./useDailyRecords";
import { PeriodTabs } from "./PeriodTabs";
import {
  recordsInPeriod, sumMasturbation, countPornDays,
} from "./stats";
import type { Period } from "./types";

function calcStreak(records: ReturnType<typeof useDailyRecords>["records"], todayKey: string): number {
  let streak = 0;
  let d = dayjs(todayKey);
  while (true) {
    d = d.subtract(1, "day");
    const key = d.format("YYYY-MM-DD");
    const r = records[key];
    if (!r) break;
    if ((r.masturbationCount ?? 0) > 0 || r.watchedPorn === true) break;
    streak++;
  }
  return streak;
}

export function PersonalHabits() {
  const { records, todayKey, getRecord, updateRecord } = useDailyRecords();
  const rec = getRecord(todayKey);
  const count = rec.masturbationCount ?? 0;
  const watched = rec.watchedPorn ?? false;

  const [open, setOpen] = useState(false);
  const [period, setPeriod] = useState<Period>("week");

  const list = recordsInPeriod(records, period, todayKey);
  const totalM = sumMasturbation(list);
  const pornDays = countPornDays(list);
  const streak = calcStreak(records, todayKey);

  return (
    <div>
      {/* Header — always visible */}
      <div className="flex items-center gap-[9px]">
        <span className="grid h-[26px] w-[26px] place-items-center rounded-lg text-slate-400" style={{ background: "#64748b20" }}>
          {open ? <Eye size={15} /> : <EyeOff size={15} />}
        </span>
        <span className="text-[15px] font-semibold tracking-tight">Thói quen cá nhân</span>
        <button
          onClick={() => setOpen((o) => !o)}
          className="ml-auto rounded-lg border border-border px-2.5 py-[5px] text-[12.5px] font-semibold text-muted-foreground hover:border-primary hover:text-primary"
        >
          {open ? "Ẩn" : "Hiện"}
        </button>
      </div>

      {open && (
        <div className="mt-4 flex flex-col gap-5">
          {/* Masturbation stepper */}
          <div>
            <div className="mb-2 text-[13px] text-muted-foreground">Số lần thủ dâm hôm nay</div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => updateRecord(todayKey, { masturbationCount: Math.max(0, count - 1) })}
                className="grid h-[36px] w-[36px] place-items-center rounded-xl border-[1.5px] border-border hover:border-primary hover:text-primary"
              >
                <Minus size={14} />
              </button>
              <span className="min-w-[40px] text-center text-lg font-bold">{count}</span>
              <button
                onClick={() => updateRecord(todayKey, { masturbationCount: count + 1 })}
                className="grid h-[36px] w-[36px] place-items-center rounded-xl border-[1.5px] border-border hover:border-primary hover:text-primary"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Porn toggle */}
          <div>
            <div className="mb-2 text-[13px] text-muted-foreground">Có xem nội dung người lớn hôm nay</div>
            <button
              onClick={() => updateRecord(todayKey, { watchedPorn: !watched })}
              className={
                "rounded-lg border px-4 py-[7px] text-[13px] font-semibold transition-colors " +
                (watched
                  ? "border-red-500 bg-red-500/10 text-red-400"
                  : "border-border text-muted-foreground hover:border-primary")
              }
            >
              {watched ? "Có" : "Không"}
            </button>
          </div>

          {/* Stats */}
          <div className="border-t border-border pt-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[13px] font-semibold text-muted-foreground">Thống kê</span>
              <PeriodTabs value={period} onChange={setPeriod} />
            </div>
            <div className="flex flex-col gap-1.5 text-[13px]">
              <span>Tổng số lần: <b className="font-bold">{totalM}</b></span>
              <span>Số ngày có xem nội dung người lớn: <b className="font-bold">{pornDays}</b></span>
              <span>Chuỗi ngày sạch gần nhất: <b className="font-bold">{streak} ngày</b></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
