import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SleepEmptyState } from "./SleepEmptyState";
import { toTrendSeries } from "./stats";
import type { SleepRecord } from "./types";

type Props = {
  records: SleepRecord[];
  onLog: () => void;
  className?: string;
};

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: { date: string; durationHours: number | null } }[];
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-border-hover bg-card px-3 py-2 shadow-[0_6px_20px_var(--shadow-color-40)]">
      <div className="mb-0.5 text-[11.5px] text-faint">{p.date}</div>
      <div className="text-base tabular-nums">
        {p.durationHours != null ? `${p.durationHours}h` : "—"}
      </div>
    </div>
  );
}

export function SleepTrendChart({ records, onLog, className }: Props) {
  const data = toTrendSeries(records).filter((d) => d.durationHours != null);

  return (
    <div
      className={
        "rounded-2xl border border-border bg-card p-5 " + (className ?? "")
      }
    >
      <div className="mb-3 text-[13px] font-semibold text-muted-foreground">
        Xu hướng thời lượng ngủ
      </div>
      {!data.length ? (
        <SleepEmptyState onLog={onLog} compact />
      ) : (
        <div className="h-[260px] -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="sleepDurationFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--metric-sleep)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--metric-sleep)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--faint)", fontSize: 11 }}
                dy={4}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--faint)", fontSize: 11 }}
                width={36}
                unit="h"
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="durationHours"
                stroke="var(--metric-sleep)"
                strokeWidth={2}
                fill="url(#sleepDurationFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
