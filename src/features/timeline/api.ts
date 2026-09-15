import { supabase } from "@/lib/supabase";
import type { Activity, ActivityInput, ActivitySegment, SegmentInput } from "./types";

type ActivityRow = {
  id: string;
  name: string;
  icon: string;
  color: string;
  group_id: string;
  archived: boolean;
  sort_order: number;
};

type SegmentRow = {
  id: string;
  activity_id: string;
  date: string;
  start_min: number;
  end_min: number;
  note: string | null;
};

function activityFromRow(row: ActivityRow): Activity {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    color: row.color,
    groupId: row.group_id,
    archived: row.archived,
    sortOrder: row.sort_order,
  };
}

function segmentFromRow(row: SegmentRow): ActivitySegment {
  return {
    id: row.id,
    activityId: row.activity_id,
    date: row.date,
    startMin: row.start_min,
    endMin: row.end_min,
    note: row.note,
  };
}

async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw error ?? new Error("Chưa đăng nhập");
  return data.user.id;
}

export async function fetchActivities(): Promise<Activity[]> {
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as ActivityRow[]).map(activityFromRow);
}

export async function createActivity(input: ActivityInput): Promise<Activity> {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from("activities")
    .insert({
      user_id: userId,
      name: input.name,
      icon: input.icon,
      color: input.color,
      group_id: input.groupId,
      sort_order: input.sortOrder ?? 0,
      archived: false,
    })
    .select()
    .single();
  if (error) throw error;
  return activityFromRow(data as ActivityRow);
}

export async function updateActivity(
  id: string,
  input: Partial<ActivityInput> & { archived?: boolean },
): Promise<Activity> {
  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.icon !== undefined) patch.icon = input.icon;
  if (input.color !== undefined) patch.color = input.color;
  if (input.groupId !== undefined) patch.group_id = input.groupId;
  if (input.sortOrder !== undefined) patch.sort_order = input.sortOrder;
  if (input.archived !== undefined) patch.archived = input.archived;

  const { data, error } = await supabase
    .from("activities")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return activityFromRow(data as ActivityRow);
}

export async function deleteActivity(id: string): Promise<void> {
  const { error } = await supabase.from("activities").delete().eq("id", id);
  if (error) throw error;
}

export async function countSegmentsForActivity(
  activityId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("activity_segments")
    .select("*", { count: "exact", head: true })
    .eq("activity_id", activityId);
  if (error) throw error;
  return count ?? 0;
}

export async function fetchSegments(
  from: string,
  to: string,
): Promise<ActivitySegment[]> {
  const { data, error } = await supabase
    .from("activity_segments")
    .select("*")
    .gte("date", from)
    .lte("date", to)
    .order("date", { ascending: true })
    .order("start_min", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as SegmentRow[]).map(segmentFromRow);
}

export async function createSegment(
  input: SegmentInput,
): Promise<ActivitySegment> {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from("activity_segments")
    .insert({
      user_id: userId,
      activity_id: input.activityId,
      date: input.date,
      start_min: input.startMin,
      end_min: input.endMin,
      note: input.note ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return segmentFromRow(data as SegmentRow);
}

export async function updateSegment(
  id: string,
  input: SegmentInput,
): Promise<ActivitySegment> {
  const { data, error } = await supabase
    .from("activity_segments")
    .update({
      activity_id: input.activityId,
      date: input.date,
      start_min: input.startMin,
      end_min: input.endMin,
      note: input.note ?? null,
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return segmentFromRow(data as SegmentRow);
}

export async function deleteSegment(id: string): Promise<void> {
  const { error } = await supabase
    .from("activity_segments")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
