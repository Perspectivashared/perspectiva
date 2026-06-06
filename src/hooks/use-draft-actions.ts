import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { SurveyBuilderQuestionType } from "@/features/survey-builder/domain/types";

interface ApiDraftSurvey {
  id: number;
  title: string;
  description: string;
  category: string | null;
  target_responses: number | null;
  deadline: string | null;
  questions: Array<{
    order: number;
    question_type: string;
    question_text: string;
    required: boolean;
    options: Array<{ text: string }>;
  }>;
}

/**
 * Provides stable `loadDraft` and `deleteDraft` actions used on both the
 * Profile and Drafts pages. Eliminates the identical implementation that
 * previously lived in each page independently.
 */
export function useDraftActions() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadDraft = async (surveyId: number) => {
    setLoadingId(surveyId);
    try {
      const survey = await api.get<ApiDraftSurvey>(`/surveys/${surveyId}`);
      navigate("/create-survey", {
        state: {
          draftId: survey.id,
          surveyTitle: survey.title,
          surveyDescription: survey.description,
          category: survey.category,
          targetResponses: survey.target_responses,
          deadline: survey.deadline ? survey.deadline.split("T")[0] : "",
          questions: survey.questions
            .sort((a, b) => a.order - b.order)
            .map((q) => ({
              question: q.question_text,
              type: q.question_type as SurveyBuilderQuestionType,
              required: q.required,
              options: q.options.map((o) => ({ text: o.text })),
            })),
        },
      });
    } catch (err) {
      toast({
        title: "Failed to load draft",
        description: err instanceof Error ? err.message : "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setLoadingId(null);
    }
  };

  const deleteDraft = async (surveyId: number) => {
    setDeletingId(surveyId);
    try {
      await api.delete(`/surveys/${surveyId}`);
      await queryClient.invalidateQueries({ queryKey: ["my-surveys"] });
      toast({ title: "Draft deleted" });
    } catch (err) {
      toast({
        title: "Failed to delete draft",
        description: err instanceof Error ? err.message : "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return { loadDraft, deleteDraft, loadingId, deletingId };
}
