import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppShell } from "@/shared/components/layout/AppShell";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2, Trash2, FolderOpen, Plus } from "lucide-react";
import type { SurveyBuilderQuestionType } from "@/features/survey-builder/domain/types";

interface DraftSummary {
  id: number;
  title: string;
  category: string | null;
  status: string;
  created_at: string;
}

interface QuestionOut {
  id: number;
  order: number;
  question_type: string;
  question_text: string;
  required: boolean;
  options: Array<{ id: number; text: string }>;
}

interface SurveyOut {
  id: number;
  title: string;
  description: string;
  category: string | null;
  target_responses: number | null;
  deadline: string | null;
  questions: QuestionOut[];
}

const Drafts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const { data: allSurveys, isPending } = useQuery({
    queryKey: ["my-surveys"],
    queryFn: () => api.get<DraftSummary[]>("/surveys/me"),
  });

  const drafts = allSurveys?.filter((s) => s.status === "draft") ?? [];

  const handleLoad = async (draftId: number) => {
    setLoadingId(draftId);
    try {
      const survey = await api.get<SurveyOut>(`/surveys/${draftId}`);
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
    } catch {
      toast({ title: "Failed to load draft", variant: "destructive" });
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (draftId: number) => {
    setDeletingId(draftId);
    try {
      await api.delete(`/surveys/${draftId}`);
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

  return (
    <AppShell withContainer mainClassName="max-w-4xl px-4 pb-12 pt-24" backgroundClassName="bg-gradient-subtle">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-3 text-4xl font-bold">
            <span className="bg-gradient-primary bg-clip-text text-transparent">Drafts</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Continue working on surveys you started but didn't finish.
          </p>
        </div>
        <Button onClick={() => navigate("/create-survey")}>
          <Plus className="mr-2 h-4 w-4" /> New Survey
        </Button>
      </div>

      {isPending ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : drafts.length === 0 ? (
        <Card className="border-border/50 bg-card/50 p-10 backdrop-blur text-center">
          <p className="text-muted-foreground mb-4">No drafts saved yet.</p>
          <Button onClick={() => navigate("/create-survey")}>Create one now</Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {drafts.map((draft) => (
            <Card key={draft.id} className="border-border/50 bg-card/50 p-6 backdrop-blur">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-semibold truncate">{draft.title || "Untitled Survey"}</h2>
                    <Badge variant="secondary">Draft</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {draft.category ?? "No category"} • Saved {new Date(draft.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleLoad(draft.id)}
                    disabled={loadingId === draft.id}
                  >
                    {loadingId === draft.id ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading...</>
                    ) : (
                      <><FolderOpen className="mr-2 h-4 w-4" />Load</>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => handleDelete(draft.id)}
                    disabled={deletingId === draft.id}
                  >
                    {deletingId === draft.id ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting...</>
                    ) : (
                      <><Trash2 className="mr-2 h-4 w-4" />Delete</>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
};

export default Drafts;
