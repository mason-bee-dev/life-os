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
    <header className="mb-5 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="m-0 text-[26px] font-bold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-2.5 py-2 text-[13.5px] font-semibold text-muted-foreground">
        <button
          onClick={() => onShift(-1)}
          className="grid place-items-center rounded-md p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <ChevronLeft size={16} />
        </button>
        <span>{formatDate(date)}</span>
        <button
          onClick={() => onShift(1)}
          className="grid place-items-center rounded-md p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </header>
  );
}
