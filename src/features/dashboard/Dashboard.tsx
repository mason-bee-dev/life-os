import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";
import {
  Zap, Smile, Moon, Target, ChevronLeft, ChevronRight, Heart, Activity,
  Dumbbell, Scale, Droplets, Coffee, Brain, Monitor, Clock, BookMarked, type LucideIcon,
} from "lucide-react";
import { Gauge } from "@/components/charts/Gauge";
import { Spark } from "@/components/charts/Spark";
import { Delta } from "@/components/charts/Delta";
import { MiniTrend } from "@/components/charts/MiniTrend";
import { HabitsCard } from "@/features/habits/HabitsCard";
import { TodosCard } from "@/features/todos/TodosCard";
import { insightItems } from "@/features/insights/data";
import { qColor } from "@/lib/calendar";
import { useDailyRecords } from "@/features/health/useDailyRecords";
import { sumCoffeeCups, sumWaterLiters } from "@/features/health/stats";
import { useNavigate } from "react-router-dom";
import type { Habit } from "@/features/habits/types";
import type { JournalEntry } from "@/features/journal/types";
import type { Todo } from "@/features/todos/types";
import {
  energyData, moodData, sleepData, prodData, weekData, calWeeks, quality,
} from "./data";

const card = "rounded-2xl border border-border bg-card p-[18px]";

/* ---------- stat cards ---------- */
function StatIcon({ icon: Icon, color }: { icon: LucideIcon; color: string }) {
  return (
    <span
      className="grid h-[26px] w-[26px] place-items-center rounded-lg"
      style={{ color, background: color + "1f" }}
    >
      <Icon size={15} />
    </span>
  );
}

function StatCards() {
  return (
    <div className="mb-5 grid grid-cols-[repeat(auto-fit,minmax(176px,1fr))] gap-4">
      {/* Life Score */}
      <div className={card + " flex min-h-[196px] flex-col"}>
        <div className="mb-2.5 flex items-center gap-2">
          <span className="text-[13.5px] font-semibold text-muted-foreground">Điểm sống</span>
        </div>
        <Gauge value={84} />
        <div className="mt-auto">
          <Delta dir="up" value="8.6% so với tuần trước" color="#10b981" />
        </div>
      </div>

      {/* Energy */}
      <div className={card + " flex min-h-[196px] flex-col"}>
        <div className="mb-2.5 flex items-center gap-2">
          <StatIcon icon={Zap} color="#10b981" />
          <span className="text-[13.5px] font-semibold text-muted-foreground">Năng lượng</span>
        </div>
        <div className="text-[26px] font-bold tracking-tight">
          82 <span className="text-sm font-medium text-faint">/100</span>
        </div>
        <div className="mt-0.5 text-[12.5px] font-semibold text-primary">Tốt</div>
        <Spark data={energyData} color="#10b981" />
      </div>

      {/* Mood */}
      <div className={card + " flex min-h-[196px] flex-col"}>
        <div className="mb-2.5 flex items-center gap-2">
          <StatIcon icon={Smile} color="#8b5cf6" />
          <span className="text-[13.5px] font-semibold text-muted-foreground">Tâm trạng</span>
        </div>
        <div className="text-[26px] font-bold tracking-tight">Tốt</div>
        <div className="mt-0.5 text-[12.5px] font-semibold text-muted-foreground">4.2 / 5</div>
        <Spark data={moodData} color="#8b5cf6" />
      </div>

      {/* Sleep */}
      <div className={card + " flex min-h-[196px] flex-col"}>
        <div className="mb-2.5 flex items-center gap-2">
          <StatIcon icon={Moon} color="#3b82f6" />
          <span className="text-[13.5px] font-semibold text-muted-foreground">Giấc ngủ</span>
        </div>
        <div className="text-[26px] font-bold tracking-tight">7h 12m</div>
        <div className="mt-0.5">
          <Delta dir="up" value="24m so với hôm qua" color="#3b82f6" />
        </div>
        <Spark data={sleepData} color="#3b82f6" />
      </div>

      {/* Productivity */}
      <div className={card + " flex min-h-[196px] flex-col"}>
        <div className="mb-2.5 flex items-center gap-2">
          <StatIcon icon={Target} color="#f59e0b" />
          <span className="text-[13.5px] font-semibold text-muted-foreground">Năng suất</span>
        </div>
        <div className="text-[26px] font-bold tracking-tight">
          76 <span className="text-sm font-medium text-faint">/100</span>
        </div>
        <div className="mt-0.5">
          <Delta dir="up" value="5.1% so với tuần trước" color="#f59e0b" />
        </div>
        <Spark data={prodData} color="#f59e0b" />
      </div>

      {/* Skeleton */}
      <div className={card + " flex min-h-[196px] flex-col justify-center gap-3"}>
        {[45, 80, 65, 72, 50].map((w, i) => (
          <div key={i} className="h-[11px] rounded-md bg-[#1a2338]" style={{ width: w + "%" }} />
        ))}
      </div>
    </div>
  );
}

