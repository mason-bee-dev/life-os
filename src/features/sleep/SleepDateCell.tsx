import dayjs from "dayjs";

type Props = {
  date: string;
  todayKey: string;
};

export function SleepDateCell({ date, todayKey }: Props) {
  const formatted = dayjs(date).format("DD/MM/YYYY");
  const yesterdayKey = dayjs(todayKey).subtract(1, "day").format("YYYY-MM-DD");

  if (date === todayKey) {
    return (
      <>
        {formatted}{" "}
        <span className="font-medium text-primary">(Hôm nay)</span>
      </>
    );
  }

  if (date === yesterdayKey) {
    return (
      <>
        {formatted}{" "}
        <span className="text-muted-foreground">(Hôm qua)</span>
      </>
    );
  }

  return <>{formatted}</>;
}
