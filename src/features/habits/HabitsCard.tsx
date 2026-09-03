import { Check, Plus } from "lucide-react";
import type { Habit } from "./types";

type HabitsCardProps = {
  habits: Habit[];
  toggle: (index: number) => void;
};

export function HabitsCard({ habits, toggle }: HabitsCardProps) {
  const done = habits.filter((h) => h.done).length;
  const pct = habits.length ? Math.round((done / habits.length) * 100) : 0;

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-[18px]">
      <div className="mb-3.5 flex items-center justify-between">
        <span className="text-[15px] font-semibold tracking-tight">Thói quen hôm nay</span>
        <span className="text-[12.5px] text-muted-foreground">
          {done} / {habits.length} hoàn thành
        </span>
      </div>

      <div className="mb-3.5 h-[7px] overflow-hidden rounded-full bg-track">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-[width] duration-300"
          style={{ width: pct + "%" }}
        />
      </div>

      <div className="flex flex-col">
        {habits.map((h, i) => (
          <div
            key={h.name}
            className="flex items-center gap-[11px] border-b border-border py-[9px] last:border-b-0"
          >
            <span className="w-5 text-center text-base">{h.icon}</span>
            <span className="flex-1 text-[13.5px] font-medium">{h.name}</span>
            <span className="mr-1 text-[12.5px] text-muted-foreground">{h.meta}</span>
            <button
              onClick={() => toggle(i)}
              className={
                "grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full border-2 text-white transition-colors " +
                (h.done
                  ? "border-primary bg-primary"
                  : "border-[#2a3752] hover:border-primary")
              }
            >
              {h.done && <Check size={13} strokeWidth={3} />}
            </button>
          </div>
        ))}
      </div>

      <button className="mt-3.5 flex items-center gap-1.5 text-[13px] font-semibold text-blue-500 hover:underline">
        <Plus size={15} /> Thêm thói quen
      </button>
    </div>
  );
}
