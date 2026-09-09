import dayjs from "dayjs";

type Props = {
  date: string;
  todayKey: string;
};

const WEEKDAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"] as const;

/** Shared table date: `T2 - 09/09/26` (+ ` - (Hôm nay|Hôm qua)` when applicable). */
export function RelativeDateCell({ date, todayKey }: Props) {
  const d = dayjs(date);
  const weekday = WEEKDAY_LABELS[d.day()];
  const formatted = d.format("DD/MM/YY");
  const base = `${weekday} - ${formatted}`;
  const yesterdayKey = dayjs(todayKey).subtract(1, "day").format("YYYY-MM-DD");

  if (date === todayKey) {
    return (
      <>
        {base}
        {"  "}
        <span className="font-medium text-primary">(Hôm nay)</span>
      </>
    );
  }

  if (date === yesterdayKey) {
    return (
      <>
        {base}
        {"  "}
        <span className="text-muted-foreground">(Hôm qua)</span>
      </>
    );
  }

  return <>{base}</>;
}