/* ---------- score chart ---------- */
function ChartTooltip({ active, payload }: { active?: boolean; payload?: any[] }) {
  if (active && payload && payload.length) {
    const p = payload[0].payload;
    return (
      <div className="rounded-[9px] border border-[#2a3752] bg-card px-[11px] py-[7px] shadow-[0_6px_20px_rgba(0,0,0,0.4)]">
        <div className="mb-0.5 text-[11.5px] text-muted-foreground">{p.date}</div>
        <div className="text-base font-bold">{p.v}</div>
      </div>
    );
  }
  return null;
}

function ScoreChart() {
  return (
    <div className={card + " flex flex-col"}>
      <div className="mb-3.5 flex items-center justify-between">
        <span className="text-[15px] font-semibold tracking-tight">Điểm sống — Tuần này</span>
        <div className="rounded-lg border border-border px-2.5 py-[5px] text-[12.5px] font-semibold text-muted-foreground">
          Tuần này ▾
        </div>
      </div>
      <div className="-mx-1.5 h-[214px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={weekData} margin={{ top: 16, right: 8, left: -18, bottom: 0 }}>
            <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "#5c6b85", fontSize: 12 }} dy={6} />
            <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickLine={false} axisLine={false} tick={{ fill: "#5c6b85", fontSize: 12 }} width={40} />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#2a3752", strokeDasharray: "4 4" }} />
            <Line type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={2.6}
              dot={{ r: 3.5, fill: "#0f1626", stroke: "#3b82f6", strokeWidth: 2 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2 border-t border-border pt-3.5 text-center">
        <div><div className="text-[17px] font-bold tracking-tight">74</div><div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-faint">ĐIỂM TB</div></div>
        <div><div className="text-[17px] font-bold tracking-tight text-primary">↑8.6%</div><div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-faint">SO VỚI TUẦN TRƯỚC</div></div>
        <div><div className="text-[17px] font-bold tracking-tight">5</div><div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-faint">CHUỖI DÀI NHẤT</div></div>
        <div><div className="text-[17px] font-bold tracking-tight">2</div><div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-faint">NGÀY THẤP ĐIỂM</div></div>
      </div>
    </div>
  );
}

