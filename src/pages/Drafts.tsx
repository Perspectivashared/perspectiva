import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/shared/components/layout/AppShell";
import SurveyListCard from "@/components/SurveyListCard";
import { api } from "@/lib/api";
import { Loader2, Trash2, FolderOpen, Plus } from "lucide-react";
import { useDraftActions } from "@/hooks/use-draft-actions";

interface DraftSummary {
  id: number;
  title: string;
  category: string | null;
  status: string;
  created_at: string;
}

const Drafts = () => {
  const navigate = useNavigate();
  const { loadDraft: handleLoad, deleteDraft: handleDelete, loadingId, deletingId } = useDraftActions();

  const { data: allSurveys, isPending } = useQuery({
    queryKey: ["my-surveys"],
    queryFn: () => api.get<DraftSummary[]>("/surveys/me"),
  });

  const drafts = allSurveys?.filter((s) => s.status === "draft") ?? [];

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
            <SurveyListCard
              key={draft.id}
              title={draft.title || "Untitled Survey"}
              status="draft"
              category={draft.category}
              date={draft.created_at}
              dateLabel="Saved"
              action={
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleLoad(draft.id)}
                    disabled={loadingId === draft.id}
                  >
                    {loadingId === draft.id ? (
                      <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Loading...</>
                    ) : (
                      <><FolderOpen className="mr-2 h-3.5 w-3.5" />Load</>
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
                      <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Deleting...</>
                    ) : (
                      <><Trash2 className="mr-2 h-3.5 w-3.5" />Delete</>
                    )}
                  </Button>
                </div>
              }
            />
          ))}
        </div>
      )}
    </AppShell>
  );
};

export default Drafts;
