import type { Period } from "./types";

const tabs: { value: Period; label: string }[] = [
  { value: "day", label: "Ngày" },
  { value: "week", label: "Tuần" },
  { value: "month", label: "Tháng" },
  { value: "year", label: "Năm" },
];

type Props = { value: Period; onChange: (p: Period) => void };

export function PeriodTabs({ value, onChange }: Props) {
  return (
    <div className="flex gap-1">
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={
            "rounded-lg border px-2.5 py-[5px] text-[12.5px] font-semibold transition-colors " +
            (value === t.value
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:border-primary hover:text-primary")
          }
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
