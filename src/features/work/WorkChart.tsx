import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import dayjs from "dayjs";
import { axisLabel, formatHours, type WorkAggregate } from "./workStats";
import type { Period } from "./types";

type ChartPoint = {
  key: string;
  label: string;
  dateLabel: string;
  companyHours: number;
  personalHours: number;
  hasData: boolean;
};

type Props = {
  series: WorkAggregate["daySeries"];
  period: Period;
};

function toChartData(
  series: WorkAggregate["daySeries"],
  period: Period,
): ChartPoint[] {
  if (period === "year") {
    const byMonth = new Map<
      string,
      { companyHours: number; personalHours: number; hasData: boolean }
    >();
    for (const d of series) {
      const key = dayjs(d.date).format("YYYY-MM");
      const cur = byMonth.get(key) ?? {
        companyHours: 0,
        personalHours: 0,
        hasData: false,
      };
      cur.companyHours += d.companyHours;
      cur.personalHours += d.personalHours;
      if (d.companyHours > 0 || d.personalHours > 0) cur.hasData = true;
      byMonth.set(key, cur);
    }
    return [...byMonth.entries()].map(([key, v]) => ({
      key,
      label: dayjs(`${key}-01`).format("M"),
      dateLabel: dayjs(`${key}-01`).format("MM/YYYY"),
      companyHours: Math.round(v.companyHours * 10) / 10,
      personalHours: Math.round(v.personalHours * 10) / 10,
      hasData: v.hasData,
    }));
  }

  return series.map((d) => ({
    key: d.date,
    label: axisLabel(d.date, period),
    dateLabel: dayjs(d.date).format("DD/MM/YYYY"),
    companyHours: d.companyHours,
    personalHours: d.personalHours,
    hasData: d.companyHours > 0 || d.personalHours > 0,
  }));
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: ChartPoint }[];
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-border-hover bg-card px-3 py-2 shadow-[0_6px_20px_var(--shadow-color-40)]">
      <div className="mb-1 text-[11.5px] text-faint">{p.dateLabel}</div>
      {!p.hasData ? (
        <div className="text-[13px] text-muted-foreground">Chưa ghi</div>
      ) : (
        <div className="space-y-0.5 text-[13px] font-semibold tabular-nums">
          <div>Công ty: {formatHours(p.companyHours)}</div>
          <div>Cá nhân: {formatHours(p.personalHours)}</div>
        </div>
      )}
    </div>
  );
}

export function WorkChart({ series, period }: Props) {
  const data = toChartData(series, period);
  const hasAny = data.some((d) => d.hasData);
  const tickInterval = data.length > 14 ? 2 : 0;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 md:p-5">
      <div className="mb-3 text-[13px] font-semibold tracking-tight">
        Giờ làm theo ngày
      </div>

      {!hasAny ? (
        <div className="py-10 text-center text-[13px] text-muted-foreground">
          Chưa có dữ liệu trong kỳ này để vẽ biểu đồ
        </div>
      ) : (
        <div style={{ height: 220 }} className="-mx-1">
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
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--faint)", fontSize: 11 }}
                width={40}
                tickFormatter={(v: number) => `${v}h`}
                allowDecimals
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ fill: "var(--chart-cursor)" }}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }}
              />
              <Bar
                dataKey="companyHours"
                name="Công ty"
                stackId="hours"
                fill="var(--primary)"
                radius={[0, 0, 0, 0]}
                maxBarSize={data.length > 14 ? 16 : 28}
              />
              <Bar
                dataKey="personalHours"
                name="Cá nhân"
                stackId="hours"
                fill="var(--metric-mood)"
                radius={[4, 4, 0, 0]}
                maxBarSize={data.length > 14 ? 16 : 28}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
