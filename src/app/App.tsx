import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Header } from "@/components/Header";
import { ComingSoon } from "@/components/ComingSoon";
import { ToastProvider } from "@/components/ui/toast";
import { usePersistentState } from "@/hooks/usePersistentState";
import { pageIdFromPath } from "@/lib/routes";
import { AuthProvider, useAuth } from "@/features/auth/AuthProvider";
import { Login } from "@/features/auth/Login";
import { RequireAuth } from "@/features/auth/RequireAuth";
import { Dashboard } from "@/features/dashboard/Dashboard";
import { Today } from "@/features/today/Today";
import { Journal } from "@/features/journal/Journal";
import { Insights } from "@/features/insights/Insights";
import { Health } from "@/features/health/Health";
import { Sleep } from "@/features/sleep/Sleep";
import { Todos } from "@/features/todos/Todos";
import { useTodos } from "@/features/todos/useTodos";
import { MigrateLocalData } from "@/features/settings-temp/MigrateLocalData";
import { defaultHabits } from "@/features/habits/data";
import { defaultJournal } from "@/features/journal/data";
import type { Habit } from "@/features/habits/types";
import type { JournalEntry, Mood } from "@/features/journal/types";
import type { PageId } from "@/types";

const headers: Record<string, { title: string; sub: string }> = {
  Dashboard: {
    title: "Chào buổi sáng, Alex 👋",
    sub: "Đây là tình hình cuộc sống của bạn hôm nay.",
  },
  Today: {
    title: "Hôm nay",
    sub: "Ghi lại một ngày của bạn — chỉ mất một phút.",
  },
  Todos: {
    title: "Công việc",
    sub: "Danh sách việc cần làm — ưu tiên và hoàn thành.",
  },
  Journal: { title: "Nhật ký", sub: "Những suy nghĩ của bạn, từng ngày." },
  Insights: {
    title: "Phân tích",
    sub: "Những xu hướng mà số liệu đang cho thấy.",
  },
};

function AppInner() {
  const { pathname } = useLocation();
  const active: PageId = pageIdFromPath(pathname);
  const [habits, setHabits] = usePersistentState<Habit[]>(
    "habits",
    defaultHabits,
  );
  const [journal, setJournal] = usePersistentState<JournalEntry[]>(
    "journal",
    defaultJournal,
  );
  const { todos, addTodo, updateTodo, deleteTodo, toggleTodo } = useTodos();

  const toggle = (i: number) =>
    setHabits((hs) =>
      hs.map((h, idx) => (idx === i ? { ...h, done: !h.done } : h)),
    );

  const addEntry = (text: string, mood: Mood, tags: string[] = []) =>
    setJournal((j) => [
      {
        id: Date.now(),
        date: "31/08/2026",
        mood,
        tags,
        text,
        sleep: "7h 12m",
        exercise: "5.2 km",
      },
      ...j,
    ]);

  const h =
    pathname === "/migrate-local-data"
      ? {
          title: "Migrate dữ liệu",
          sub: "Chuyển DailyRecords từ localStorage sang Supabase.",
        }
      : (headers[active] ?? {
          title:
            active === "Health"
              ? "Thói quen"
              : active === "Sleep"
                ? "Giấc ngủ"
                : active === "Productivity"
                  ? "Năng suất"
                  : active,
          sub:
            active === "Health"
              ? "Theo dõi thói quen cá nhân."
              : active === "Sleep"
                ? "Giấc ngủ đêm và ngủ trưa — thống kê theo kỳ."
                : "Sắp ra mắt",
        });

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <AppHeader />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <MobileNav />
          <main className="flex-1 overflow-y-auto px-4 pb-[60px] pt-4 sm:px-6 lg:px-8 lg:pt-[26px]">
            <Header title={h.title} subtitle={h.sub} />
            <Routes>
              <Route
                path="/"
                element={
                  <Dashboard
                    habits={habits}
                    toggle={toggle}
                    journal={journal}
                    todos={todos}
                    toggleTodo={toggleTodo}
                  />
                }
              />
              <Route
                path="/today"
                element={
                  <Today habits={habits} toggle={toggle} addEntry={addEntry} />
                }
              />
              <Route
                path="/todos"
                element={
                  <Todos
                    todos={todos}
                    addTodo={addTodo}
                    updateTodo={updateTodo}
                    deleteTodo={deleteTodo}
                    toggleTodo={toggleTodo}
                  />
                }
              />
              <Route
                path="/journal"
                element={<Journal journal={journal} addEntry={addEntry} />}
              />
              <Route path="/health" element={<Health />} />
              <Route path="/sleep" element={<Sleep />} />
              <Route
                path="/productivity"
                element={<ComingSoon label="Productivity" />}
              />
              <Route path="/insights" element={<Insights />} />
              <Route
                path="/migrate-local-data"
                element={<MigrateLocalData />}
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
}

function PublicLoginRoute() {
  const { session, loading } = useAuth();
  if (loading) {
    return (
      <div className="grid h-screen place-items-center bg-background text-sm text-muted-foreground">
        Đang tải…
      </div>
    );
  }
  if (session) return <Navigate to="/" replace />;
  return <Login />;
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<PublicLoginRoute />} />
          <Route element={<RequireAuth />}>
            <Route path="/*" element={<AppInner />} />
          </Route>
        </Routes>
      </AuthProvider>
    </ToastProvider>
  );
}
