import { useState } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  BookOpen,
  Heart,
  Moon,
  Activity,
  Lightbulb,
  Loader2,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { getSessionUserDisplay, useAuth } from "@/features/auth";
import { LogoMark } from "@/components/LogoMark";
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
  const { session, signOut } = useAuth();
  const { displayName, email, initials } = getSessionUserDisplay(session);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  };

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
      <div className="flex items-center gap-[11px] px-2 pb-[22px] pt-1.5">
        <LogoMark size={34} />
        <div>
          <div className="text-base font-bold tracking-tight text-foreground">
            Life OS
          </div>
          <div className="mt-px text-[11px] text-muted-foreground">
            Phân tích đời sống cá nhân
          </div>
        </div>
      </div>

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

      <div className="mt-2 flex items-center gap-2.5 border-t border-border px-2 pb-1 pt-[11px]">
        <div className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full bg-login-orb text-xs font-semibold text-primary-foreground">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-semibold text-foreground">
            {displayName}
          </div>
          <div className="truncate text-[11px] text-muted-foreground">
            {email}
          </div>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          aria-label="Đăng xuất"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-60"
        >
          {signingOut ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <LogOut size={16} />
          )}
        </button>
      </div>
    </aside>
  );
}
