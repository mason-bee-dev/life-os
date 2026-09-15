import { useMemo } from "react";
import dayjs from "dayjs";
import { useWorkRecords } from "./useWorkRecords";
import { periodBounds, shiftRefDate } from "./workStats";
import type { Period, WorkDayInput, WorkLogInput } from "./types";

type MutateOpts = {
  onSuccess?: () => void;
  onError?: () => void;
};

export function useWorkData(periods: { work: Period }) {
  const todayKey = dayjs().format("YYYY-MM-DD");
  const refDate = todayKey;

  const fetchRange = useMemo(() => {
    const current = periodBounds(refDate, periods.work);
    const prevRef = shiftRefDate(refDate, periods.work, -1);
    const prev = periodBounds(prevRef, periods.work);
    const fromCandidates = [current.from, prev.from, todayKey].sort();
    const toCandidates = [current.to, prev.to, todayKey].sort();
    return {
      from: fromCandidates[0],
      to: toCandidates[toCandidates.length - 1],
    };
  }, [refDate, periods.work, todayKey]);

  const {
    days,
    logs,
    isLoading,
    error,
    isSaving,
    isDeleting,
    saveDay: saveDayMutate,
    saveLog: saveLogMutate,
    deleteLog: deleteLogMutate,
  } = useWorkRecords(fetchRange);

  const saveDay = (input: WorkDayInput, opts?: MutateOpts) => {
    saveDayMutate(input, opts);
  };

  const saveLog = (input: WorkLogInput, opts?: MutateOpts) => {
    saveLogMutate(input, opts);
  };

  const deleteLog = (id: string, opts?: MutateOpts) => {
    deleteLogMutate(id, opts);
  };

  return {
    days,
    logs,
    isLoading,
    error,
    isSaving,
    isDeleting,
    todayKey,
    refDate,
    saveDay,
    saveLog,
    deleteLog,
  };
}
