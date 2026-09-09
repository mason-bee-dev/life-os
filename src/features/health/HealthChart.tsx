import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartDatum } from "./stats";

type Props = {
  title: string;
  data: ChartDatum[];
  color?: string;
  height?: number;
  unit?: string;
  formatValue?: (v: number) => string;
  yAllowDecimals?: boolean;
};

function ChartTooltip({
  active,
  payload,
  unit,
  formatValue,
}: {
  active?: boolean;
  payload?: { payload: ChartDatum }[];
  unit?: string;
  formatValue?: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  const valueLabel = !p.hasData
    ? "Chưa ghi"
    : formatValue
      ? formatValue(p.v)
      : unit
        ? `${p.v} ${unit}`
        : String(p.v);

  return (
    <div className="max-w-[16rem] rounded-lg border border-border-hover bg-card px-3 py-2 shadow-[0_6px_20px_var(--shadow-color-40)]">
      <div className="mb-0.5 text-[11.5px] text-faint">{p.dateLabel}</div>
      <div className="text-[13px] font-semibold tabular-nums">{valueLabel}</div>
      {p.details && p.details.length > 0 ? (
        <ul className="mt-1.5 space-y-0.5 border-t border-border pt-1.5">
          {p.details.map((line) => (
            <li key={line} className="text-[12px] text-muted-foreground">
              {line}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/** Bar chart card for health tracker tabs (week / month / year). */
export function HealthChart({
  title,
  data,
  color = "var(--metric-water)",
  height = 200,
  unit,
  formatValue,
  yAllowDecimals = true,
}: Props) {
  const hasAny = data.some((d) => d.hasData);
  const tickInterval = data.length > 14 ? 2 : 0;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 md:p-5">
      <div className="mb-3 text-[13px] font-semibold tracking-tight">{title}</div>
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
                dataKey="date"
                tickLine={false}
                axisLine={false}
                interval={tickInterval}
                tick={{ fill: "var(--faint)", fontSize: 11 }}
                dy={4}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--faint)", fontSize: 11 }}
                width={40}
                allowDecimals={yAllowDecimals}
              />
              <Tooltip
                content={
                  <ChartTooltip unit={unit} formatValue={formatValue} />
                }
                cursor={{ fill: "var(--chart-cursor)" }}
              />
              <Bar
                dataKey="v"
                radius={[4, 4, 0, 0]}
                maxBarSize={data.length > 14 ? 16 : 28}
              >
                {data.map((d) => (
                  <Cell
                    key={`${d.dateLabel}-${d.date}`}
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
