import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSegment,
  deleteSegment,
  fetchSegments,
  updateSegment,
} from "./api";
import type { SegmentInput } from "./types";

export const SEGMENTS_QUERY_KEY = ["activitySegments"] as const;

export function useSegments(range: { from: string; to: string }) {
  const queryClient = useQueryClient();

  const { data: segments = [], isLoading, error } = useQuery({
    queryKey: [...SEGMENTS_QUERY_KEY, range.from, range.to],
    queryFn: () => fetchSegments(range.from, range.to),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: SEGMENTS_QUERY_KEY });
  };

  const createMutation = useMutation({
    mutationFn: createSegment,
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: SegmentInput }) =>
      updateSegment(id, input),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSegment,
    onSuccess: invalidate,
  });

  return {
    segments,
    isLoading,
    error,
    isSaving:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
    isDeleting: deleteMutation.isPending,
    createSegment: createMutation.mutate,
    updateSegment: updateMutation.mutate,
    deleteSegment: deleteMutation.mutate,
  };
}