/* ---------- calendar ---------- */
function Calendar() {
  const dow = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  return (
    <div className={card}>
      <div className="mb-3.5 flex items-center justify-between">
        <span className="text-[15px] font-semibold tracking-tight">Tháng 8/2026</span>
        <div className="flex gap-0.5">
          <button className="rounded-md p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"><ChevronLeft size={16} /></button>
          <button className="rounded-md p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"><ChevronRight size={16} /></button>
        </div>
      </div>
      <div className="mb-1.5 grid grid-cols-7 gap-0.5">
        {dow.map((d) => <span key={d} className="text-center text-[11px] font-semibold text-faint">{d}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {calWeeks.map((week, wi) =>
          week.map((day, di) => {
            const isAug = !(wi === 0 && day > 20) && !(wi === 5 && day < 10);
            const isToday = wi === 5 && day === 31;
            const q = isAug ? quality[day] : null;
            return (
              <div
                key={wi + "-" + di}
                className={
                  "relative grid aspect-square place-items-center rounded-[9px] text-[12.5px] font-medium " +
                  (isToday ? "bg-blue-500 font-bold text-white " : "") +
                  (!isAug ? "text-faint opacity-55" : "")
                }
              >
                <span>{day}</span>
                {q && !isToday && (
                  <i className="absolute bottom-[5px] h-[5px] w-[5px] rounded-full" style={{ background: qColor[q] }} />
                )}
              </div>
            );
          })
        )}
      </div>
      <div className="mt-3.5 flex flex-wrap gap-x-3.5 gap-y-2.5 border-t border-border pt-3.5">
        {(["low", "avg", "good", "exc"] as const).map((k) => (
          <span key={k} className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
            <i className="h-2 w-2 rounded-full" style={{ background: qColor[k] }} />
            {{ low: "Thấp", avg: "Trung bình", good: "Tốt", exc: "Xuất sắc" }[k]}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- overview cards ---------- */
type OverviewRow = {
  ricon: LucideIcon;
  label: string;
  value: string;
  delta?: { dir: "up" | "down"; value: string; color: string };
};
function OverviewCard({
  icon: Icon, iconColor, title, rows, link, onLinkClick,
}: {
  icon: LucideIcon;
  iconColor: string;
  title: string;
  rows: OverviewRow[];
  link: string;
  onLinkClick?: () => void;
}) {
  return (
    <div className={card}>
      <div className="mb-3.5 flex items-center gap-[9px]">
        <span className="grid h-[26px] w-[26px] place-items-center rounded-lg" style={{ color: iconColor, background: iconColor + "20" }}>
          <Icon size={15} />
        </span>
        <span className="text-[15px] font-semibold tracking-tight">{title}</span>
      </div>
      <div className="flex flex-col">
        {rows.map((r) => {
          const RIcon = r.ricon;
          return (
            <div key={r.label} className="flex items-center gap-[9px] border-b border-border py-2 last:border-b-0">
              <span className="grid place-items-center text-faint"><RIcon size={14} /></span>
              <span className="flex-1 text-[13px] text-muted-foreground">{r.label}</span>
              <span className="text-[13px] font-semibold">{r.value}</span>
              {r.delta && <Delta {...r.delta} />}
            </div>
          );
        })}
      </div>
      <button
        className="mt-3.5 text-[12.5px] font-semibold text-blue-500 hover:underline"
        onClick={onLinkClick}
      >
        {link} →
      </button>
    </div>
  );
}

/* ---------- top insights preview ---------- */
function InsightsPreview() {
  return (
    <div className={card + " flex flex-col"}>
      <div className="mb-3.5 flex items-center justify-between">
        <span className="text-[15px] font-semibold tracking-tight">Phân tích nổi bật</span>
        <button className="text-[12.5px] font-semibold text-blue-500 hover:underline">Xem tất cả</button>
      </div>
      {insightItems.map((it) => {
        const Icon = it.icon;
        return (
          <div key={it.title} className="mb-[11px] flex items-center gap-[11px] rounded-xl p-[13px] last:mb-0" style={{ background: it.bg }}>
            <span className="grid h-[26px] w-[26px] place-items-center rounded-lg bg-card" style={{ color: it.color }}>
              <Icon size={15} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="mb-0.5 text-[13px] font-bold">{it.title}</div>
              <div className="text-xs leading-snug text-muted-foreground">{it.text}</div>
            </div>
            <MiniTrend color={it.color} />
          </div>
        );
      })}
    </div>
  );
}

/* ---------- page ---------- */
type DashboardProps = {
  habits: Habit[];
  toggle: (index: number) => void;
  journal: JournalEntry[];
  todos: Todo[];
  toggleTodo: (id: number) => void;
};

export function Dashboard({ habits, toggle, journal, todos, toggleTodo }: DashboardProps) {
  const navigate = useNavigate();
  const { todayKey, getRecord } = useDailyRecords();
  const yesterdayKey = dayjs(todayKey).subtract(1, "day").format("YYYY-MM-DD");
  const todayRecord = getRecord(todayKey);
  const yesterdayWater = getRecord(yesterdayKey).waterGlasses;
  const waterLiters = sumWaterLiters([todayRecord]);
  const coffeeCups = sumCoffeeCups([todayRecord]);

  let waterDelta: OverviewRow["delta"];
  if (yesterdayWater != null) {
    const diff = waterLiters - yesterdayWater * 0.25;
    if (diff !== 0) {
      waterDelta = {
        dir: diff > 0 ? "up" : "down",
        value: `${Math.abs(diff).toFixed(2)} L`,
        color: diff > 0 ? "#10b981" : "#ef4444",
      };
    }
  }

  const latest = journal[0];
  return (
    <>
      <StatCards />
      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-5">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
            <HabitsCard habits={habits} toggle={toggle} />
            <ScoreChart />
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <OverviewCard
              icon={Heart} iconColor="#ef4444" title="Tổng quan sức khoẻ" link="Xem tất cả chỉ số sức khoẻ"
              onLinkClick={() => navigate("/health")}
              rows={[
                { ricon: Moon, label: "Giấc ngủ", value: "7h 08m", delta: { dir: "up", value: "12m", color: "#10b981" } },
                { ricon: Dumbbell, label: "Vận động", value: "4 / 7 ngày", delta: { dir: "up", value: "1 ngày", color: "#10b981" } },
                { ricon: Scale, label: "Cân nặng", value: "68.4 kg", delta: { dir: "down", value: "0.3 kg", color: "#10b981" } },
                { ricon: Droplets, label: "Nước", value: `${waterLiters.toFixed(2)} L`, delta: waterDelta },
                { ricon: Coffee, label: "Cà phê", value: `${coffeeCups} cốc` },
              ]}
            />
            <OverviewCard
              icon={Activity} iconColor="#8b5cf6" title="Tổng quan năng suất" link="Xem tất cả chỉ số năng suất"
              onLinkClick={() => navigate("/productivity")}
              rows={[
                { ricon: Target, label: "Tập trung sâu", value: "4h 12m", delta: { dir: "up", value: "22m", color: "#10b981" } },
                { ricon: Clock, label: "Giờ làm việc", value: "7h 38m", delta: { dir: "down", value: "1h 02m", color: "#ef4444" } },
                { ricon: Brain, label: "Học tập", value: "1h 45m", delta: { dir: "up", value: "30m", color: "#10b981" } },
                { ricon: Monitor, label: "Thời gian màn hình", value: "6h 20m", delta: { dir: "down", value: "45m", color: "#10b981" } },
              ]}
            />
          </div>

          <div className={card}>
            <div className="mb-2.5 flex items-center justify-between">
              <span className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
                <BookMarked size={16} className="text-muted-foreground" /> Ghi chú nhật ký gần nhất
              </span>
              <div className="flex items-center gap-3.5">
                <span className="text-[12.5px] text-muted-foreground">{latest?.date}</span>
                <button className="text-[12.5px] font-semibold text-blue-500 hover:underline">Xem tất cả →</button>
              </div>
            </div>
            <p className="m-0 text-[13.5px] leading-relaxed text-muted-foreground">{latest?.text}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-2 xl:grid-cols-1">
          <Calendar />
          <TodosCard
            compact
            todos={todos}
            onToggle={toggleTodo}
            onEdit={() => {}}
            onDelete={() => {}}
          />
          <InsightsPreview />
        </div>
      </div>
    </>
  );
}
