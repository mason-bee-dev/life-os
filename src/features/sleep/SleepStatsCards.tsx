type StatCard = {
  label: string;
  value: string;
  sub?: string | null;
};

type Props = {
  cards: StatCard[];
};

export function SleepStatsCards({ cards }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
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
