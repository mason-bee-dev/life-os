import dayjs from "dayjs";
import { useToast } from "@/components/ui/toast";
import { toNightSleepRecord } from "./useSleepData";
import { useSleepRecords } from "./useSleepRecords";
import type { SleepRecord } from "./types";

const DEFAULT_WAKE_TIME = "07:00";

function hasNightSleep(r: SleepRecord | undefined): boolean {
  return Boolean(r?.bedtime && r?.wakeTime);
}

/** Before noon, night waking belongs to last night's record. */
function resolveNightSleepForWaking(
  now: dayjs.Dayjs,
  getRecord: (date: string) => SleepRecord | undefined,
): SleepRecord | undefined {
  const today = now.format("YYYY-MM-DD");
  const yesterday = now.subtract(1, "day").format("YYYY-MM-DD");
  const dates = now.hour() < 12 ? [yesterday, today] : [today];
  for (const date of dates) {
    const rec = getRecord(date);
    if (hasNightSleep(rec)) return rec;
  }
  return undefined;
}

export function useQuickSleepActions() {
  const { notify } = useToast();
  const todayKey = dayjs().format("YYYY-MM-DD");
  const from = dayjs(todayKey).subtract(1, "day").format("YYYY-MM-DD");

  const { getRecord, saveRecord, isLoading, isSaving } = useSleepRecords({
    from,
    to: todayKey,
  });

  const busy = isLoading || isSaving;

  const addNightSleepNow = (): boolean => {
    if (busy) return false;

    const now = dayjs();
    const date = now.format("YYYY-MM-DD");
    const existing = getRecord(date);
    if (hasNightSleep(existing)) {
      notify("Ngày này đã có giấc ngủ đêm");
      return false;
    }

    const bedtime = now.format("HH:mm");
    saveRecord(
      toNightSleepRecord(existing, {
        date,
        bedtime,
        wakeTime: DEFAULT_WAKE_TIME,
        nightWakingTimes: existing?.nightWakingTimes ?? [],
        quality: existing?.quality ?? "binh_thuong",
        note: existing?.note ?? null,
      }),
      {
        onSuccess: () =>
          notify(`Đã ghi giấc ngủ ${bedtime} → ${DEFAULT_WAKE_TIME}`),
        onError: () => notify("Không lưu được. Thử lại sau."),
      },
    );
    return true;
  };

  const addNightWakingNow = (): boolean => {
    if (busy) return false;

    const now = dayjs();
    const existing = resolveNightSleepForWaking(now, getRecord);
    if (!existing?.bedtime || !existing.wakeTime) {
      notify("Chưa có giấc ngủ đêm để ghi dậy đêm");
      return false;
    }

    const waking = now.format("HH:mm");
    saveRecord(
      toNightSleepRecord(existing, {
        date: existing.date,
        bedtime: existing.bedtime,
        wakeTime: existing.wakeTime,
        nightWakingTimes: [...existing.nightWakingTimes, waking],
        quality: existing.quality,
        note: existing.note,
      }),
      {
        onSuccess: () => notify(`Đã ghi dậy đêm ${waking}`),
        onError: () => notify("Không lưu được. Thử lại sau."),
      },
    );
    return true;
  };

  return { busy, addNightSleepNow, addNightWakingNow };
}
