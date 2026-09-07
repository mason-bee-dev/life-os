import dayjs from "dayjs";
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
import { napDuration } from "./stats";
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
  payload?: { payload: { date: string; minutes: number } }[];
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-border-hover bg-card px-3 py-2 shadow-[0_6px_20px_var(--shadow-color-40)]">
      <div className="mb-0.5 text-[11.5px] text-faint">{p.date}</div>
      <div className="text-base tabular-nums">{p.minutes} phút</div>
    </div>
  );
}

export function SleepNapChart({ records, onLog }: Props) {
  const data = [...records]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((r) => {
      const mins = napDuration(r);
      return {
        date: dayjs(r.date).format("DD/MM"),
        minutes: mins ?? 0,
      };
    })
    .filter((d) => d.minutes > 0);

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-3 text-[13px] font-semibold text-muted-foreground">
        Ngủ trưa theo kỳ
      </div>
      {!data.length ? (
        <SleepEmptyState onLog={onLog} compact />
      ) : (
        <div className="h-52 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--faint)", fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--faint)", fontSize: 11 }}
                width={36}
                unit="p"
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--chart-cursor)" }} />
              <Bar
                dataKey="minutes"
                fill="var(--metric-sleep)"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
