import { TabsContent } from "@/components/ui/tabs";
import { UrlTabs } from "@/components/UrlTabs";
import { DrinkTracker } from "./DrinkTracker";
import { PersonalHabits } from "./PersonalHabits";

const HEALTH_TABS = [
  { value: "drinks", label: "Cafe/Trà" },
  { value: "habits", label: "WP" },
] as const;

export function Health() {
  return (
    <div className="mx-auto flex w-full flex-col gap-4 px-0 py-1">
      <UrlTabs items={[...HEALTH_TABS]} defaultValue="drinks">
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
