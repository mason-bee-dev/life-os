import { useMemo } from "react";
import dayjs from "dayjs";
import { useSleepRecords } from "./useSleepRecords";
import { periodBounds } from "./sleepStats";
import type { NightSleepInput, NapInput, Period, SleepRecord } from "./types";

type MutateOpts = {
  onSuccess?: () => void;
  onError?: () => void;
};

function hasRemainingNight(r: Partial<SleepRecord>): boolean {
  return Boolean(r.bedtime && r.wakeTime);
}

function hasRemainingNap(r: Partial<SleepRecord>): boolean {
  return Boolean(r.napStart && r.napEnd);
}

export function useSleepData(periods: { night: Period; nap: Period }) {
  const todayKey = dayjs().format("YYYY-MM-DD");
  const refDate = todayKey;

  const fetchRange = useMemo(() => {
    const night = periodBounds(refDate, periods.night);
    const nap = periodBounds(refDate, periods.nap);
    const fromCandidates = [night.from, nap.from, todayKey].sort();
    const toCandidates = [night.to, nap.to, todayKey].sort();
    return {
      from: fromCandidates[0],
      to: toCandidates[toCandidates.length - 1],
    };
  }, [refDate, periods.night, periods.nap, todayKey]);

  const {
    records,
    isLoading,
    error,
    isSaving,
    isDeleting,
    getRecord,
    saveRecord,
    deleteRecord,
  } = useSleepRecords(fetchRange);

  const saveNightSleep = (input: NightSleepInput, opts?: MutateOpts) => {
    const existing = getRecord(input.date);
    saveRecord(
      {
        date: input.date,
        bedtime: input.bedtime,
        wakeTime: input.wakeTime,
        nightWakingTimes: input.nightWakingTimes,
        quality: input.quality ?? null,
        note: input.note ?? null,
        napStart: existing?.napStart ?? null,
        napEnd: existing?.napEnd ?? null,
      },
      opts,
    );
  };

  const saveNap = (input: NapInput, opts?: MutateOpts) => {
    const existing = getRecord(input.date);
    saveRecord(
      {
        date: input.date,
        bedtime: existing?.bedtime ?? null,
        wakeTime: existing?.wakeTime ?? null,
        nightWakingTimes: existing?.nightWakingTimes ?? [],
        quality: existing?.quality ?? null,
        note: input.note !== undefined ? input.note : (existing?.note ?? null),
        napStart: input.startTime,
        napEnd: input.endTime,
      },
      opts,
    );
  };

  const clearNightSleep = (record: SleepRecord, opts?: MutateOpts) => {
    if (hasRemainingNap(record)) {
      saveRecord(
        {
          date: record.date,
          bedtime: null,
          wakeTime: null,
          nightWakingTimes: [],
          quality: null,
          note: record.note,
          napStart: record.napStart,
          napEnd: record.napEnd,
        },
        opts,
      );
      return;
    }
    deleteRecord(record.id, opts);
  };

  const clearNap = (record: SleepRecord, opts?: MutateOpts) => {
    if (hasRemainingNight(record)) {
      saveRecord(
        {
          date: record.date,
          bedtime: record.bedtime,
          wakeTime: record.wakeTime,
          nightWakingTimes: record.nightWakingTimes,
          quality: record.quality,
          note: record.note,
          napStart: null,
          napEnd: null,
        },
        opts,
      );
      return;
    }
    deleteRecord(record.id, opts);
  };

  return {
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
  };
}
