import { useState } from "react";
import { Loader2, LogOut, Menu, type LucideIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { getSessionUserDisplay, useAuth } from "@/features/auth";
import { BrandLogo } from "@/components/BrandLogo";
import { allNav } from "@/components/Sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
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
          ? "bg-primary/15 text-primary"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      <Icon size={18} strokeWidth={2} />
      <span>{labelVi}</span>
    </Link>
  );

  return (
    <div className="sticky top-0 z-40 border-b border-border bg-background lg:hidden">
      <div className="flex h-14 items-center justify-between gap-2 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Mở menu"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Menu size={22} />
          </button>
          <BrandLogo size={28} />
        </div>
        <ThemeToggle className="h-11 w-11 shrink-0 hover:bg-accent" />
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          className="flex w-[280px] flex-col border-border bg-sidebar p-0 text-foreground sm:max-w-[280px]"
        >
          <SheetHeader className="space-y-0 border-b border-border px-4 py-5 text-left">
            <SheetTitle className="sr-only">Life OS</SheetTitle>
            <BrandLogo size={34} />
          </SheetHeader>

          <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-[14px] py-3">
            {allNav.map((n) => (
              <Item key={n.label} {...n} />
            ))}
          </nav>

          <div className="mt-auto flex items-center gap-2.5 border-t border-border px-4 pb-4 pt-[11px]">
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
              className="grid h-11 w-11 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-60"
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
