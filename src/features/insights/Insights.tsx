import {
  ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { Sparkles } from "lucide-react";
import { insightItems, correlations, scatterData, compareRows } from "./data";

const card = "rounded-2xl border border-border bg-card p-[18px]";

function ScatterTip({ active, payload }: { active?: boolean; payload?: any[] }) {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="rounded-[9px] border border-[#2a3752] bg-card px-[11px] py-[7px] shadow-[0_6px_20px_rgba(0,0,0,0.4)]">
        <div className="mb-0.5 text-[11.5px] text-muted-foreground">Giấc ngủ {d.s}h</div>
        <div className="text-base font-bold">
          {d.p}<small className="ml-1 text-[11px] font-medium text-muted-foreground">năng suất</small>
        </div>
      </div>
    );
  }
  return null;
}

export function Insights() {
  return (
    <div className="flex flex-col gap-5">
      {/* headline insights */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {insightItems.map((it) => {
          const Icon = it.icon;
          return (
            <div key={it.title} className={card + " flex flex-col"} style={{ borderTop: `3px solid ${it.color}` }}>
              <span className="grid h-[26px] w-[26px] place-items-center rounded-lg" style={{ color: it.color, background: it.bg }}>
                <Icon size={16} />
              </span>
              <div className="mt-3 text-[13px] font-bold">{it.title}</div>
              <div className="mt-1.5 text-xs leading-snug text-muted-foreground">{it.text}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
        {/* scatter */}
        <div className={card}>
          <div className="mb-3.5 flex items-center justify-between">
            <span className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
              <Sparkles size={15} className="text-primary" /> Giấc ngủ và Năng suất
            </span>
          </div>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 12, left: -14, bottom: 4 }}>
                <CartesianGrid stroke="#1c2740" strokeDasharray="3 3" />
                <XAxis type="number" dataKey="s" domain={[5, 9]} tickLine={false} axisLine={false}
                  tick={{ fill: "#5c6b85", fontSize: 11 }} tickFormatter={(v) => v + "h"} />
                <YAxis type="number" dataKey="p" domain={[40, 100]} tickLine={false} axisLine={false}
                  tick={{ fill: "#5c6b85", fontSize: 11 }} width={40} />
                <Tooltip content={<ScatterTip />} cursor={{ strokeDasharray: "3 3" }} />
                <Scatter data={scatterData} fill="#10b981" fillOpacity={0.85} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 border-t border-border pt-3 text-[12.5px] leading-relaxed text-muted-foreground">
            Mỗi chấm là một ngày. Xu hướng đi lên cho thấy ngủ nhiều hơn thường đi kèm năng suất
            cao hơn — rõ nhất khi ngủ trên 7 tiếng.
          </div>
        </div>

        {/* correlations */}
        <div className={card}>
          <div className="mb-3.5 flex items-center justify-between">
            <span className="text-[15px] font-semibold tracking-tight">Tương quan</span>
            <span className="text-[12.5px] text-muted-foreground">90 ngày gần nhất</span>
          </div>
          <div className="flex flex-col gap-4">
            {correlations.map((c) => (
              <div key={c.a + c.b}>
                <div className="mb-[7px] flex items-center justify-between">
                  <span className="text-[13px] font-semibold">
                    {c.a} <span className="mx-0.5 text-faint">↔</span> {c.b}
                  </span>
                  <span className="text-[13px] font-bold tabular-nums" style={{ color: c.dir === "pos" ? "#10b981" : "#ef4444" }}>
                    {c.dir === "pos" ? "+" : ""}{c.r.toFixed(2)}
                  </span>
                </div>
                <div className="h-[7px] overflow-hidden rounded-full bg-track">
                  <div className="h-full rounded-full" style={{ width: Math.abs(c.r) * 100 + "%", background: c.dir === "pos" ? "#10b981" : "#ef4444" }} />
                </div>
                <div className="mt-[5px] text-[11.5px] text-muted-foreground">{c.note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* comparison */}
      <div className={card}>
        <div className="mb-3.5 flex items-center justify-between">
          <span className="text-[15px] font-semibold tracking-tight">Tháng này so với tháng trước</span>
          <span className="text-[12.5px] text-muted-foreground">Tháng 8 so với tháng 7</span>
        </div>
        <div className="flex flex-col gap-[18px]">
          {compareRows.map((r) => {
            const max = Math.max(r.last, r.now) * 1.12;
            const up = r.now >= r.last;
            const pct = Math.round(((r.now - r.last) / r.last) * 100);
            return (
              <div key={r.label} className="grid grid-cols-[96px_1fr_56px] items-center gap-3.5">
                <div className="text-[13px] font-semibold">{r.label}</div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <div className="h-4 shrink-0 rounded-[5px] bg-[#2a3752]" style={{ width: (r.last / max) * 100 + "%" }} />
                    <span className="whitespace-nowrap text-[11.5px] tabular-nums text-muted-foreground">
                      {r.last}{r.unit} <em className="not-italic text-faint">trước</em>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 shrink-0 rounded-[5px] bg-primary" style={{ width: (r.now / max) * 100 + "%" }} />
                    <span className="whitespace-nowrap text-[11.5px] tabular-nums text-muted-foreground">
                      {r.now}{r.unit} <em className="not-italic text-faint">nay</em>
                    </span>
                  </div>
                </div>
                <div className="text-right text-[13px] font-bold" style={{ color: up ? "#10b981" : "#ef4444" }}>
                  {up ? "▲" : "▼"} {Math.abs(pct)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
