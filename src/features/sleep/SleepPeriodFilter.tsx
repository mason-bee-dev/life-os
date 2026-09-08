import type { Period } from "./types";

const options: { value: Period; label: string }[] = [
  { value: "day", label: "Ngày" },
  { value: "week", label: "Tuần" },
  { value: "month", label: "Tháng" },
];

type Props = {
  value: Period;
  onChange: (p: Period) => void;
};

export function SleepPeriodFilter({ value, onChange }: Props) {
  return (
    <div className="flex gap-1">
      {options.map((t) => (
        <button
          key={t.value}
          type="button"
          onClick={() => onChange(t.value)}
          className={
            "rounded-lg border px-2.5 py-1 text-[12.5px] font-semibold transition-colors " +
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
