import { TabsContent } from "@/components/ui/tabs";
import { UrlTabs } from "@/components/UrlTabs";
import { DrinkTracker } from "./DrinkTracker";
import { PersonalHabits } from "./PersonalHabits";
import { WaterTracker } from "./WaterTracker";

const HEALTH_TABS = [
  { value: "drinks", label: "Cafe/Trà" },
  { value: "habits", label: "WP" },
  { value: "water", label: "Uống nước" },
] as const;

export function Health() {
  return (
    <div className="mx-auto flex w-full flex-col gap-4 px-0 py-1">
      <UrlTabs items={[...HEALTH_TABS]} defaultValue="drinks">
        <TabsContent value="water">
          <WaterTracker />
        </TabsContent>
        <TabsContent value="drinks">
          <DrinkTracker />
        </TabsContent>
        <TabsContent value="habits">
          <PersonalHabits />
        </TabsContent>
      </UrlTabs>
    </div>
  );
}
