import { useState } from "react";
import { Loader2, LogOut, Menu, type LucideIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { getSessionUserDisplay, useAuth } from "@/features/auth";
import { navAnalytics, navInsights, navMain } from "@/components/Sidebar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { PageId } from "@/types";

type NavItem = {
  icon: LucideIcon;
  label: PageId;
  labelVi: string;
  path: string;
};

export function MobileNav() {
  const [open, setOpen] = useState(false);
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
      onClick={() => setOpen(false)}
      className={cn(
        "flex min-h-11 items-center gap-[11px] rounded-[9px] px-[11px] py-[9px] text-left text-[13.5px] font-medium transition-colors",
        pathname === path
          ? "bg-primary/15 text-emerald-300"
          : "text-slate-400 hover:bg-white/5 hover:text-slate-200",
      )}
    >
      <Icon size={18} strokeWidth={2} />
      <span>{labelVi}</span>
    </Link>
  );

  return (
    <div className="sticky top-0 z-40 border-b border-border bg-background lg:hidden">
      <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Mở menu"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <Menu size={22} />
        </button>
        <div className="min-w-0">
          <div className="truncate text-base font-bold tracking-tight text-foreground">
            Life OS
          </div>
        </div>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          className="flex w-[280px] flex-col border-border bg-sidebar p-0 text-foreground sm:max-w-[280px]"
        >
          <SheetHeader className="space-y-0 border-b border-white/[0.06] px-4 py-5 text-left">
            <div className="flex items-center gap-[11px]">
              <div className="grid h-[34px] w-[34px] place-items-center rounded-[9px] bg-gradient-to-br from-teal-400 to-emerald-500">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2 L22 12 L12 22 L2 12 Z"
                    fill="var(--primary-foreground)"
                    fillOpacity="0.95"
                  />
                </svg>
              </div>
              <div>
                <SheetTitle className="text-base font-bold tracking-tight text-white">
                  Life OS
                </SheetTitle>
                <div className="mt-px text-[11px] text-slate-500">
                  Phân tích đời sống cá nhân
                </div>
              </div>
            </div>
          </SheetHeader>

          <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-[14px] py-3">
            {navMain.map((n) => (
              <Item key={n.label} {...n} />
            ))}
            <div className="px-[11px] pb-1.5 pt-4 text-xs font-semibold uppercase tracking-[0.7px] text-slate-600">
              Phân tích
            </div>
            {navAnalytics.map((n) => (
              <Item key={n.label} {...n} />
            ))}
            <div className="px-[11px] pb-1.5 pt-4 text-xs font-semibold uppercase tracking-[0.7px] text-slate-600">
              Phân tích
            </div>
            {navInsights.map((n) => (
              <Item key={n.label} {...n} />
            ))}
          </nav>

          <div className="mt-auto flex items-center gap-2.5 border-t border-white/[0.06] px-4 pb-4 pt-[11px]">
            <div className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-semibold text-white">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold text-slate-200">
                {displayName}
              </div>
              <div className="truncate text-[11px] text-slate-500">{email}</div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              aria-label="Đăng xuất"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-md text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-200 disabled:opacity-60"
            >
              {signingOut ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <LogOut size={16} />
              )}
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
