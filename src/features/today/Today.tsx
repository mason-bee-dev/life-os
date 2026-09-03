import { useState } from "react";
import {
  Smile, Moon, Scale, GlassWater, PenLine, Minus, Plus, Check, type LucideIcon,
} from "lucide-react";
import { HabitsCard } from "@/features/habits/HabitsCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { moodFaces, moodLabels } from "@/lib/mood";
import { useDailyRecords } from "@/features/health/useDailyRecords";
import type { Habit } from "@/features/habits/types";
import type { Mood } from "@/features/journal/types";

const card = "rounded-2xl border border-border bg-card p-[18px]";

function Field({
  icon: Icon, color, title, right, children, className = "",
}: {
  icon: LucideIcon; color: string; title: string;
  right?: React.ReactNode; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={card + " " + className}>
      <div className="mb-4 flex items-center gap-[9px]">
        <span className="grid h-[26px] w-[26px] place-items-center rounded-lg" style={{ color, background: color + "20" }}>
          <Icon size={15} />
        </span>
        <span className="text-[15px] font-semibold tracking-tight">{title}</span>
        {right && <span className="ml-auto text-[15px]">{right}</span>}
      </div>
      {children}
    </div>
  );
}

type TodayProps = {
  habits: Habit[];
  toggle: (index: number) => void;
  addEntry: (text: string, mood: Mood, tags?: string[]) => void;
};

export function Today({ habits, toggle, addEntry }: TodayProps) {
  const { notify } = useToast();
  const { todayKey, getRecord, updateRecord } = useDailyRecords();
  const glasses = getRecord(todayKey).waterGlasses ?? 0;
  const [mood, setMood] = useState<Mood>(4);
  const [energy, setEnergy] = useState(82);
  const [sleep, setSleep] = useState(7.2);
  const [weight, setWeight] = useState(68.4);
  const [note, setNote] = useState("");

  const sleepStr = `${Math.floor(sleep)}h ${String(Math.round((sleep % 1) * 60)).padStart(2, "0")}m`;
  const energyFill = { background: `linear-gradient(90deg,#10b981 ${energy}%,#1e293b ${energy}%)` };
  const sleepPct = ((sleep - 4) / 6) * 100;
  const sleepFill = { background: `linear-gradient(90deg,#3b82f6 ${sleepPct}%,#1e293b ${sleepPct}%)` };

  const save = () => {
    if (note.trim()) addEntry(note.trim(), mood);
    notify("Đã lưu ngày hôm nay ✓");
    setNote("");
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Field icon={Smile} color="#8b5cf6" title="Hôm nay bạn cảm thấy thế nào?">
          <div className="mb-5 grid grid-cols-5 gap-2">
            {moodFaces.map((f, i) => (
              <button
                key={i}
                onClick={() => setMood((i + 1) as Mood)}
                className={
                  "flex flex-col items-center gap-1.5 rounded-xl border-[1.5px] px-1 py-3 transition-colors " +
                  (mood === i + 1 ? "border-violet-500 bg-violet-500/10" : "border-border hover:border-[#2a3752]")
                }
              >
                <span className={"text-2xl transition-transform " + (mood === i + 1 ? "scale-110" : "grayscale-[0.4]")}>{f}</span>
                <small className={"text-[11px] font-semibold " + (mood === i + 1 ? "text-violet-400" : "text-faint")}>
                  {moodLabels[i]}
                </small>
              </button>
            ))}
          </div>
          <div className="mb-2.5 flex justify-between text-[13px]">
            <span>Năng lượng</span>
            <b className="font-bold">{energy}/100</b>
          </div>
          <input type="range" min={0} max={100} value={energy} style={energyFill}
            onChange={(e) => setEnergy(+e.target.value)} className="los-range w-full" />
        </Field>

        <Field icon={Moon} color="#3b82f6" title="Giấc ngủ" right={<b className="font-bold">{sleepStr}</b>}>
          <input type="range" min={4} max={10} step={0.1} value={sleep} style={sleepFill}
            onChange={(e) => setSleep(+e.target.value)} className="los-range w-full" />
          <div className="mt-2 flex justify-between text-[11px] text-faint">
            <span>4h</span><span>7h</span><span>10h</span>
          </div>
        </Field>

        <Field icon={Scale} color="#ef4444" title="Cân nặng" right={<b className="font-bold">{weight.toFixed(1)} kg</b>}>
          <div className="flex items-center justify-center gap-[22px] py-1.5">
            <button onClick={() => setWeight((w) => +(w - 0.1).toFixed(1))}
              className="grid h-[42px] w-[42px] place-items-center rounded-xl border-[1.5px] border-border hover:border-primary hover:text-primary">
              <Minus size={16} />
            </button>
            <div className="min-w-[120px] text-center text-3xl font-bold tracking-tight">
              {weight.toFixed(1)}<small className="ml-1 text-sm font-medium text-faint">kg</small>
            </div>
            <button onClick={() => setWeight((w) => +(w + 0.1).toFixed(1))}
              className="grid h-[42px] w-[42px] place-items-center rounded-xl border-[1.5px] border-border hover:border-primary hover:text-primary">
              <Plus size={16} />
            </button>
          </div>
        </Field>

        <Field icon={GlassWater} color="#06b6d4" title="Nước" right={<b className="font-bold">{(glasses * 0.25).toFixed(2)} L</b>}>
          <div className="flex flex-wrap gap-[7px]">
            {Array.from({ length: 8 }).map((_, i) => (
              <button
                key={i}
                onClick={() => updateRecord(todayKey, { waterGlasses: i + 1 === glasses ? i : i + 1 })}
                className={
                  "grid h-10 w-10 place-items-center rounded-[10px] border-[1.5px] transition-colors " +
                  (i < glasses ? "border-cyan-500 bg-cyan-500/10 text-cyan-400" : "border-border text-faint hover:border-cyan-500")
                }
              >
                <GlassWater size={20} />
              </button>
            ))}
          </div>
          <div className="mt-2.5 text-[12.5px] text-muted-foreground">Mục tiêu: 2.0 L · chạm vào từng ly để ghi lại</div>
        </Field>

        <div className="md:col-span-2">
          <HabitsCard habits={habits} toggle={toggle} />
        </div>

        <Field icon={PenLine} color="#10b981" title="Hôm nay của bạn thế nào?" className="md:col-span-2">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Một hoặc hai câu về hôm nay…"
            className="mb-2.5 min-h-[92px] w-full resize-y rounded-xl border-[1.5px] border-border bg-transparent px-3.5 py-3 text-sm leading-relaxed outline-none placeholder:text-faint focus:border-primary"
          />
          <div className="text-[12.5px] text-muted-foreground">Ghi chú sau khi lưu sẽ tự động trở thành một mục trong Nhật ký.</div>
        </Field>
      </div>

      <div className="mt-5 flex justify-end">
        <Button onClick={save}><Check size={17} strokeWidth={2.6} /> Lưu hôm nay</Button>
      </div>
    </>
  );
}
