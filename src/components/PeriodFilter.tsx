type PeriodOption<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  value: T;
  onChange: (value: T) => void;
  options: readonly PeriodOption<T>[];
};

/** Segmented period / filter chips — shared tracker toolbar control. */
export function PeriodFilter<T extends string>({
  value,
  onChange,
  options,
}: Props<T>) {
  return (
    <div className="flex gap-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={
            "rounded-lg border px-2.5 py-1 text-[12.5px] font-semibold transition-colors " +
            (value === opt.value
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:border-primary hover:text-primary")
          }
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
