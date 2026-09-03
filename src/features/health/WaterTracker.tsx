import { useState } from "react";
import { GlassWater } from "lucide-react";
import { useDailyRecords } from "./useDailyRecords";
import { PeriodTabs } from "./PeriodTabs";
import { StatBar } from "./StatBar";
import {
  recordsInPeriod, sumWaterLiters, avgWaterLiters, toDailySeries,
} from "./stats";
import type { Period } from "./types";

export function WaterTracker() {
  const { records, todayKey, getRecord, updateRecord } = useDailyRecords();
  const glasses = getRecord(todayKey).waterGlasses ?? 0;
  const [period, setPeriod] = useState<Period>("week");

  const list = recordsInPeriod(records, period, todayKey);
  const total = sumWaterLiters(list);
  const avg = avgWaterLiters(list);
  const series = toDailySeries(list, (r) => (r.waterGlasses ?? 0) * 0.25);

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex items-center gap-[9px]">
        <span className="grid h-[26px] w-[26px] place-items-center rounded-lg text-cyan-400" style={{ background: "#06b6d420" }}>
          <GlassWater size={15} />
        </span>
        <span className="text-[15px] font-semibold tracking-tight">Uống nước</span>
        <span className="ml-auto text-[15px] font-bold">{(glasses * 0.25).toFixed(2)} L</span>
      </div>

      {/* Grid 8 glasses */}
      <div className="flex flex-wrap gap-[7px]">
        {Array.from({ length: 8 }).map((_, i) => (
          <button
            key={i}
            onClick={() => updateRecord(todayKey, { waterGlasses: i + 1 === glasses ? i : i + 1 })}
            className={
              "grid h-10 w-10 place-items-center rounded-[10px] border-[1.5px] transition-colors " +
              (i < glasses ? "border-cyan-500 bg-cyan-500/10 text-cyan-400" : "border-border text-faint hover:border-cyan-500")
            }
          >
            <GlassWater size={20} />
          </button>
        ))}
      </div>
      <div className="mt-2.5 text-[12.5px] text-muted-foreground">
        Hôm nay: {(glasses * 0.25).toFixed(2)} L / mục tiêu 2.0 L
      </div>

      {/* Stats */}
      <div className="mt-5 border-t border-border pt-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[13px] font-semibold text-muted-foreground">Thống kê</span>
          <PeriodTabs value={period} onChange={setPeriod} />
        </div>
        <div className="mb-3 flex gap-6 text-[13px]">
          <span>Tổng: <b className="font-bold">{total.toFixed(2)} L</b></span>
          <span>Trung bình: <b className="font-bold">{avg.toFixed(2)} L/ngày</b></span>
        </div>
        <StatBar data={series} color="#06b6d4" />
      </div>
    </div>
  );
}
