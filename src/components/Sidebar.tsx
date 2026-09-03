import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  Heart,
  Activity,
  Lightbulb,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { PAGE_PATHS } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { PageId } from "@/types";

type NavItem = { icon: LucideIcon; label: PageId; labelVi: string; path: string };

export const navMain: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", labelVi: "Tổng quan", path: PAGE_PATHS.Dashboard },
  { icon: CalendarDays, label: "Today", labelVi: "Hôm nay", path: PAGE_PATHS.Today },
  { icon: BookOpen, label: "Journal", labelVi: "Nhật ký", path: PAGE_PATHS.Journal },
];
export const navAnalytics: NavItem[] = [
  { icon: Heart, label: "Health", labelVi: "Sức khoẻ", path: PAGE_PATHS.Health },
  { icon: Activity, label: "Productivity", labelVi: "Năng suất", path: PAGE_PATHS.Productivity },
];
export const navInsights: NavItem[] = [
  { icon: Lightbulb, label: "Insights", labelVi: "Phân tích", path: PAGE_PATHS.Insights },
];
export const allNav = [...navMain, ...navAnalytics, ...navInsights];

export function Sidebar() {
  const { pathname } = useLocation();

  const Item = ({ icon: Icon, labelVi, path }: NavItem) => (
    <Link
      to={path}
      className={cn(
        "flex items-center gap-[11px] rounded-[9px] px-[11px] py-[9px] text-left text-[13.5px] font-medium transition-colors",
        pathname === path
          ? "bg-primary/15 text-emerald-300"
          : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
      )}
    >
      <Icon size={18} strokeWidth={2} />
      <span>{labelVi}</span>
    </Link>
  );

  return (
    <aside className="flex w-[236px] shrink-0 flex-col bg-sidebar px-[14px] py-5">
      <div className="flex items-center gap-[11px] px-2 pb-[22px] pt-1.5">
        <div className="grid h-[34px] w-[34px] place-items-center rounded-[9px] bg-gradient-to-br from-teal-400 to-emerald-500">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2 L22 12 L12 22 L2 12 Z" fill="#fff" fillOpacity="0.95" />
          </svg>
        </div>
        <div>
          <div className="text-base font-bold tracking-tight text-white">Life OS</div>
          <div className="mt-px text-[11px] text-slate-500">Phân tích đời sống cá nhân</div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
        {navMain.map((n) => <Item key={n.label} {...n} />)}
        <div className="px-[11px] pb-1.5 pt-4 text-[10.5px] font-semibold uppercase tracking-[0.7px] text-slate-600">
          Phân tích
        </div>
        {navAnalytics.map((n) => <Item key={n.label} {...n} />)}
        <div className="px-[11px] pb-1.5 pt-4 text-[10.5px] font-semibold uppercase tracking-[0.7px] text-slate-600">
          Phân tích
        </div>
        {navInsights.map((n) => <Item key={n.label} {...n} />)}
      </nav>

      <div className="mt-2 flex items-center gap-2.5 border-t border-white/[0.06] px-2 pb-1 pt-[11px]">
        <div className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-semibold text-white">
          AN
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold text-slate-200">Alex Nguyen</div>
          <div className="truncate text-[11px] text-slate-500">alex@example.com</div>
        </div>
        <ChevronRight size={16} className="shrink-0 text-slate-600" />
      </div>
    </aside>
  );
}
