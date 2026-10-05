import { useEffect, useRef, useState } from "react";
import { Eye, Moon, Plus, type LucideIcon } from "lucide-react";
import { useQuickSleepActions } from "@/features/sleep/useQuickSleepActions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type ActionItem = {
  label: string;
  icon: LucideIcon;
  onClick: () => boolean;
};

export function QuickActionsFab() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const { busy, addNightSleepNow, addNightWakingNow } = useQuickSleepActions();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const run = (action: () => boolean) => {
    if (action()) setOpen(false);
  };

  const items: ActionItem[] = [
    { label: "Thêm giấc ngủ đêm", icon: Moon, onClick: addNightSleepNow },
    { label: "Dậy đêm", icon: Eye, onClick: addNightWakingNow },
  ];

  return (
    <TooltipProvider delayDuration={200}>
      <div
        ref={rootRef}
        className="pointer-events-none fixed bottom-5 right-5 z-40 flex flex-col-reverse items-center gap-3"
      >
        <button
          type="button"
          aria-label={open ? "Đóng tiện ích" : "Tiện ích nhanh"}
          aria-expanded={open}
          disabled={busy}
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "pointer-events-auto grid size-11 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_6px_18px_var(--shadow-color-35)] transition-transform hover:bg-primary/90 disabled:opacity-60",
            open && "rotate-45",
          )}
        >
          <Plus size={18} strokeWidth={2} />
        </button>

        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <Tooltip key={item.label}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label={item.label}
                  tabIndex={open ? 0 : -1}
                  aria-hidden={!open}
                  disabled={busy}
                  onClick={() => {
                    if (!open) return;
                    run(item.onClick);
                  }}
                  style={{ transitionDelay: open ? `${i * 40}ms` : "0ms" }}
                  className={cn(
                    "pointer-events-auto grid size-11 place-items-center rounded-full border border-border bg-card text-foreground shadow-[0_6px_18px_var(--shadow-color-35)] transition-all hover:border-primary hover:text-primary disabled:opacity-60",
                    open
                      ? "translate-y-0 scale-100 opacity-100"
                      : "pointer-events-none translate-y-2 scale-90 opacity-0",
                  )}
                >
                  <Icon size={18} strokeWidth={2} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left">{item.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
