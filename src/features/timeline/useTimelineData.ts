import { useEffect, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { ACTIVITIES_QUERY_KEY, useActivities } from "./useActivities";
import { useSegments } from "./useSegments";
import { seedDefaultActivitiesIfEmpty } from "./seedActivities";
import { periodBounds, type Period, type SegmentInput } from "./types";

type MutateOpts = {
  onSuccess?: () => void;
  onError?: () => void;
};

export function useTimelineData(period: Period, refDate: string) {
  const todayKey = dayjs().format("YYYY-MM-DD");
  const queryClient = useQueryClient();
  const seededRef = useRef(false);

  const fetchRange = useMemo(() => {
    const bounds = periodBounds(refDate, period);
    const fromCandidates = [bounds.from, todayKey, refDate].sort();
    const toCandidates = [bounds.to, todayKey, refDate].sort();
    return {
      from: fromCandidates[0],
      to: toCandidates[toCandidates.length - 1],
    };
  }, [refDate, period, todayKey]);

  const {
    activities,
    isLoading: activitiesLoading,
    error: activitiesError,
    isSaving: activitiesSaving,
    createActivity,
    updateActivity,
    deleteActivity,
  } = useActivities();

  const {
    segments,
    isLoading: segmentsLoading,
    error: segmentsError,
    isSaving: segmentsSaving,
    isDeleting,
    createSegment,
    updateSegment,
    deleteSegment,
  } = useSegments(fetchRange);

  useEffect(() => {
    if (seededRef.current || activitiesLoading) return;
    if (activities.length > 0) {
      seededRef.current = true;
      return;
    }
    seededRef.current = true;
    void seedDefaultActivitiesIfEmpty().then((didSeed) => {
      if (didSeed) {
        void queryClient.invalidateQueries({ queryKey: ACTIVITIES_QUERY_KEY });
      }
    });
  }, [activitiesLoading, activities.length, queryClient]);

  const saveSegment = (
    input: SegmentInput & { id?: string },
    opts?: MutateOpts,
  ) => {
    if (input.id) {
      updateSegment(
        {
          id: input.id,
          input: {
            activityId: input.activityId,
            date: input.date,
            startMin: input.startMin,
            endMin: input.endMin,
            note: input.note,
          },
        },
        opts,
      );
      return;
    }
    createSegment(
      {
        activityId: input.activityId,
        date: input.date,
        startMin: input.startMin,
        endMin: input.endMin,
        note: input.note,
      },
      opts,
    );
  };

  return {
    activities,
    segments,
    isLoading: activitiesLoading || segmentsLoading,
    error: activitiesError || segmentsError,
    isSaving: activitiesSaving || segmentsSaving,
    isDeleting,
    todayKey,
    refDate,
    createActivity,
    updateActivity,
    deleteActivity,
    saveSegment,
    deleteSegment,
  };
}
