import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteSleepRecord,
  fetchSleepRecords,
  upsertSleepRecord,
} from "./api";
import type { SleepRecord } from "./types";

export const SLEEP_RECORDS_QUERY_KEY = ["sleepRecords"] as const;

export function useSleepRecords(range: { from: string; to: string }) {
  const queryClient = useQueryClient();

  const { data: records = [], isLoading, error } = useQuery({
    queryKey: [...SLEEP_RECORDS_QUERY_KEY, range.from, range.to],
    queryFn: () => fetchSleepRecords(range.from, range.to),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: SLEEP_RECORDS_QUERY_KEY });
  };

  const saveMutation = useMutation({
    mutationFn: upsertSleepRecord,
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSleepRecord,
    onSuccess: invalidate,
  });

  const getRecord = (date: string): SleepRecord | undefined =>
    records.find((r) => r.date === date);

  return {
    records,
    isLoading,
    error,
    isSaving: saveMutation.isPending,
    isDeleting: deleteMutation.isPending,
    getRecord,
    saveRecord: saveMutation.mutate,
    deleteRecord: deleteMutation.mutate,
  };
}
