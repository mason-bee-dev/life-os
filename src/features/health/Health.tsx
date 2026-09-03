import { WaterTracker } from "./WaterTracker";
import { CoffeeTracker } from "./CoffeeTracker";
import { PersonalHabits } from "./PersonalHabits";

const card = "rounded-2xl border border-border bg-card p-[18px]";

export function Health() {
  return (
    <div className="flex flex-col gap-5">
      <div className={card}><WaterTracker /></div>
      <div className={card}><CoffeeTracker /></div>
      <div className={card}><PersonalHabits /></div>
    </div>
  );
}
