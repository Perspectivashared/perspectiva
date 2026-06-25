import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ClipboardList } from "lucide-react";
import { AppShell } from "@/shared/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ROUTES, getSurveyRoute } from "@/lib/routes";
import { browserSurveySessionStorage } from "@/features/surveys/services/survey-session-storage";

const SurveyResume = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const navigate = useNavigate();

  const hasSavedProgress = surveyId
    ? Boolean(browserSurveySessionStorage.loadProgress(surveyId))
    : false;

  useEffect(() => {
    if (!hasSavedProgress) {
      navigate(ROUTES.forYou, { replace: true });
    }
  }, [hasSavedProgress, navigate]);

  const handleResume = () => {
    if (surveyId) navigate(getSurveyRoute(surveyId));
  };

  const handleDiscard = () => {
    if (surveyId) browserSurveySessionStorage.clearProgress(surveyId);
    navigate(ROUTES.forYou, { replace: true });
  };

  if (!hasSavedProgress) return null;

  return (
    <AppShell withContainer mainClassName="max-w-2xl pb-12 pt-24" backgroundClassName="bg-gradient-subtle">
      <Card className="p-10 text-center border-border/50 bg-card/50 backdrop-blur space-y-6">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <ClipboardList className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold mb-2">Survey In Progress</h1>
          <p className="text-muted-foreground">
            You have saved progress for this survey. Would you like to continue where you left off?
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={handleResume}>Resume Survey</Button>
          <Button variant="outline" onClick={handleDiscard}>Discard Progress</Button>
        </div>
      </Card>
    </AppShell>
  );
};

export default SurveyResume;
