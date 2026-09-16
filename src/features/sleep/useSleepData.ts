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
    moveRecord,
    deleteRecord,
  } = useSleepRecords(fetchRange);

  const saveNightSleep = (input: NightSleepInput, opts?: MutateOpts) => {
    const existing = getRecord(input.date);
    const editingNight = Boolean(existing?.bedtime && existing?.wakeTime);
    const incomingNote = input.note ?? null;
    // Shared note column: when adding night onto a nap-only day with blank note,
    // keep the existing note instead of wiping it.
    const note =
      incomingNote || editingNight
        ? incomingNote
        : (existing?.note ?? null);

    saveRecord(
      {
        date: input.date,
        bedtime: input.bedtime,
        wakeTime: input.wakeTime,
        nightWakingTimes: input.nightWakingTimes,
        quality: input.quality ?? null,
        note,
        napStart: existing?.napStart ?? null,
        napEnd: existing?.napEnd ?? null,
      },
      opts,
    );
  };

  const saveNap = (input: NapInput, opts?: MutateOpts) => {
    const existing = getRecord(input.date);
    const editingNap = Boolean(existing?.napStart && existing?.napEnd);
    const incomingNote =
      input.note !== undefined ? input.note : (existing?.note ?? null);
    const note =
      incomingNote || editingNap
        ? incomingNote
        : (existing?.note ?? null);

    saveRecord(
      {
        date: input.date,
        bedtime: existing?.bedtime ?? null,
        wakeTime: existing?.wakeTime ?? null,
        nightWakingTimes: existing?.nightWakingTimes ?? [],
        quality: existing?.quality ?? null,
        note,
        napStart: input.startTime,
        napEnd: input.endTime,
      },
      opts,
    );
  };

  const moveNightSleep = (
    sourceDate: string,
    input: NightSleepInput,
    allowOverwrite: boolean,
    opts?: MutateOpts,
  ) => {
    moveRecord(
      {
        kind: "night",
        sourceDate,
        targetDate: input.date,
        bedtime: input.bedtime,
        wakeTime: input.wakeTime,
        nightWakingTimes: input.nightWakingTimes,
        quality: input.quality ?? null,
        note: input.note ?? null,
        allowOverwrite,
      },
      opts,
    );
  };

  const moveNap = (
    sourceDate: string,
    input: NapInput,
    allowOverwrite: boolean,
    opts?: MutateOpts,
  ) => {
    moveRecord(
      {
        kind: "nap",
        sourceDate,
        targetDate: input.date,
        napStart: input.startTime,
        napEnd: input.endTime,
        note: input.note ?? null,
        allowOverwrite,
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
    moveNightSleep,
    moveNap,
    clearNightSleep,
    clearNap,
  };
}
