import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createActivity,
  deleteActivity,
  fetchActivities,
  updateActivity,
} from "./api";
import type { ActivityInput } from "./types";

export const ACTIVITIES_QUERY_KEY = ["activities"] as const;

export function useActivities() {
  const queryClient = useQueryClient();

  const { data: activities = [], isLoading, error } = useQuery({
    queryKey: ACTIVITIES_QUERY_KEY,
    queryFn: fetchActivities,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ACTIVITIES_QUERY_KEY });
  };

  const createMutation = useMutation({
    mutationFn: createActivity,
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Partial<ActivityInput> & { archived?: boolean };
    }) => updateActivity(id, input),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteActivity,
    onSuccess: invalidate,
  });

  return {
    activities,
    isLoading,
    error,
    isSaving:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
    createActivity: createMutation.mutate,
    updateActivity: updateMutation.mutate,
    deleteActivity: deleteMutation.mutate,
  };
}
