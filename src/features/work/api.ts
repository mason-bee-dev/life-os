import { supabase } from "@/lib/supabase";
import type {
  DayType,
  WorkCategory,
  WorkDay,
  WorkDayInput,
  WorkLoad,
  WorkLog,
  WorkLogInput,
} from "./types";

type WorkDayRow = {
  date: string;
  day_type: string;
  load: string | null;
  note: string | null;
};

type WorkLogRow = {
  id: string;
  date: string;
  category: string;
  project: string;
  hours: number | string | null;
  note: string | null;
};

function fromDayRow(row: WorkDayRow): WorkDay {
  return {
    date: row.date,
    dayType: row.day_type as DayType,
    load: (row.load as WorkLoad | null) ?? null,
    note: row.note,
  };
}

function fromLogRow(row: WorkLogRow): WorkLog {
  const hours =
    row.hours == null || row.hours === ""
      ? null
      : typeof row.hours === "number"
        ? row.hours
        : Number(row.hours);
  return {
    id: row.id,
    date: row.date,
    category: row.category as WorkCategory,
    project: row.project,
    hours: hours != null && Number.isFinite(hours) ? hours : null,
    note: row.note,
  };
}

function toDayRow(input: WorkDayInput, userId: string) {
  return {
    user_id: userId,
    date: input.date,
    day_type: input.dayType,
    load: input.load ?? null,
    note: input.note ?? null,
  };
}

function toLogRow(input: WorkLogInput, userId: string) {
  return {
    ...(input.id ? { id: input.id } : {}),
    user_id: userId,
    date: input.date,
    category: input.category,
    project: input.project,
    hours: input.hours,
    note: input.note ?? null,
  };
}

export async function fetchWorkDays(
  from: string,
  to: string,
): Promise<WorkDay[]> {
  const { data, error } = await supabase
    .from("work_days")
    .select("date, day_type, load, note")
    .gte("date", from)
    .lte("date", to)
    .order("date", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as WorkDayRow[]).map(fromDayRow);
}

export async function fetchWorkLogs(
  from: string,
  to: string,
): Promise<WorkLog[]> {
  const { data, error } = await supabase
    .from("work_logs")
    .select("id, date, category, project, hours, note")
    .gte("date", from)
    .lte("date", to)
    .order("date", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as WorkLogRow[]).map(fromLogRow);
}

export async function upsertWorkDay(input: WorkDayInput): Promise<WorkDay> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw userError ?? new Error("Chưa đăng nhập");

  const { data, error } = await supabase
    .from("work_days")
    .upsert(toDayRow(input, userData.user.id), { onConflict: "user_id,date" })
    .select("date, day_type, load, note")
    .single();
  if (error) throw error;
  return fromDayRow(data as WorkDayRow);
}

export async function upsertWorkLog(input: WorkLogInput): Promise<WorkLog> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw userError ?? new Error("Chưa đăng nhập");

  const { data, error } = await supabase
    .from("work_logs")
    .upsert(toLogRow(input, userData.user.id))
    .select("id, date, category, project, hours, note")
    .single();
  if (error) throw error;
  return fromLogRow(data as WorkLogRow);
}

export async function deleteWorkLog(id: string): Promise<void> {
  const { error } = await supabase.from("work_logs").delete().eq("id", id);
  if (error) throw error;
}
