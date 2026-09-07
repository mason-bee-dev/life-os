import dayjs from "dayjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { CoffeeLog, CoffeeType, DailyRecord, DailyRecords } from "./types";

export const DAILY_RECORDS_QUERY_KEY = ["dailyRecords"] as const;

type DailyRecordRow = {
  date: string;
  water_glasses: number | null;
  masturbation_count: number | null;
  watched_porn: boolean | null;
};

type CoffeeLogRow = {
  id: number;
  date: string;
  type: string;
  custom_type: string | null;
  cups: number;
};

function toCoffeeLog(row: CoffeeLogRow): CoffeeLog {
  return {
    id: row.id,
    type: row.type as CoffeeType,
    ...(row.custom_type ? { customType: row.custom_type } : {}),
    cups: row.cups,
  };
}

function joinRecords(rows: DailyRecordRow[], logs: CoffeeLogRow[]): DailyRecords {
  const coffeeByDate = new Map<string, CoffeeLog[]>();
  for (const log of logs) {
    const list = coffeeByDate.get(log.date) ?? [];
    list.push(toCoffeeLog(log));
    coffeeByDate.set(log.date, list);
  }

  const records: DailyRecords = {};
  for (const row of rows) {
    const coffee = coffeeByDate.get(row.date);
    records[row.date] = {
      date: row.date,
      ...(row.water_glasses != null ? { waterGlasses: row.water_glasses } : {}),
      ...(coffee ? { coffee } : {}),
      ...(row.masturbation_count != null ? { masturbationCount: row.masturbation_count } : {}),
      ...(row.watched_porn != null ? { watchedPorn: row.watched_porn } : {}),
    };
  }
  return records;
}

async function fetchDailyRecords(): Promise<DailyRecords> {
  const [recordsRes, logsRes] = await Promise.all([
    supabase.from("daily_records").select("date, water_glasses, masturbation_count, watched_porn"),
    supabase.from("coffee_logs").select("id, date, type, custom_type, cups").order("created_at"),
  ]);
  if (recordsRes.error) throw recordsRes.error;
  if (logsRes.error) throw logsRes.error;
  return joinRecords(
    (recordsRes.data ?? []) as DailyRecordRow[],
    (logsRes.data ?? []) as CoffeeLogRow[],
  );
}

async function persistRecord(date: string, patch: Partial<DailyRecord>) {
  const row: Record<string, unknown> = {
    date,
    updated_at: new Date().toISOString(),
  };
  if (patch.waterGlasses !== undefined) row.water_glasses = patch.waterGlasses;
  if (patch.masturbationCount !== undefined) row.masturbation_count = patch.masturbationCount;
  if (patch.watchedPorn !== undefined) row.watched_porn = patch.watchedPorn;

  const { error } = await supabase.from("daily_records").upsert(row);
  if (error) throw error;

  if (patch.coffee !== undefined) {
    const { error: delError } = await supabase.from("coffee_logs").delete().eq("date", date);
    if (delError) throw delError;
    if (patch.coffee.length > 0) {
      const { error: insError } = await supabase.from("coffee_logs").insert(
        patch.coffee.map((c) => ({
          date,
          type: c.type,
          custom_type: c.customType ?? null,
          cups: c.cups,
        })),
      );
      if (insError) throw insError;
    }
  }
}

export function useDailyRecords() {
  const queryClient = useQueryClient();
  const todayKey = dayjs().format("YYYY-MM-DD");

  const { data: records = {} } = useQuery({
    queryKey: DAILY_RECORDS_QUERY_KEY,
    queryFn: fetchDailyRecords,
  });

  const mutation = useMutation({
    mutationFn: ({ date, patch }: { date: string; patch: Partial<DailyRecord> }) =>
      persistRecord(date, patch),
    onMutate: async ({ date, patch }) => {
      await queryClient.cancelQueries({ queryKey: DAILY_RECORDS_QUERY_KEY });
      const previous = queryClient.getQueryData<DailyRecords>(DAILY_RECORDS_QUERY_KEY);
      queryClient.setQueryData<DailyRecords>(DAILY_RECORDS_QUERY_KEY, (old = {}) => ({
        ...old,
        [date]: { ...old[date], date, ...patch },
      }));
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(DAILY_RECORDS_QUERY_KEY, ctx.previous);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DAILY_RECORDS_QUERY_KEY });
    },
  });

  const getRecord = (date: string): DailyRecord => records[date] ?? { date };

  const updateRecord = (date: string, patch: Partial<DailyRecord>) => {
    mutation.mutate({ date, patch });
  };

  return { records, todayKey, getRecord, updateRecord };
}
