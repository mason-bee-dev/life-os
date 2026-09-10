import { useState } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { UrlTabs } from "@/components/UrlTabs";
import { NightSleepTab } from "./NightSleepTab";
import { NapTab } from "./NapTab";
import { useSleepData } from "./useSleepData";
import type { Period } from "./types";

const SLEEP_TABS = [
  { value: "night", label: "Giấc ngủ đêm" },
  { value: "nap", label: "Giấc ngủ trưa" },
] as const;

export function Sleep() {
  const [nightPeriod, setNightPeriod] = useState<Period>("week");
  const [napPeriod, setNapPeriod] = useState<Period>("week");

  const {
    records,
    isLoading,
    error,
    isSaving,
    isDeleting,
    todayKey,
    refDate,
    getRecord,
    saveNightSleep,
    saveNap,
    clearNightSleep,
    clearNap,
  } = useSleepData({ night: nightPeriod, nap: napPeriod });

  return (
    <div className="mx-auto flex w-full flex-col gap-4 px-0 py-1">
      <UrlTabs items={[...SLEEP_TABS]} defaultValue="night">
        {isLoading && (
          <div className="text-[13px] text-muted-foreground">Đang tải…</div>
        )}
        {error && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-[13px] text-destructive">
            Không tải được dữ liệu giấc ngủ. Kiểm tra bảng{" "}
            <code className="text-[12px]">sleep_records</code> trên Supabase.
          </div>
        )}

        <TabsContent value="night">
          <NightSleepTab
            period={nightPeriod}
            onPeriodChange={setNightPeriod}
            records={records}
            refDate={refDate}
            todayKey={todayKey}
            isSaving={isSaving}
            isDeleting={isDeleting}
            getRecord={getRecord}
            onSave={saveNightSleep}
            onClear={clearNightSleep}
          />
        </TabsContent>

        <TabsContent value="nap">
          <NapTab
            period={napPeriod}
            onPeriodChange={setNapPeriod}
            records={records}
            refDate={refDate}
            todayKey={todayKey}
            isSaving={isSaving}
            isDeleting={isDeleting}
            getRecord={getRecord}
            onSave={saveNap}
            onClear={clearNap}
          />
        </TabsContent>
      </UrlTabs>
    </div>
  );
}
