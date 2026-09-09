import {
  Bar,
  BarChart,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  formatDuration,
  formatMinutesOnly,
  type SleepChartPoint,
} from "./sleepStats";

type Unit = "hours" | "minutes";

type Props = {
  title: string;
  data: SleepChartPoint[];
  unit: Unit;
  /** Guide line (7h night / 30p nap). */
  referenceValue?: number;
  referenceLabel?: string;
  color?: string;
  height?: number;
};

function ChartTooltip({
  active,
  payload,
  unit,
}: {
  active?: boolean;
  payload?: { payload: SleepChartPoint }[];
  unit: Unit;
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  const valueLabel = !p.hasData
    ? "Chưa ghi"
    : unit === "hours"
      ? formatDuration(p.mins)
      : formatMinutesOnly(p.mins);

  return (
    <div className="rounded-lg border border-border-hover bg-card px-3 py-2 shadow-[0_6px_20px_var(--shadow-color-40)]">
      <div className="mb-0.5 text-[11.5px] text-faint">{p.dateLabel}</div>
      <div className="text-[13px] font-semibold tabular-nums">{valueLabel}</div>
    </div>
  );
}

export function SleepChart({
  title,
  data,
  unit,
  referenceValue,
  referenceLabel,
  color = "var(--metric-sleep)",
  height = 200,
}: Props) {
  const hasAny = data.some((d) => d.hasData);
  const tickInterval = data.length > 14 ? 2 : 0;
  const yDomain: [number, number] =
    unit === "hours" ? [0, 10] : [0, Math.max(60, ...data.map((d) => d.value))];

  return (
    <div className="rounded-2xl border border-border bg-card p-4 md:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-[13px] font-semibold tracking-tight">{title}</div>
        {referenceLabel ? (
          <div className="text-[12px] text-muted-foreground">
            Mốc: {referenceLabel}
          </div>
        ) : null}
      </div>

      {!hasAny ? (
        <div className="py-10 text-center text-[13px] text-muted-foreground">
          Chưa có dữ liệu trong kỳ này để vẽ biểu đồ
        </div>
      ) : (
        <div style={{ height }} className="-mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 12, right: 8, left: -18, bottom: 0 }}
            >
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                interval={tickInterval}
                tick={{ fill: "var(--faint)", fontSize: 11 }}
                dy={4}
              />
              <YAxis
                domain={yDomain}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--faint)", fontSize: 11 }}
                width={40}
                tickFormatter={(v: number) =>
                  unit === "hours" ? `${v}h` : `${v}`
                }
                allowDecimals={unit === "hours"}
              />
              <Tooltip
                content={<ChartTooltip unit={unit} />}
                cursor={{ fill: "var(--chart-cursor)" }}
              />
              {referenceValue != null ? (
                <ReferenceLine
                  y={referenceValue}
                  stroke="var(--faint)"
                  strokeDasharray="4 4"
                  strokeOpacity={0.7}
                />
              ) : null}
              <Bar
                dataKey="value"
                radius={[4, 4, 0, 0]}
                maxBarSize={data.length > 14 ? 16 : 28}
              >
                {data.map((d) => (
                  <Cell
                    key={d.dateKey}
                    fill={d.hasData ? color : "transparent"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
