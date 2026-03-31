import { useLocation, Link } from "react-router-dom";
import { CheckCircle2, BarChart2, Users } from "lucide-react";
import { AppShell } from "@/shared/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

interface LocationState {
  surveyId: number;
  surveyTitle: string;
}

const SurveyPublished = () => {
  const location = useLocation();
  const state = location.state as LocationState | null;
  const surveyTitle = state?.surveyTitle ?? "Your survey";
  const surveyId = state?.surveyId;

  return (
    <AppShell withContainer mainClassName="max-w-2xl px-4 pb-12 pt-24" backgroundClassName="bg-gradient-subtle">
      <Card className="p-10 text-center border-border/50 bg-card/50 backdrop-blur space-y-6">
        <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10 text-success" />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-3">Survey Published!</h1>
          <p className="text-xl text-muted-foreground font-medium mb-1">"{surveyTitle}"</p>
          <p className="text-muted-foreground">Your survey is now live in the For You feed. 2 points were spent.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button asChild>
            <Link to={ROUTES.forYou}>
              <Users className="mr-2 h-4 w-4" />
              View in For You Feed
            </Link>
          </Button>
          {surveyId && (
            <Button asChild variant="outline">
              <Link to={`/surveys/${surveyId}/analytics`}>
                <BarChart2 className="mr-2 h-4 w-4" />
                View Analytics
              </Link>
            </Button>
          )}
          <Button asChild variant="outline">
            <Link to={ROUTES.profile}>Go to Profile</Link>
          </Button>
        </div>
      </Card>
    </AppShell>
  );
};

export default SurveyPublished;
