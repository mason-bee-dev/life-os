import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";

type Datum = { date: string; v: number };

function ChartTooltip({ active, payload }: { active?: boolean; payload?: any[] }) {
  if (active && payload?.length) {
    const p = payload[0].payload as Datum;
    return (
      <div className="rounded-lg border border-border-hover bg-card px-3 py-2 shadow-[0_6px_20px_var(--shadow-color-40)]">
        <div className="mb-0.5 text-[11.5px] text-faint">{p.date}</div>
        <div className="text-base">{p.v}</div>
      </div>
    );
  }
  return null;
}

type Props = { data: Datum[]; color?: string; height?: number };

export function StatBar({ data, color = "var(--metric-sleep)", height = 160 }: Props) {
  if (!data.length) return <div className="py-6 text-center text-[12.5px] text-faint">Chưa có dữ liệu</div>;
  return (
    <div style={{ height }} className="-mx-1.5">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
          <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: "var(--faint)", fontSize: 11 }} dy={4} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--faint)", fontSize: 11 }} width={40} allowDecimals={false} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--chart-cursor)" }} />
          <Bar dataKey="v" fill={color} radius={[4, 4, 0, 0]} maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
