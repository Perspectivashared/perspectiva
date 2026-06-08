import { useCallback, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api, ApiError, SESSION_EXPIRED } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

/**
 * Manages optimistic save/unsave toggling for surveys.
 *
 * Uses an override map instead of a pure-addition set so that optimistic
 * unsaves correctly hide items that are still present in server data while
 * the refetch is in flight.
 *
 *   override[id] = true  → show as saved (overrides server)
 *   override[id] = false → show as unsaved (overrides server)
 *   override[id] missing → follow server data
 */
export function useSaveSurvey(savedSurveys: Array<{ id: number }> = []) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [overrides, setOverrides] = useState<Map<number, boolean>>(new Map());

  const savedIds = useMemo(() => {
    const serverIds = new Set(savedSurveys.map((s) => s.id));
    const result = new Set<number>();
    for (const id of serverIds) {
      const override = overrides.get(id);
      if (override !== false) result.add(id);
    }
    for (const [id, saved] of overrides) {
      if (saved) result.add(id);
    }
    return result;
  }, [overrides, savedSurveys]);

  const toggleSave = useCallback(
    async (surveyId: number) => {
      const isSaved = savedIds.has(surveyId);
      setOverrides((prev) => new Map(prev).set(surveyId, !isSaved));
      try {
        if (isSaved) {
          await api.delete(`/surveys/${surveyId}/save`);
        } else {
          await api.post(`/surveys/${surveyId}/save`);
        }
        toast({ title: isSaved ? "Survey unsaved" : "Survey saved" });
        await queryClient.invalidateQueries({ queryKey: ["saved-surveys"] });
        setOverrides((prev) => {
          const next = new Map(prev);
          next.delete(surveyId);
          return next;
        });
      } catch (err) {
        setOverrides((prev) => new Map(prev).set(surveyId, isSaved));
        if (err instanceof ApiError && err.code === SESSION_EXPIRED) throw err;
        toast({ title: "Failed to update saved status", variant: "destructive" });
      }
    },
    [savedIds, queryClient, toast],
  );

  return { savedIds, toggleSave };
}
