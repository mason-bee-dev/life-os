import { Delta } from "@/components/charts/Delta";
import {
  avgNapDuration,
  avgNightSleepDuration,
  avgNightWakings,
  avgTimeOfDay,
  deltaPct,
  formatDuration,
  napFrequency,
  typicalNightWakingTime,
} from "./stats";
import type { SleepRecord } from "./types";

const card =
  "rounded-2xl border border-border bg-card p-5 flex flex-col gap-1 min-w-0";

type Props = {
  current: SleepRecord[];
  previous: SleepRecord[];
};

export function SleepStatsCards({ current, previous }: Props) {
  const nightAvg = avgNightSleepDuration(current);
  const nightPrev = avgNightSleepDuration(previous);
  const nightDelta = deltaPct(nightAvg, nightPrev);

  const bedtimes = current.map((r) => r.bedtime).filter((t): t is string => !!t);
  const wakeTimes = current.map((r) => r.wakeTime).filter((t): t is string => !!t);
  const avgBed = avgTimeOfDay(bedtimes);
  const avgWake = avgTimeOfDay(wakeTimes);

  const wakings = avgNightWakings(current);
  const wakingsPrev = avgNightWakings(previous);
  const wakingsDelta = deltaPct(wakings, wakingsPrev);
  const typicalWaking = typicalNightWakingTime(current);

  const napFreq = napFrequency(current);
  const napFreqPrev = napFrequency(previous);
  const napFreqDelta = deltaPct(napFreq, napFreqPrev);
  const napAvg = avgNapDuration(current);
  const napPrev = avgNapDuration(previous);
  const napDelta = deltaPct(napAvg, napPrev);

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <div className={card}>
        <div className="text-[12.5px] text-muted-foreground">Ngủ đêm TB</div>
        <div className="text-[22px] font-semibold tabular-nums tracking-tight">
          {nightAvg != null ? formatDuration(Math.round(nightAvg)) : "—"}
        </div>
        {nightDelta && (
          <Delta
            dir={nightDelta.dir}
            value={nightDelta.value}
            color={nightDelta.dir === "up" ? "var(--metric-sleep)" : "var(--destructive)"}
          />
        )}
      </div>

      <div className={card}>
        <div className="text-[12.5px] text-muted-foreground">Giờ ngủ / dậy TB</div>
        <div className="text-[20px] font-semibold tabular-nums tracking-tight">
          {avgBed && avgWake ? `${avgBed} → ${avgWake}` : "—"}
        </div>
      </div>

      <div className={card}>
        <div className="text-[12.5px] text-muted-foreground">Dậy đêm TB</div>
        <div className="text-[22px] font-semibold tabular-nums tracking-tight">
          {wakings != null ? `${wakings.toFixed(1)} lần` : "—"}
        </div>
        <div className="text-[13px] tabular-nums text-muted-foreground">
          Giờ TB: {typicalWaking ?? "—"}
        </div>
        {wakingsDelta && (
          <Delta
            dir={wakingsDelta.dir}
            value={wakingsDelta.value}
            color={wakingsDelta.dir === "down" ? "var(--metric-sleep)" : "var(--destructive)"}
          />
        )}
      </div>

      <div className={card}>
        <div className="text-[12.5px] text-muted-foreground">Ngủ trưa</div>
        <div className="text-[22px] font-semibold tabular-nums tracking-tight">
          {napFreq != null ? `${napFreq.toFixed(0)}% ngày` : "—"}
        </div>
        <div className="text-[13px] tabular-nums text-muted-foreground">
          TB: {napAvg != null ? formatDuration(Math.round(napAvg)) : "—"}
        </div>
        {(napFreqDelta || napDelta) && (
          <Delta
            dir={(napFreqDelta ?? napDelta)!.dir}
            value={(napFreqDelta ?? napDelta)!.value}
            color="var(--metric-sleep)"
          />
        )}
      </div>
    </div>
  );
}
