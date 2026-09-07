import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 12 }, (_, i) =>
  String(i * 5).padStart(2, "0"),
);

function nowHhMm(): string {
  return dayjs().format("HH:mm");
}

function parseParts(value: string | null): { h: string; m: string } {
  if (!value) return { h: "22", m: "00" };
  const [h = "22", m = "00"] = value.split(":");
  const minuteNum = Number(m);
  const nearest = String(Math.round(minuteNum / 5) * 5).padStart(2, "0");
  const safeM = nearest === "60" ? "55" : nearest;
  return { h: h.padStart(2, "0"), m: safeM };
}

type Props = {
  value: string | null;
  onChange: (v: string) => void;
  label?: string;
  className?: string;
};

export function TimeField({ value, onChange, label, className }: Props) {
  const [open, setOpen] = useState(false);
  const parts = useMemo(() => parseParts(value), [value]);

  const setNow = () => {
    onChange(nowHhMm());
    setOpen(false);
  };

  const pick = (h: string, m: string) => {
    onChange(`${h}:${m}`);
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && <Label>{label}</Label>}
      <div className="flex items-center gap-1.5">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex h-9 min-w-[5.5rem] flex-1 items-center justify-center rounded-md border border-input bg-transparent px-3 text-body shadow-sm transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                value ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {value ?? "Chọn giờ"}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="start">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="mb-3 w-full"
              onClick={setNow}
            >
              <Clock className="size-3.5" />
              Bây giờ
            </Button>
            <div className="flex gap-2">
              <div className="flex flex-col">
                <div className="mb-1 text-center text-[11px] text-muted-foreground">
                  Giờ
                </div>
                <div className="h-40 w-14 overflow-y-auto rounded-md border border-border">
                  {HOURS.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => pick(h, parts.m)}
                      className={cn(
                        "flex w-full items-center justify-center py-1.5 text-[13px] transition-colors",
                        parts.h === h && value
                          ? "bg-primary/15 font-semibold text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col">
                <div className="mb-1 text-center text-[11px] text-muted-foreground">
                  Phút
                </div>
                <div className="h-40 w-14 overflow-y-auto rounded-md border border-border">
                  {MINUTES.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => pick(parts.h, m)}
                      className={cn(
                        "flex w-full items-center justify-center py-1.5 text-[13px] transition-colors",
                        parts.m === m && value
                          ? "bg-primary/15 font-semibold text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0"
          title="Bây giờ"
          aria-label="Bây giờ"
          onClick={setNow}
        >
          <Clock className="size-4" />
        </Button>
      </div>
    </div>
  );
}
