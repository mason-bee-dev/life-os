import dayjs from "dayjs";
import { usePersistentState } from "@/hooks/usePersistentState";
import type { DailyRecord, DailyRecords } from "./types";

export function useDailyRecords() {
  const [records, setRecords] = usePersistentState<DailyRecords>("dailyRecords", {});
  const todayKey = dayjs().format("YYYY-MM-DD");

  const getRecord = (date: string): DailyRecord => records[date] ?? { date };

  const updateRecord = (date: string, patch: Partial<DailyRecord>) => {
    setRecords((prev) => ({
      ...prev,
      [date]: { ...prev[date], date, ...patch },
    }));
  };

  return { records, todayKey, getRecord, updateRecord };
}
