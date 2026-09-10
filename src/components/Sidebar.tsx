import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  BookOpen,
  Heart,
  Moon,
  Activity,
  Lightbulb,
  type LucideIcon,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { PAGE_PATHS } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { PageId } from "@/types";

type NavItem = {
  icon: LucideIcon;
  label: PageId;
  labelVi: string;
  path: string;
};

export const navMain: NavItem[] = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    labelVi: "Tổng quan",
    path: PAGE_PATHS.Dashboard,
  },
  {
    icon: CalendarDays,
    label: "Today",
    labelVi: "Hôm nay",
    path: PAGE_PATHS.Today,
  },
  {
    icon: CheckSquare,
    label: "Todos",
    labelVi: "Công việc",
    path: PAGE_PATHS.Todos,
  },
  {
    icon: BookOpen,
    label: "Journal",
    labelVi: "Nhật ký",
    path: PAGE_PATHS.Journal,
  },
];
export const navAnalytics: NavItem[] = [
  {
    icon: Heart,
    label: "Health",
    labelVi: "Sức khoẻ",
    path: PAGE_PATHS.Health,
  },
  { icon: Moon, label: "Sleep", labelVi: "Giấc ngủ", path: PAGE_PATHS.Sleep },
  {
    icon: Activity,
    label: "Productivity",
    labelVi: "Năng suất",
    path: PAGE_PATHS.Productivity,
  },
];
export const navInsights: NavItem[] = [
  {
    icon: Lightbulb,
    label: "Insights",
    labelVi: "Phân tích",
    path: PAGE_PATHS.Insights,
  },
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
          ? "bg-primary/15 text-primary"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      <Icon size={18} strokeWidth={2} />
      <span>{labelVi}</span>
    </Link>
  );

  return (
    <aside className="hidden w-[236px] shrink-0 flex-col bg-sidebar px-[14px] py-5 lg:flex">
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
        {navMain.map((n) => (
          <Item key={n.label} {...n} />
        ))}
        <div className="px-[11px] pb-1.5 pt-4 text-xs font-semibold uppercase tracking-[0.7px] text-faint">
          Phân tích
        </div>
        {navAnalytics.map((n) => (
          <Item key={n.label} {...n} />
        ))}
        <div className="px-[11px] pb-1.5 pt-4 text-xs font-semibold uppercase tracking-[0.7px] text-faint">
          Phân tích
        </div>
        {navInsights.map((n) => (
          <Item key={n.label} {...n} />
        ))}
      </nav>
    </aside>
  );
}
