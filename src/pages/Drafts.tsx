import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppShell } from "@/shared/components/layout/AppShell";
import {
  clearDraftSurvey,
  hasDraftSurvey,
  loadDraftSurvey,
} from "@/features/survey-builder/services/draft-storage";

const Drafts = () => {
  const navigate = useNavigate();
  const [hasDraft, setHasDraft] = useState(false);
  const [draftSummary, setDraftSummary] = useState<{
    title: string;
    questions: number;
  } | null>(null);

  useEffect(() => {
    const draftExists = hasDraftSurvey();
    setHasDraft(draftExists);

    if (draftExists) {
      const draft = loadDraftSurvey();
      setDraftSummary(
        draft
          ? {
              title: draft.surveyTitle || "Untitled survey",
              questions: draft.questions.length,
            }
          : null,
      );
    }
  }, []);

  const handleContinue = () => {
    navigate("/create-survey", { state: { loadDraft: true } });
  };

  const handleDiscard = () => {
    clearDraftSurvey();
    setHasDraft(false);
    setDraftSummary(null);
  };

  return (
    <AppShell
      withContainer
      mainClassName="max-w-4xl px-4 pb-12 pt-24"
      backgroundClassName="bg-gradient-subtle"
    >
      <div className="mb-8">
        <h1 className="mb-3 text-4xl font-bold">
          <span className="bg-gradient-primary bg-clip-text text-transparent">
            Drafts
          </span>
        </h1>
        <p className="text-lg text-muted-foreground">
          Continue working on surveys you started but didn't finish.
        </p>
      </div>

      <Card className="border-border/50 bg-card/50 p-6 backdrop-blur">
        {hasDraft && draftSummary ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">{draftSummary.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {draftSummary.questions} questions in progress
                </p>
              </div>
              <Badge variant="secondary">Draft</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleContinue}>Continue Editing</Button>
              <Button variant="outline" onClick={handleDiscard}>
                Discard Draft
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-muted-foreground">
            <p>There are no drafts saved at the moment.</p>
            <Button onClick={() => navigate("/create-survey")}>
              Create one now
            </Button>
          </div>
        )}
      </Card>
    </AppShell>
  );
};

export default Drafts;
