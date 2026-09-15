import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteWorkLog,
  fetchWorkDays,
  fetchWorkLogs,
  upsertWorkDay,
  upsertWorkLog,
} from "./api";
import type { WorkDayInput, WorkLogInput } from "./types";

export const WORK_RECORDS_QUERY_KEY = ["workRecords"] as const;

export function useWorkRecords(range: { from: string; to: string }) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: [...WORK_RECORDS_QUERY_KEY, range.from, range.to],
    queryFn: async () => {
      const [days, logs] = await Promise.all([
        fetchWorkDays(range.from, range.to),
        fetchWorkLogs(range.from, range.to),
      ]);
      return { days, logs };
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: WORK_RECORDS_QUERY_KEY });
  };

  const saveDayMutation = useMutation({
    mutationFn: (input: WorkDayInput) => upsertWorkDay(input),
    onSuccess: invalidate,
  });

  const saveLogMutation = useMutation({
    mutationFn: (input: WorkLogInput) => upsertWorkLog(input),
    onSuccess: invalidate,
  });

  const deleteLogMutation = useMutation({
    mutationFn: (id: string) => deleteWorkLog(id),
    onSuccess: invalidate,
  });

  return {
    days: data?.days ?? [],
    logs: data?.logs ?? [],
    isLoading,
    error,
    isSaving:
      saveDayMutation.isPending ||
      saveLogMutation.isPending ||
      deleteLogMutation.isPending,
    isDeleting: deleteLogMutation.isPending,
    saveDay: saveDayMutation.mutate,
    saveLog: saveLogMutation.mutate,
    deleteLog: deleteLogMutation.mutate,
  };
}
