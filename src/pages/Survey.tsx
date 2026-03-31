import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ROUTES } from "@/lib/routes";
import { api } from "@/lib/api";
import {
  formatSurveyDate,
  normalizeSurveyDefinition,
} from "@/features/surveys/domain/normalizers";
import {
  type SurveyAnswerMap,
  type SurveyAnswerValue,
  type SurveyDefinition,
  type RawSurveyPayload,
  type QuestionType,
} from "@/features/surveys/domain/types";
import {
  getSurveyRequiredErrors,
  hasSurveyAnswer,
} from "@/features/surveys/domain/validation";
import { renderSurveyQuestionInput } from "@/features/surveys/components/question-inputs";
import { browserSurveySessionStorage } from "@/features/surveys/services/survey-session-storage";
import { AppShell } from "@/shared/components/layout/AppShell";
import { CalendarClock, CheckCircle2, Clock3, ListChecks, Star } from "lucide-react";

// --- API types ---
interface ApiQuestionOption {
  id: number;
  order: number;
  text: string;
}

interface ApiSurveyQuestion {
  id: number;
  order: number;
  question_type: string;
  question_text: string;
  required: boolean;
  options: ApiQuestionOption[];
}

interface ApiSurvey {
  id: number;
  title: string;
  description: string;
  acknowledgement: string;
  deadline: string | null;
  time_limit_minutes: number | null;
  published_at: string | null;
  created_at: string;
  questions: ApiSurveyQuestion[];
}

// --- Backend → Frontend type mapping ---
const QUESTION_TYPE_MAP: Record<string, QuestionType> = {
  "short-text": "shortText",
  "long-text": "longText",
  "multiple-choice": "singleChoice",
  "checkboxes": "multipleChoice",
  "dropdown": "dropdown",
  "linear-scale": "rating",
};

function apiSurveyToRaw(survey: ApiSurvey): RawSurveyPayload {
  return {
    surveyId: String(survey.id),
    title: survey.title,
    description: survey.description,
    acknowledgement: survey.acknowledgement || "By proceeding you agree to participate in this survey.",
    startDate: survey.published_at ?? survey.created_at,
    endDate: survey.deadline ?? undefined,
    timeLimitMinutes: survey.time_limit_minutes ?? undefined,
    questions: survey.questions.map((q) => ({
      id: String(q.id),
      order: q.order,
      type: QUESTION_TYPE_MAP[q.question_type] ?? "shortText",
      text: q.question_text,
      required: q.required,
      options: q.options.map((o) => ({ label: o.text, value: o.text })),
    })),
  };
}

// --- Answer serialization ---
function serializeAnswer(value: SurveyAnswerValue): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.join(",");
  return String(value);
}

