import { supabase } from "@/lib/supabase";
import type { SleepQuality, SleepRecord } from "./types";

type SleepRow = {
  id: string;
  date: string;
  bedtime: string | null;
  wake_time: string | null;
  night_waking_times: string[] | null;
  quality: string | null;
  note: string | null;
  nap_start: string | null;
  nap_end: string | null;
};

/** Postgres time often comes as HH:MM:SS — normalize to HH:mm. */
function normalizeTime(t: string | null | undefined): string | null {
  if (!t) return null;
  return t.slice(0, 5);
}

function normalizeTimes(times: string[] | null | undefined): string[] {
  if (!times?.length) return [];
  return times
    .map((t) => normalizeTime(t))
    .filter((t): t is string => !!t);
}

function fromRow(row: SleepRow): SleepRecord {
  return {
    id: row.id,
    date: row.date,
    bedtime: normalizeTime(row.bedtime),
    wakeTime: normalizeTime(row.wake_time),
    nightWakingTimes: normalizeTimes(row.night_waking_times),
    quality: (row.quality as SleepQuality | null) ?? null,
    note: row.note,
    napStart: normalizeTime(row.nap_start),
    napEnd: normalizeTime(row.nap_end),
  };
}

function toRow(record: Partial<SleepRecord> & { date: string }, userId: string) {
  return {
    user_id: userId,
    date: record.date,
    bedtime: record.bedtime ?? null,
    wake_time: record.wakeTime ?? null,
    night_waking_times: record.nightWakingTimes ?? [],
    quality: record.quality ?? null,
    note: record.note ?? null,
    nap_start: record.napStart ?? null,
    nap_end: record.napEnd ?? null,
  };
}

export async function fetchSleepRecords(from: string, to: string): Promise<SleepRecord[]> {
  const { data, error } = await supabase
    .from("sleep_records")
    .select("*")
    .gte("date", from)
    .lte("date", to)
    .order("date", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as SleepRow[]).map(fromRow);
}

export async function upsertSleepRecord(
  record: Partial<SleepRecord> & { date: string },
): Promise<SleepRecord> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw userError ?? new Error("Chưa đăng nhập");

  const { data, error } = await supabase
    .from("sleep_records")
    .upsert(toRow(record, userData.user.id), { onConflict: "user_id,date" })
    .select()
    .single();
  if (error) throw error;
  return fromRow(data as SleepRow);
}

export async function deleteSleepRecord(id: string): Promise<void> {
  const { error } = await supabase.from("sleep_records").delete().eq("id", id);
  if (error) throw error;
}
