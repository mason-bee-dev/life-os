import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/calendar";

type HeaderProps = {
  title: string;
  subtitle: string;
  date: Date;
  onShift: (n: number) => void;
};

export function Header({ title, subtitle, date, onShift }: HeaderProps) {
  return (
    <header className="mb-5 flex flex-wrap items-start justify-between gap-3 sm:gap-4">
      <div className="min-w-0 flex-1">
        <h1 className="m-0 break-words text-xl font-bold tracking-tight sm:text-[26px]">
          {title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex min-h-11 flex-wrap items-center gap-1 rounded-lg border border-border bg-card px-1.5 py-1 text-[13.5px] font-semibold text-muted-foreground sm:gap-2.5 sm:px-2.5 sm:py-2">
        <button
          type="button"
          onClick={() => onShift(-1)}
          aria-label="Ngày trước"
          className="grid h-11 w-11 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="whitespace-nowrap px-1">{formatDate(date)}</span>
        <button
          type="button"
          onClick={() => onShift(1)}
          aria-label="Ngày sau"
          className="grid h-11 w-11 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </header>
  );
}
