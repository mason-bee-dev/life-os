import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { ComingSoon } from "@/components/ComingSoon";
import { ToastProvider } from "@/components/ui/toast";
import { usePersistentState } from "@/hooks/usePersistentState";
import { DEMO_TODAY, shiftDate } from "@/lib/calendar";
import { Dashboard } from "@/features/dashboard/Dashboard";
import { Today } from "@/features/today/Today";
import { Journal } from "@/features/journal/Journal";
import { Insights } from "@/features/insights/Insights";
import { defaultHabits } from "@/features/habits/data";
import { defaultJournal } from "@/features/journal/data";
import type { Habit } from "@/features/habits/types";
import type { JournalEntry, Mood } from "@/features/journal/types";
import type { PageId } from "@/types";

const headers: Record<string, { title: string; sub: string }> = {
  Dashboard: { title: "Chào buổi sáng, Alex 👋", sub: "Đây là tình hình cuộc sống của bạn hôm nay." },
  Today: { title: "Hôm nay", sub: "Ghi lại một ngày của bạn — chỉ mất một phút." },
  Journal: { title: "Nhật ký", sub: "Những suy nghĩ của bạn, từng ngày." },
  Insights: { title: "Phân tích", sub: "Những xu hướng mà số liệu đang cho thấy." },
};

function AppInner() {
  const [active, setActive] = useState<PageId>("Dashboard");
  const [date, setDate] = useState<Date>(DEMO_TODAY);
  const [habits, setHabits] = usePersistentState<Habit[]>("habits", defaultHabits);
  const [journal, setJournal] = usePersistentState<JournalEntry[]>("journal", defaultJournal);

  const toggle = (i: number) =>
    setHabits((hs) => hs.map((h, idx) => (idx === i ? { ...h, done: !h.done } : h)));

  const addEntry = (text: string, mood: Mood, tags: string[] = []) =>
    setJournal((j) => [
      { id: Date.now(), date: "31/08/2026", mood, tags, text, sleep: "7h 12m", exercise: "5.2 km" },
      ...j,
    ]);

  const shift = (n: number) => setDate((d) => shiftDate(d, n));

  const h =
    headers[active] ?? {
      title: active === "Health" ? "Sức khoẻ" : active === "Productivity" ? "Năng suất" : active,
      sub: "Sắp ra mắt",
    };

  const page =
    active === "Dashboard" ? <Dashboard habits={habits} toggle={toggle} journal={journal} /> :
    active === "Today" ? <Today habits={habits} toggle={toggle} addEntry={addEntry} /> :
    active === "Journal" ? <Journal journal={journal} addEntry={addEntry} /> :
    active === "Insights" ? <Insights /> :
    <ComingSoon label={active} />;

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar active={active} setActive={setActive} />
      <main className="flex-1 overflow-y-auto px-[30px] pb-[60px] pt-[26px]">
        <Header title={h.title} subtitle={h.sub} date={date} onShift={shift} />
        {page}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  );
}
