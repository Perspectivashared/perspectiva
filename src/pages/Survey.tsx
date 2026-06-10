import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ROUTES } from "@/lib/routes";
import { api, ApiError } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import {
  formatSurveyDate,
  normalizeSurveyDefinition,
} from "@/features/surveys/domain/normalizers";
import {
  type SurveyAnswerMap,
  type SurveyAnswerValue,
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
import { CalendarClock, CheckCircle2, Clock, Clock3, ListChecks, Star } from "lucide-react";
import { API_TO_QUESTION_TYPE } from "@/features/surveys/domain/question-type-mappers";

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
  status: string;
  deadline: string | null;
  time_limit_minutes: number | null;
  published_at: string | null;
  created_at: string;
  questions: ApiSurveyQuestion[];
}

interface ApiAchievement {
  id: number;
  name: string;
  description: string;
  points_reward: number;
  coins_reward: number;
}

interface SubmitResponseOut {
  response_id: number;
  points_earned: number;
  newly_unlocked_achievements?: ApiAchievement[];
}

function mapQuestionType(backendType: string): QuestionType {
  const mapped = API_TO_QUESTION_TYPE[backendType];
  if (!mapped) {
    console.warn(`[Survey] Unknown question type: "${backendType}". Falling back to shortText.`);
    return "shortText";
  }
  return mapped;
}

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
      type: mapQuestionType(q.question_type),
      text: q.question_text,
      required: q.required,
      options: q.options.map((o) => ({ label: o.text, value: o.text })),
    })),
  };
}

function serializeAnswer(value: SurveyAnswerValue): string {
  if (value === null || value === undefined) return "";
  // Multi-select answers are sent as a JSON array — the backend stores JSON
  // arrays verbatim, so option text containing commas survives intact.
  // (A plain comma-join would be re-split server-side and corrupt the answer.)
  if (Array.isArray(value)) return JSON.stringify(value);
  return String(value);
}

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

