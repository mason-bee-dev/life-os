import { useState } from "react";
import { Loader2, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { getSessionUserDisplay, useAuth } from "@/features/auth";
import { BrandLogo } from "@/components/BrandLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PAGE_PATHS } from "@/lib/routes";

export function AppHeader() {
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

  return (
    <header className="sticky top-0 z-40 hidden shrink-0 items-center justify-between border-b border-border bg-background px-4 py-2.5 lg:flex lg:px-5">
      <Link to={PAGE_PATHS.Dashboard} className="min-w-0">
        <BrandLogo size={34} />
      </Link>

      <div className="flex items-center gap-2.5">
        <div className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full bg-login-orb text-xs font-semibold text-primary-foreground">
          {initials}
        </div>
        <div className="min-w-0">
          <div className="truncate text-[13px] font-semibold text-foreground">
            {displayName}
          </div>
          <div className="max-w-[180px] truncate text-[11px] text-muted-foreground">
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
        <ThemeToggle />
      </div>
    </header>
  );
}
