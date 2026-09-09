import dayjs from "dayjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type {
  DailyRecord,
  DailyRecords,
  DrinkCategory,
  DrinkLog,
} from "./types";

export const DAILY_RECORDS_QUERY_KEY = ["dailyRecords"] as const;

type DailyRecordRow = {
  date: string;
  water_glasses: number | null;
  masturbation_count: number | null;
  watched_porn: boolean | null;
  wp_note: string | null;
};

type DrinkLogRow = {
  id: number;
  date: string;
  type: string;
  custom_type: string | null;
  cups: number;
  category: string | null;
  amount: number | null;
  note: string | null;
};

function isDrinkCategory(v: string): v is DrinkCategory {
  return v === "cafe" || v === "soft_drink" || v === "tea";
}

function toDrinkLog(row: DrinkLogRow): DrinkLog {
  const category = row.category && isDrinkCategory(row.category)
    ? row.category
    : "cafe";
  return {
    id: row.id,
    category,
    type: row.type,
    ...(row.custom_type ? { customType: row.custom_type } : {}),
    cups: row.cups,
    amount: row.amount ?? 0,
    ...(row.note ? { note: row.note } : {}),
  };
}

function drinksOf(record: DailyRecord | undefined): DrinkLog[] {
  return record?.drinks ?? record?.coffee ?? [];
}

function joinRecords(
  rows: DailyRecordRow[],
  logs: DrinkLogRow[],
): DailyRecords {
  const drinksByDate = new Map<string, DrinkLog[]>();
  for (const log of logs) {
    const list = drinksByDate.get(log.date) ?? [];
    list.push(toDrinkLog(log));
    drinksByDate.set(log.date, list);
  }

  const records: DailyRecords = {};
  for (const row of rows) {
    const drinks = drinksByDate.get(row.date);
    records[row.date] = {
      date: row.date,
      ...(row.water_glasses != null ? { waterGlasses: row.water_glasses } : {}),
      ...(drinks ? { drinks } : {}),
      ...(row.masturbation_count != null
        ? { masturbationCount: row.masturbation_count }
        : {}),
      ...(row.wp_note != null ? { wpNote: row.wp_note } : {}),
      ...(row.watched_porn != null ? { watchedPorn: row.watched_porn } : {}),
    };
  }
  return records;
}

async function fetchDailyRecords(): Promise<DailyRecords> {
  const [recordsRes, logsRes] = await Promise.all([
    supabase
      .from("daily_records")
      .select(
        "date, water_glasses, masturbation_count, watched_porn, wp_note",
      ),
    supabase
      .from("coffee_logs")
      .select(
        "id, date, type, custom_type, cups, category, amount, note",
      )
      .order("created_at"),
  ]);
  if (recordsRes.error) throw recordsRes.error;
  if (logsRes.error) throw logsRes.error;
  return joinRecords(
    (recordsRes.data ?? []) as DailyRecordRow[],
    (logsRes.data ?? []) as DrinkLogRow[],
  );
}

async function persistRecord(date: string, patch: Partial<DailyRecord>) {
  const row: Record<string, unknown> = {
    date,
    updated_at: new Date().toISOString(),
  };
  if (patch.waterGlasses !== undefined) row.water_glasses = patch.waterGlasses;
  if (patch.masturbationCount !== undefined) {
    row.masturbation_count = patch.masturbationCount;
  }
  if (patch.wpNote !== undefined) row.wp_note = patch.wpNote;
  if (patch.watchedPorn !== undefined) row.watched_porn = patch.watchedPorn;

  const { error } = await supabase.from("daily_records").upsert(row);
  if (error) throw error;

  const nextDrinks = patch.drinks ?? patch.coffee;
  if (nextDrinks !== undefined) {
    const { error: delError } = await supabase
      .from("coffee_logs")
      .delete()
      .eq("date", date);
    if (delError) throw delError;
    if (nextDrinks.length > 0) {
      const { error: insError } = await supabase.from("coffee_logs").insert(
        nextDrinks.map((c) => ({
          date,
          type: c.type,
          custom_type: c.customType ?? null,
          cups: c.cups,
          category: c.category ?? "cafe",
          amount: c.amount ?? 0,
          note: c.note?.trim() ? c.note.trim() : null,
        })),
      );
      if (insError) throw insError;
    }
  }
}

export function useDailyRecords() {
  const queryClient = useQueryClient();
  const todayKey = dayjs().format("YYYY-MM-DD");

  const { data: records = {}, isLoading, error } = useQuery({
    queryKey: DAILY_RECORDS_QUERY_KEY,
    queryFn: fetchDailyRecords,
  });

  const mutation = useMutation({
    mutationFn: ({
      date,
      patch,
    }: {
      date: string;
      patch: Partial<DailyRecord>;
    }) => persistRecord(date, patch),
    onMutate: async ({ date, patch }) => {
      await queryClient.cancelQueries({ queryKey: DAILY_RECORDS_QUERY_KEY });
      const previous =
        queryClient.getQueryData<DailyRecords>(DAILY_RECORDS_QUERY_KEY);
      queryClient.setQueryData<DailyRecords>(
        DAILY_RECORDS_QUERY_KEY,
        (old = {}) => {
          const prev = old[date] ?? { date };
          const merged: DailyRecord = { ...prev, date, ...patch };
          if (patch.drinks !== undefined) {
            merged.drinks = patch.drinks;
            delete merged.coffee;
          }
          return { ...old, [date]: merged };
        },
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(DAILY_RECORDS_QUERY_KEY, ctx.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DAILY_RECORDS_QUERY_KEY });
    },
  });

  const getRecord = (date: string): DailyRecord => {
    const r = records[date] ?? { date };
    return { ...r, drinks: drinksOf(r) };
  };

  const updateRecord = (date: string, patch: Partial<DailyRecord>) => {
    mutation.mutate({ date, patch });
  };

  return {
    records,
    todayKey,
    getRecord,
    updateRecord,
    isSaving: mutation.isPending,
    isLoading,
    error,
  };
}
