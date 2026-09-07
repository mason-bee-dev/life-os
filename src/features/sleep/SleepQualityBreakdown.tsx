import { SleepEmptyState } from "./SleepEmptyState";
import { qualityDistribution } from "./stats";
import { qualityLabels, type SleepQuality, type SleepRecord } from "./types";

const order: SleepQuality[] = ["kho_ngu", "binh_thuong", "ngu_ngon"];
const colors: Record<SleepQuality, string> = {
  kho_ngu: "var(--destructive)",
  binh_thuong: "var(--muted-foreground)",
  ngu_ngon: "var(--metric-sleep)",
};

type Props = {
  records: SleepRecord[];
  onLog: () => void;
};

export function SleepQualityBreakdown({ records, onLog }: Props) {
  const dist = qualityDistribution(records);
  const total = order.reduce((s, q) => s + dist[q], 0);

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-3 text-[13px] font-semibold text-muted-foreground">
        Chất lượng giấc ngủ
      </div>
      {total === 0 ? (
        <SleepEmptyState onLog={onLog} compact />
      ) : (
        <div className="flex flex-col justify-center gap-4 py-2">
          {order.map((q) => {
            const n = dist[q];
            const pct = total > 0 ? (n / total) * 100 : 0;
            return (
              <div key={q}>
                <div className="mb-1.5 flex items-center justify-between text-[13px]">
                  <span className="text-muted-foreground">{qualityLabels[q]}</span>
                  <span className="tabular-nums">
                    {n} · {pct.toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-[width]"
                    style={{ width: `${pct}%`, background: colors[q] }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
