export type StatCard = {
  label: string;
  value: string;
  sub?: string | null;
};

type Props = {
  cards: StatCard[];
  /** Tailwind grid cols at xl breakpoint; default matches card count up to 5. */
  columns?: 2 | 3 | 4 | 5;
};

const xlCols: Record<2 | 3 | 4 | 5, string> = {
  2: "xl:grid-cols-2",
  3: "xl:grid-cols-3",
  4: "xl:grid-cols-4",
  5: "xl:grid-cols-5",
};

/** Aggregate metric cards for tracker pages. */
export function StatsCards({ cards, columns }: Props) {
  const xl =
    columns != null
      ? xlCols[columns]
      : cards.length >= 5
        ? xlCols[5]
        : cards.length === 4
          ? xlCols[4]
          : xlCols[3];

  return (
    <div className={`grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 ${xl}`}>
      {cards.map((card) => (
        <div
          key={card.label}
          className="flex min-w-0 flex-col gap-1 rounded-2xl border border-border bg-card p-4 md:p-5"
        >
          <div className="text-[12.5px] text-muted-foreground">{card.label}</div>
          <div className="text-[20px] font-semibold tabular-nums tracking-tight md:text-[22px]">
            {card.value}
          </div>
          {card.sub ? (
            <div className="text-[13px] tabular-nums text-muted-foreground">
              {card.sub}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
