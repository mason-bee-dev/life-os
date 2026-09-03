import { AreaChart, Area, ResponsiveContainer } from "recharts";
import type { SparkPoint } from "@/types";

export function Spark({ data, color }: { data: SparkPoint[]; color: string }) {
  const id = "spark-" + color.replace("#", "");
  return (
    <div className="mt-auto -mb-1 h-[52px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.28} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={2.2}
            fill={`url(#${id})`}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
