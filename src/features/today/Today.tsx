import { useState } from "react";
import {
  Smile,
  Moon,
  Scale,
  GlassWater,
  PenLine,
  Minus,
  Plus,
  Check,
  type LucideIcon,
} from "lucide-react";
import { HabitsCard } from "@/features/habits/HabitsCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { moodFaces, moodLabels } from "@/lib/mood";
import { useDailyRecords } from "@/features/health/useDailyRecords";
import type { Habit } from "@/features/habits/types";
import type { Mood } from "@/features/journal/types";

const card = "rounded-2xl border border-border bg-card p-5";

function Field({
  icon: Icon,
  color,
  title,
  right,
  children,
  className = "",
}: {
  icon: LucideIcon;
  color: string;
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={card + " " + className}>
      <div className="mb-4 flex items-center gap-2">
        <span
          className="grid h-[26px] w-[26px] place-items-center rounded-lg"
          style={{
            color,
            background: `color-mix(in srgb, ${color} 12.5490196078%, transparent)`,
          }}
        >
          <Icon size={15} />
        </span>
        <span className="text-[15px] font-semibold tracking-tight">
          {title}
        </span>
        {right && <span className="ml-auto">{right}</span>}
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
  const energyFill = {
    background: `linear-gradient(90deg,var(--primary) ${energy}%,var(--track) ${energy}%)`,
  };
  const sleepPct = ((sleep - 4) / 6) * 100;
  const sleepFill = {
    background: `linear-gradient(90deg,var(--metric-sleep) ${sleepPct}%,var(--track) ${sleepPct}%)`,
  };

  const save = () => {
    if (note.trim()) addEntry(note.trim(), mood);
    notify("Đã lưu ngày hôm nay ✓");
    setNote("");
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Field
          icon={Smile}
          color="var(--metric-mood)"
          title="Hôm nay bạn cảm thấy thế nào?"
        >
          <div className="mb-5 grid grid-cols-5 gap-2">
            {moodFaces.map((f, i) => (
              <button
                key={i}
                onClick={() => setMood((i + 1) as Mood)}
                className={
                  "flex flex-col items-center gap-1.5 rounded-xl border px-1 py-3 transition-colors " +
                  (mood === i + 1
                    ? "border-violet-500 bg-violet-500/10"
                    : "border-border hover:border-border-hover")
                }
              >
                <span
                  className={
                    "text-2xl transition-transform " +
                    (mood === i + 1 ? "scale-110" : "grayscale-[0.4]")
                  }
                >
                  {f}
                </span>
                <small
                  className={
                    "text-[11px] " +
                    (mood === i + 1 ? "text-violet-400" : "text-faint")
                  }
                >
                  {moodLabels[i]}
                </small>
              </button>
            ))}
          </div>
          <div className="mb-3 flex justify-between text-3xl">
            <span>Năng lượng</span>
            <span className="text-body">
              {energy}
              <span className="text-[12.5px] text-faint">/100</span>
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={energy}
            style={energyFill}
            onChange={(e) => setEnergy(+e.target.value)}
            className="los-range w-full"
          />
        </Field>

        <Field
          icon={Moon}
          color="var(--metric-sleep)"
          title="Giấc ngủ"
          right={<span className="text-[15px] font-bold">{sleepStr}</span>}
        >
          <input
            type="range"
            min={4}
            max={10}
            step={0.1}
            value={sleep}
            style={sleepFill}
            onChange={(e) => setSleep(+e.target.value)}
            className="los-range w-full"
          />
          <div className="mt-2 flex justify-between text-3xl text-faint">
            <span>4h</span>
            <span>7h</span>
            <span>10h</span>
          </div>
        </Field>

        <Field
          icon={Scale}
          color="var(--destructive)"
          title="Cân nặng"
          right={
            <span className="text-[15px] font-bold">
              {weight.toFixed(1)}{" "}
              <span className="text-sm font-medium text-faint">kg</span>
            </span>
          }
        >
          <div className="flex items-center justify-center gap-5 py-1.5">
            <button
              onClick={() => setWeight((w) => +(w - 0.1).toFixed(1))}
              className="grid h-[42px] w-[42px] place-items-center rounded-xl border border-border hover:border-primary hover:text-primary"
            >
              <Minus size={16} />
            </button>
            <div className="min-w-[120px] text-center text-3xl tracking-tight">
              {weight.toFixed(1)}
              <small className="ml-1 text-sm text-faint">kg</small>
            </div>
            <button
              onClick={() => setWeight((w) => +(w + 0.1).toFixed(1))}
              className="grid h-[42px] w-[42px] place-items-center rounded-xl border border-border hover:border-primary hover:text-primary"
            >
              <Plus size={16} />
            </button>
          </div>
        </Field>

        <Field
          icon={GlassWater}
          color="var(--metric-water)"
          title="Nước"
          right={
            <span className="text-[15px] font-bold">
              {(glasses * 0.25).toFixed(2)}{" "}
              <span className="text-[12.5px] text-faint">L</span>
            </span>
          }
        >
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <button
                key={i}
                onClick={() =>
                  updateRecord(todayKey, {
                    waterGlasses: i + 1 === glasses ? i : i + 1,
                  })
                }
                className={
                  "grid h-10 w-10 place-items-center rounded-lg border transition-colors " +
                  (i < glasses
                    ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                    : "border-border text-faint hover:border-cyan-500")
                }
              >
                <GlassWater size={20} />
              </button>
            ))}
          </div>
          <div className="mt-2.5 text-[11px] text-faint">
            Mục tiêu: 2.0 L · chạm vào từng ly để ghi lại
          </div>
        </Field>

        <div className="md:col-span-2">
          <HabitsCard habits={habits} toggle={toggle} />
        </div>

        <Field
          icon={PenLine}
          color="var(--primary)"
          title="Hôm nay của bạn thế nào?"
          className="md:col-span-2"
        >
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Một hoặc hai câu về hôm nay…"
            className="mb-3 min-h-[92px] w-full resize-y rounded-xl border border-border bg-transparent px-3.5 py-3 text-sm leading-relaxed outline-none placeholder:text-faint focus:border-primary"
          />
          <div className="text-[11px] text-faint">
            Ghi chú sau khi lưu sẽ tự động trở thành một mục trong Nhật ký.
          </div>
        </Field>
      </div>

      <div className="mt-5 flex justify-end">
        <Button onClick={save}>
          <Check size={17} strokeWidth={2.6} /> Lưu hôm nay
        </Button>
      </div>
    </>
  );
}