const Survey = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const requestedSurveyId = useMemo(() => {
    const state = location.state as { surveyId?: string } | null;
    const fromState = state?.surveyId?.trim();
    const fromQuery = new URLSearchParams(location.search).get("surveyId")?.trim();
    return fromState || fromQuery || null;
  }, [location.search, location.state]);

  const [isLoadingSurvey, setIsLoadingSurvey] = useState(true);
  const [survey, setSurvey] = useState<SurveyDefinition | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hasAcceptedAcknowledgement, setHasAcceptedAcknowledgement] = useState(false);
  const [acknowledgementChecked, setAcknowledgementChecked] = useState(false);
  const [answers, setAnswers] = useState<SurveyAnswerMap>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSurveyId, setSubmittedSurveyId] = useState<string | null>(null);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [isRating, setIsRating] = useState(false);

  useEffect(() => {
    if (!requestedSurveyId) {
      setLoadError("No survey ID provided.");
      setIsLoadingSurvey(false);
      return;
    }

    let isMounted = true;

    const loadSurvey = async () => {
      setIsLoadingSurvey(true);
      setLoadError(null);
      setHasAcceptedAcknowledgement(false);
      setAcknowledgementChecked(false);
      setValidationErrors({});

      try {
        const apiSurvey = await api.get<ApiSurvey>(`/surveys/${requestedSurveyId}`);
        if (!isMounted) return;

        const raw = apiSurveyToRaw(apiSurvey);
        const normalized = normalizeSurveyDefinition(raw, raw.surveyId);
        setSurvey(normalized);
      } catch (err) {
        if (!isMounted) return;
        setLoadError(err instanceof Error ? err.message : "Failed to load survey.");
      } finally {
        if (isMounted) setIsLoadingSurvey(false);
      }
    };

    void loadSurvey();
    return () => { isMounted = false; };
  }, [requestedSurveyId]);

  useEffect(() => {
    if (!survey) return;
    const restoredProgress = browserSurveySessionStorage.loadProgress(survey.surveyId);
    if (restoredProgress) {
      setAnswers(restoredProgress.answers);
      toast({ title: "Draft restored", description: "Saved survey progress has been loaded." });
      return;
    }
    setAnswers({});
  }, [survey, toast]);

  const orderedQuestions = useMemo(() => survey?.questions ?? [], [survey]);

  const answeredCount = useMemo(
    () => orderedQuestions.filter((q) => hasSurveyAnswer(q, answers[q.id])).length,
    [answers, orderedQuestions],
  );

  const progressValue =
    orderedQuestions.length === 0 ? 0 : (answeredCount / orderedQuestions.length) * 100;

  const updateAnswer = (questionId: string, value: SurveyAnswerValue) => {
    setAnswers((current) => ({ ...current, [questionId]: value }));
    setValidationErrors((current) => {
      if (!current[questionId]) return current;
      const next = { ...current };
      delete next[questionId];
      return next;
    });
  };

  const handleDeclineSurvey = () => navigate(ROUTES.forYou, { replace: true });

  const handleContinueLater = () => {
    if (!survey) return;
    browserSurveySessionStorage.saveProgress(survey.surveyId, answers);
    toast({ title: "Progress saved", description: "You can continue this survey later." });
    navigate(ROUTES.forYou);
  };

  const handleExitSurvey = () => {
    if (survey) browserSurveySessionStorage.clearProgress(survey.surveyId);
    setAnswers({});
    setValidationErrors({});
    toast({ title: "Survey exited", description: "You have opted out of this survey.", variant: "destructive" });
    navigate(ROUTES.forYou);
  };

  const handleSubmitSurvey = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!survey || !requestedSurveyId) return;

    const requiredErrors = getSurveyRequiredErrors(orderedQuestions, answers);
    if (Object.keys(requiredErrors).length > 0) {
      setValidationErrors(requiredErrors);
      toast({ title: "Missing required responses", description: "Please complete all required questions.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const answersPayload = orderedQuestions.map((q) => ({
        question_id: parseInt(q.id),
        answer_text: serializeAnswer(answers[q.id] ?? null),
      }));

      const result = await api.post<{ response_id: number; points_earned: number }>(
        `/surveys/${requestedSurveyId}/submit`,
        { answers: answersPayload },
      );

      browserSurveySessionStorage.clearProgress(survey.surveyId);

      toast({
        title: "Survey submitted!",
        description: `You earned ${result.points_earned} point${result.points_earned !== 1 ? "s" : ""}!`,
      });

      setPointsEarned(result.points_earned);
      setSubmittedSurveyId(requestedSurveyId);
    } catch (err) {
      toast({
        title: "Submission failed",
        description: err instanceof Error ? err.message : "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitRating = async () => {
    if (!submittedSurveyId || !selectedRating) return;
    setIsRating(true);
    try {
      await api.post(`/surveys/${submittedSurveyId}/rate`, { rating: selectedRating });
    } catch {
      // silently ignore rating errors
    } finally {
      setIsRating(false);
      navigate(ROUTES.forYou);
    }
  };

  if (submittedSurveyId) {
    return (
      <AppShell withContainer mainClassName="max-w-4xl pb-12 pt-24" backgroundClassName="bg-gradient-subtle">
        <Card className="p-8 text-center border-border/50 bg-card/50 backdrop-blur space-y-6">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Survey Submitted!</h2>
            <p className="text-muted-foreground">
              You earned {pointsEarned} point{pointsEarned !== 1 ? "s" : ""}. How would you rate this survey?
            </p>
          </div>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setSelectedRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    star <= (hoveredRating || selectedRating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
          </div>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate(ROUTES.forYou)}>
              Skip
            </Button>
            <Button
              disabled={!selectedRating || isRating}
              onClick={() => { void submitRating(); }}
            >
              {isRating ? "Submitting..." : "Submit Rating"}
            </Button>
          </div>
        </Card>
      </AppShell>
    );
  }

  if (isLoadingSurvey) {
    return (
      <AppShell withContainer mainClassName="max-w-4xl pb-12 pt-24">
        <Card className="border-border/50 bg-card/50 p-8 backdrop-blur">
          <p className="text-muted-foreground">Loading survey...</p>
        </Card>
      </AppShell>
    );
  }

  if (loadError || !survey) {
    return (
      <AppShell withContainer mainClassName="max-w-4xl pb-12 pt-24">
        <Card className="space-y-4 border-border/50 bg-card/50 p-8 backdrop-blur">
          <h1 className="text-2xl font-semibold">Survey not found</h1>
          <p className="text-muted-foreground">{loadError ?? "This survey does not exist or is no longer active."}</p>
          <Button onClick={() => navigate(ROUTES.forYou)}>Back to For You</Button>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell withContainer mainClassName="max-w-4xl space-y-6 pb-12 pt-24" backgroundClassName="bg-gradient-subtle">
      <Card className="space-y-4 border-border/50 bg-card/50 p-6 backdrop-blur">
        <div>
          <h1 className="mb-2 text-3xl font-bold">{survey.title}</h1>
          <p className="text-muted-foreground">{survey.description}</p>
        </div>

        <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4" />
            <span>Start: {formatSurveyDate(survey.startDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4" />
            <span>End: {formatSurveyDate(survey.endDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4" />
            <span>Time limit: {survey.timeLimitMinutes ?? "N/A"} mins</span>
          </div>
        </div>
      </Card>

      {hasAcceptedAcknowledgement ? (
        <form onSubmit={(e) => { void handleSubmitSurvey(e); }} className="space-y-6">
          <Card className="space-y-4 border-border/50 bg-card/50 p-6 backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ListChecks className="h-4 w-4" />
                <span>{answeredCount}/{orderedQuestions.length} answered</span>
              </div>
              <span className="text-sm font-medium">{Math.round(progressValue)}%</span>
            </div>
            <Progress value={progressValue} />
          </Card>

          {orderedQuestions.map((question) => (
            <Card key={question.id} className="space-y-4 border-border/50 bg-card/50 p-6 backdrop-blur">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">Q{question.order}</Badge>
                  {question.required ? (
                    <Badge className="border-destructive/30 bg-destructive/10 text-destructive">Required</Badge>
                  ) : null}
                </div>
                <h3 className="text-lg font-semibold">{question.text}</h3>
              </div>

              {renderSurveyQuestionInput(question, answers[question.id], updateAnswer)}

              {validationErrors[question.id] ? (
                <p className="text-sm text-destructive">{validationErrors[question.id]}</p>
              ) : null}
            </Card>
          ))}

          <Separator />

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="button" variant="outline" onClick={handleExitSurvey} disabled={isSubmitting}>
                Exit Survey
              </Button>
              <Button type="button" variant="outline" onClick={handleContinueLater} disabled={isSubmitting}>
                Continue Later
              </Button>
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Survey"}
            </Button>
          </div>
        </form>
      ) : (
        <Card className="space-y-4 border-border/50 bg-card/50 p-6 backdrop-blur">
          <h2 className="mb-4 text-2xl font-semibold">Acknowledgement</h2>
          <p className="mb-4 text-muted-foreground">{survey.acknowledgement}</p>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="acknowledge"
              checked={acknowledgementChecked}
              onCheckedChange={(checked) => setAcknowledgementChecked(checked === true)}
            />
            <Label htmlFor="acknowledge">I agree to the terms above</Label>
          </div>
          <div className="mt-6 flex gap-3">
            <Button variant="outline" onClick={handleDeclineSurvey}>Decline</Button>
            <Button
              onClick={() => setHasAcceptedAcknowledgement(true)}
              disabled={!acknowledgementChecked}
            >
              Accept and Start
            </Button>
          </div>
        </Card>
      )}
    </AppShell>
  );
};

export default Survey;
