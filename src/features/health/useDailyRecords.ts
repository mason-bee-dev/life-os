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
  masturbation_count: number | null;
  watched_porn: boolean | null;
  wp_note: string | null;
  wp_logged_at: string | null;
  wp_updated_at: string | null;
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
  created_at: string | null;
  updated_at: string | null;
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
    ...(row.created_at ? { createdAt: row.created_at } : {}),
    ...(row.updated_at ? { updatedAt: row.updated_at } : {}),
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
      ...(drinks ? { drinks } : {}),
      ...(row.masturbation_count != null
        ? { masturbationCount: row.masturbation_count }
        : {}),
      ...(row.wp_note != null ? { wpNote: row.wp_note } : {}),
      ...(row.watched_porn != null ? { watchedPorn: row.watched_porn } : {}),
      ...(row.wp_logged_at != null ? { wpLoggedAt: row.wp_logged_at } : {}),
      ...(row.wp_updated_at != null ? { wpUpdatedAt: row.wp_updated_at } : {}),
    };
  }

  // Include drink-only dates if a parent daily_records row is missing.
  for (const [date, drinks] of drinksByDate) {
    if (records[date]) continue;
    records[date] = { date, drinks };
  }
  return records;
}

async function fetchDailyRecords(): Promise<DailyRecords> {
  const [recordsRes, logsRes] = await Promise.all([
    supabase
      .from("daily_records")
      .select(
        "date, masturbation_count, watched_porn, wp_note, wp_logged_at, wp_updated_at",
      ),
    supabase
      .from("coffee_logs")
      .select(
        "id, date, type, custom_type, cups, category, amount, note, created_at, updated_at",
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

function toPatchJson(patch: Partial<DailyRecord>): Record<string, unknown> {
  const json: Record<string, unknown> = {};
  if (patch.masturbationCount !== undefined) {
    json.masturbationCount = patch.masturbationCount;
  }
  if (patch.wpNote !== undefined) json.wpNote = patch.wpNote;
  if (patch.watchedPorn !== undefined) json.watchedPorn = patch.watchedPorn;
  const nextDrinks = patch.drinks ?? patch.coffee;
  if (nextDrinks !== undefined) {
    json.drinks = nextDrinks.map((d) => ({
      id: d.id,
      category: d.category ?? "cafe",
      type: d.type,
      customType: d.customType ?? null,
      cups: d.cups,
      amount: d.amount ?? 0,
      note: d.note ?? null,
      createdAt: d.createdAt ?? null,
    }));
  }
  return json;
}

export function useDailyRecords() {
  const queryClient = useQueryClient();
  const todayKey = dayjs().format("YYYY-MM-DD");

  const { data: records = {}, isLoading, error } = useQuery({
    queryKey: DAILY_RECORDS_QUERY_KEY,
    queryFn: fetchDailyRecords,
  });

  type UpdateArgs = {
    date: string;
    patch: Partial<DailyRecord>;
    clearFrom?: { date: string; patch: Partial<DailyRecord> };
  };

  type UpdateOpts = {
    onSuccess?: () => void;
    onError?: () => void;
  };

  const mutation = useMutation({
    mutationFn: async ({ date, patch, clearFrom }: UpdateArgs) => {
      const { error } = await supabase.rpc("save_daily_record_atomic", {
        p_target_date: date,
        p_target_patch: toPatchJson(patch),
        p_source_date:
          clearFrom && clearFrom.date !== date ? clearFrom.date : null,
        p_source_patch:
          clearFrom && clearFrom.date !== date
            ? toPatchJson(clearFrom.patch)
            : null,
      });
      if (error) throw error;
    },
    onMutate: async ({ date, patch, clearFrom }) => {
      await queryClient.cancelQueries({ queryKey: DAILY_RECORDS_QUERY_KEY });
      const previous =
        queryClient.getQueryData<DailyRecords>(DAILY_RECORDS_QUERY_KEY);
      queryClient.setQueryData<DailyRecords>(
        DAILY_RECORDS_QUERY_KEY,
        (old = {}) => {
          const apply = (
            map: DailyRecords,
            d: string,
            p: Partial<DailyRecord>,
          ): DailyRecords => {
            const prev = map[d] ?? { date: d };
            const merged: DailyRecord = { ...prev, date: d, ...p };
            if (p.drinks !== undefined) {
              merged.drinks = p.drinks;
              delete merged.coffee;
            }
            if (
              p.masturbationCount !== undefined ||
              p.wpNote !== undefined ||
              p.watchedPorn !== undefined
            ) {
              const count =
                p.masturbationCount !== undefined
                  ? p.masturbationCount
                  : (merged.masturbationCount ?? 0);
              const note =
                p.wpNote !== undefined ? p.wpNote : (merged.wpNote ?? null);
              const watched =
                p.watchedPorn !== undefined
                  ? p.watchedPorn
                  : (merged.watchedPorn ?? false);
              const active =
                count > 0 || Boolean(note?.trim()) || watched === true;
              const now = new Date().toISOString();
              if (active) {
                merged.wpLoggedAt = merged.wpLoggedAt ?? now;
                merged.wpUpdatedAt = now;
              } else {
                merged.wpLoggedAt = null;
                merged.wpUpdatedAt = null;
              }
            }
            return { ...map, [d]: merged };
          };
          let next = apply(old, date, patch);
          if (clearFrom && clearFrom.date !== date) {
            next = apply(next, clearFrom.date, clearFrom.patch);
          }
          return next;
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

  const updateRecord = (
    date: string,
    patch: Partial<DailyRecord>,
    clearFrom?: { date: string; patch: Partial<DailyRecord> },
    opts?: UpdateOpts,
  ) => {
    mutation.mutate(
      { date, patch, clearFrom },
      {
        onSuccess: opts?.onSuccess,
        onError: opts?.onError,
      },
    );
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
