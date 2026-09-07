import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SleepEmptyState } from "./SleepEmptyState";
import { nightWakingHourDistribution } from "./stats";
import type { SleepRecord } from "./types";

type Props = {
  records: SleepRecord[];
  onLog: () => void;
};

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: { hour: string; count: number } }[];
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-border-hover bg-card px-3 py-2 shadow-[0_6px_20px_var(--shadow-color-40)]">
      <div className="mb-0.5 text-[11.5px] text-faint">{p.hour}</div>
      <div className="text-base tabular-nums">{p.count} lần</div>
    </div>
  );
}

export function SleepNightWakingChart({ records, onLog }: Props) {
  const hours = nightWakingHourDistribution(records);
  const hasData = hours.some((n) => n > 0);
  const overnightIdx = [...Array.from({ length: 2 }, (_, i) => i + 22), ...Array.from({ length: 12 }, (_, i) => i)];
  const display = overnightIdx.map((h) => ({
    hour: String(h).padStart(2, "0"),
    count: hours[h],
  }));

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-3 text-[13px] font-semibold text-muted-foreground">
        Phân bố giờ dậy đêm
      </div>
      {!hasData ? (
        <SleepEmptyState onLog={onLog} compact />
      ) : (
        <div className="h-52 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={display}
              margin={{ top: 8, right: 4, left: -20, bottom: 0 }}
            >
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="hour"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--faint)", fontSize: 10 }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--faint)", fontSize: 11 }}
                width={28}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--chart-cursor)" }} />
              <Bar
                dataKey="count"
                fill="var(--metric-sleep)"
                radius={[3, 3, 0, 0]}
                maxBarSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