const Survey = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  // Completion time tracking
  const startedAtRef = useRef<number | null>(null);

  // Time limit countdown
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: myRatingData } = useQuery({
    queryKey: queryKeys.myRating(surveyId ?? ""),
    queryFn: () => api.get<{ rating: number | null }>(`/surveys/${surveyId}/my-rating`),
    enabled: !!surveyId,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (myRatingData?.rating != null) {
      setSelectedRating(myRatingData.rating);
    }
  }, [myRatingData]);

  const { data: survey, isPending: isLoadingSurvey, error: surveyError } = useQuery({
    queryKey: queryKeys.survey(surveyId ?? ""),
    queryFn: async () => {
      if (!surveyId) throw new Error("No survey ID provided.");
      const apiSurvey = await api.get<ApiSurvey>(`/surveys/${surveyId}`);
      if (apiSurvey.status === "closed") {
        throw new ApiError(410, "This survey has closed.");
      }
      const raw = apiSurveyToRaw(apiSurvey);
      return { normalized: normalizeSurveyDefinition(raw, raw.surveyId), raw: apiSurvey };
    },
    enabled: !!surveyId,
    staleTime: 0,
    retry: false,
  });

  const normalizedSurvey = survey?.normalized;
  const isClosed = surveyError instanceof ApiError && surveyError.status === 410;
  const loadError = !surveyId
    ? "No survey ID provided."
    : isClosed
    ? null // handled separately
    : surveyError instanceof Error ? surveyError.message
    : surveyError ? "Failed to load survey."
    : null;

  // Restore saved progress when survey loads
  useEffect(() => {
    if (!normalizedSurvey) return;
    setHasAcceptedAcknowledgement(false);
    setAcknowledgementChecked(false);
    setValidationErrors({});
    const restoredProgress = browserSurveySessionStorage.loadProgress(normalizedSurvey.surveyId);
    if (restoredProgress) {
      setAnswers(restoredProgress.answers);
      if (restoredProgress.startedAt) {
        startedAtRef.current = new Date(restoredProgress.startedAt).getTime();
      }
      toast({ title: "Draft restored", description: "Saved survey progress has been loaded." });
    } else {
      setAnswers({});
    }
  }, [normalizedSurvey, toast]);

  // Start time limit countdown when the user begins the survey
  useEffect(() => {
    if (!hasAcceptedAcknowledgement || !normalizedSurvey?.timeLimitMinutes) {
      return;
    }

    const totalSeconds = normalizedSurvey.timeLimitMinutes * 60;
    const elapsed = startedAtRef.current
      ? Math.floor((Date.now() - startedAtRef.current) / 1000)
      : 0;
    const remaining = Math.max(0, totalSeconds - elapsed);
    setTimeRemainingSeconds(remaining);

    countdownRef.current = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev === null || prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [hasAcceptedAcknowledgement, normalizedSurvey?.timeLimitMinutes]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeRemainingSeconds === 0 && hasAcceptedAcknowledgement && !isSubmitting && !submittedSurveyId) {
      toast({ title: "Time's up!", description: "Submitting your responses automatically.", variant: "destructive" });
      void submitAnswers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemainingSeconds]);

  const orderedQuestions = normalizedSurvey?.questions ?? [];
  const answeredCount = orderedQuestions.filter((q) => hasSurveyAnswer(q, answers[q.id])).length;
  const progressValue = orderedQuestions.length === 0 ? 0 : (answeredCount / orderedQuestions.length) * 100;

  const updateAnswer = useCallback((questionId: string, value: SurveyAnswerValue) => {
    setAnswers((current) => ({ ...current, [questionId]: value }));
    setValidationErrors((current) => {
      if (!current[questionId]) return current;
      const next = { ...current };
      delete next[questionId];
      return next;
    });
  }, []);

  const handleAcceptAcknowledgement = () => {
    const now = Date.now();
    startedAtRef.current = now;
    // Persist startedAt so a resumed session can calculate elapsed time
    if (normalizedSurvey) {
      browserSurveySessionStorage.saveProgress(
        normalizedSurvey.surveyId,
        answers,
        new Date(now).toISOString(),
      );
    }
    setHasAcceptedAcknowledgement(true);
  };

  const handleDeclineSurvey = () => navigate(ROUTES.forYou, { replace: true });

  const handleContinueLater = () => {
    if (!normalizedSurvey) return;
    browserSurveySessionStorage.saveProgress(
      normalizedSurvey.surveyId,
      answers,
      startedAtRef.current ? new Date(startedAtRef.current).toISOString() : undefined,
    );
    toast({ title: "Progress saved", description: "You can continue this survey later." });
    navigate(ROUTES.forYou);
  };

  const handleExitSurvey = () => {
    if (normalizedSurvey) browserSurveySessionStorage.clearProgress(normalizedSurvey.surveyId);
    setAnswers({});
    setValidationErrors({});
    toast({ title: "Survey exited", variant: "destructive" });
    navigate(ROUTES.forYou);
  };

  const submitAnswers = async (skipValidation = false) => {
    if (!normalizedSurvey || !surveyId) return;

    if (!skipValidation) {
      const requiredErrors = getSurveyRequiredErrors(orderedQuestions, answers);
      if (Object.keys(requiredErrors).length > 0) {
        setValidationErrors(requiredErrors);
        toast({ title: "Missing required responses", description: "Please complete all required questions.", variant: "destructive" });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // Only send answered questions — empty rows would inflate the backend's
      // per-question answer counts and completion-rate analytics.
      const answersPayload = orderedQuestions
        .map((q) => ({
          question_id: Number.parseInt(q.id, 10),
          answer_text: serializeAnswer(answers[q.id] ?? null),
        }))
        .filter((a) => a.answer_text.trim() !== "");

      const completionSeconds = startedAtRef.current
        ? Math.round((Date.now() - startedAtRef.current) / 1000)
        : undefined;

      const result = await api.post<SubmitResponseOut>(
        `/surveys/${surveyId}/submit`,
        { answers: answersPayload, completion_seconds: completionSeconds },
      );

      browserSurveySessionStorage.clearProgress(normalizedSurvey.surveyId);

      toast({
        title: "Survey submitted!",
        description: `You earned ${result.points_earned} point${result.points_earned === 1 ? "" : "s"}!`,
      });

      // Show achievement unlock toasts
      if (result.newly_unlocked_achievements?.length) {
        for (const achievement of result.newly_unlocked_achievements) {
          toast({
            title: `Achievement unlocked: ${achievement.name}`,
            description: `${achievement.description}${achievement.points_reward > 0 ? ` (+${achievement.points_reward} pts)` : ""}`,
          });
        }
      }

      // Invalidate achievements so Profile shows the new ones
      void queryClient.invalidateQueries({ queryKey: queryKeys.myAchievements() });

      setPointsEarned(result.points_earned);
      setSubmittedSurveyId(surveyId);
    } catch (err) {
      console.error("[Survey] Submission failed:", err);
      toast({
        title: "Submission failed",
        description: err instanceof Error ? err.message : "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitSurvey = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submitAnswers(false);
  };

  const submitRating = async () => {
    if (submittedSurveyId === null || selectedRating === 0) return;
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

  // ─── Render states ────────────────────────────────────────────────────────

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
                aria-label={`Rate ${star} out of 5`}
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
            <Button variant="outline" onClick={() => navigate(ROUTES.forYou)}>Skip</Button>
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

  if (isClosed) {
    return (
      <AppShell withContainer mainClassName="max-w-4xl pb-12 pt-24">
        <Card className="space-y-4 border-border/50 bg-card/50 p-8 backdrop-blur text-center">
          <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-semibold">Survey Closed</h1>
          <p className="text-muted-foreground">This survey is no longer accepting responses.</p>
          <Button onClick={() => navigate(ROUTES.forYou)}>Browse Open Surveys</Button>
        </Card>
      </AppShell>
    );
  }

  if (loadError || !normalizedSurvey) {
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

  const timeLimitWarning =
    timeRemainingSeconds !== null && timeRemainingSeconds <= 120 && timeRemainingSeconds > 0;
  const timeLimitCritical =
    timeRemainingSeconds !== null && timeRemainingSeconds <= 30 && timeRemainingSeconds > 0;

  return (
    <AppShell withContainer mainClassName="max-w-4xl space-y-6 pb-12 pt-24" backgroundClassName="bg-gradient-subtle">
      {/* Survey info card */}
      <Card className="space-y-4 border-border/50 bg-card/50 p-6 backdrop-blur">
        <div>
          <h1 className="mb-2 text-3xl font-bold">{normalizedSurvey.title}</h1>
          <p className="text-muted-foreground">{normalizedSurvey.description}</p>
        </div>

        <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4" />
            <span>Start: {formatSurveyDate(normalizedSurvey.startDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4" />
            <span>End: {formatSurveyDate(normalizedSurvey.endDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4" />
            <span>
              Time limit:{" "}
              {timeRemainingSeconds !== null ? (
                <span
                  className={`font-semibold tabular-nums ${
                    timeLimitCritical
                      ? "text-destructive"
                      : timeLimitWarning
                      ? "text-amber-500"
                      : ""
                  }`}
                >
                  {formatCountdown(timeRemainingSeconds)} remaining
                </span>
              ) : normalizedSurvey.timeLimitMinutes ? (
                `${normalizedSurvey.timeLimitMinutes} mins`
              ) : (
                "N/A"
              )}
            </span>
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Survey"}
            </Button>
          </div>
        </form>
      ) : (
        <Card className="space-y-4 border-border/50 bg-card/50 p-6 backdrop-blur">
          <h2 className="mb-4 text-2xl font-semibold">Acknowledgement</h2>
          <p className="mb-4 text-muted-foreground">{normalizedSurvey.acknowledgement}</p>
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
              onClick={handleAcceptAcknowledgement}
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
