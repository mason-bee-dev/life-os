import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DrinkTracker } from "./DrinkTracker";
import { PersonalHabits } from "./PersonalHabits";
import { WaterTracker } from "./WaterTracker";

export function Health() {
  return (
    <div className="mx-auto flex w-full flex-col gap-4 px-0 py-1">
      <Tabs defaultValue="water">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 sm:inline-flex sm:h-10 sm:w-auto sm:flex-nowrap">
          <TabsTrigger value="water" className="flex-1 sm:flex-none">
            Uống nước
          </TabsTrigger>
          <TabsTrigger value="drinks" className="flex-1 sm:flex-none">
            Đồ uống
          </TabsTrigger>
          <TabsTrigger value="habits" className="flex-1 sm:flex-none">
            WP
          </TabsTrigger>
        </TabsList>

        <TabsContent value="water">
          <WaterTracker />
        </TabsContent>
        <TabsContent value="drinks">
          <DrinkTracker />
        </TabsContent>
        <TabsContent value="habits">
          <PersonalHabits />
        </TabsContent>
      </Tabs>
    </div>
  );
}
