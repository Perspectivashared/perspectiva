import { useEffect, useReducer } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, GripVertical, Copy, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  createInitialSurveyBuilderState,
  surveyBuilderReducer,
} from "@/features/survey-builder/domain/reducer";
import { validateDraftSurvey } from "@/features/survey-builder/domain/validation";
import { mapSurveyDefinitionToDraftSurvey } from "@/features/survey-builder/domain/mappers";
import { CommunitySelector } from "@/features/survey-builder/components/community-selector";
import { api } from "@/lib/api";
import { normalizeSurveyDefinition } from "@/features/surveys/domain/normalizers";
import { AppShell } from "@/shared/components/layout/AppShell";
import { QuestionTypeSelector } from "@/features/survey-builder/components/question-type-selector";
import { ROUTES, getSurveyAnalyticsRoute } from "@/lib/routes";
import { CATEGORY_LIST } from "@/components/SurveyCard";
import { queryKeys } from "@/lib/query-keys";
import {
  API_TO_QUESTION_TYPE,
  QUESTION_TYPE_TO_API,
} from "@/features/surveys/domain/question-type-mappers";

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
  category: string | null;
  community_id: string | null;
  deadline: string | null;
  time_limit_minutes: number | null;
  published_at: string | null;
  created_at: string;
  questions: ApiSurveyQuestion[];
}

interface ApiSurveyOut {
  id: number;
  status: string;
}

async function fetchSurveyFromApi(surveyId: string): Promise<ApiSurvey> {
  return api.get<ApiSurvey>(`/surveys/${surveyId}`);
}

const SURVEY_EDIT_STALE_TIME_MS = 300_000;
const SURVEY_EDIT_GC_TIME_MS = 1_800_000;

const SurveyEdit = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [state, dispatch] = useReducer(
    surveyBuilderReducer,
    undefined,
    createInitialSurveyBuilderState,
  );

  const surveyQuery = useQuery({
    queryKey: queryKeys.survey(surveyId ?? ""),
    queryFn: async () => {
      if (!surveyId) throw new Error("Missing survey id");
      return fetchSurveyFromApi(surveyId);
    },
    enabled: Boolean(surveyId),
    staleTime: SURVEY_EDIT_STALE_TIME_MS,
    gcTime: SURVEY_EDIT_GC_TIME_MS,
  });

  // Load draft into form state when survey data arrives
  useEffect(() => {
    if (!surveyQuery.data) return;
    const raw = surveyQuery.data;
    const normalized = normalizeSurveyDefinition(
      {
        surveyId: String(raw.id),
        title: raw.title,
        description: raw.description,
        acknowledgement: raw.acknowledgement || "",
        startDate: raw.published_at ?? raw.created_at,
        endDate: raw.deadline ?? undefined,
        timeLimitMinutes: raw.time_limit_minutes ?? undefined,
        questions: raw.questions.map((q) => ({
          id: String(q.id),
          order: q.order,
          type: API_TO_QUESTION_TYPE[q.question_type] ?? "shortText",
          text: q.question_text,
          required: q.required,
          options: q.options.map((o) => ({ label: o.text, value: o.text })),
        })),
      },
      String(raw.id),
    );
    dispatch({
      type: "LOAD_DRAFT",
      payload: {
        ...mapSurveyDefinitionToDraftSurvey(normalized),
        acknowledgement: raw.acknowledgement || "",
        category: raw.community_id || "",
        surveyCategory: raw.category || "",
        timeLimitMinutes: raw.time_limit_minutes ?? null,
      },
    });
  }, [surveyQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!surveyId) throw new Error("Missing survey id");
      const payload = {
        title: state.surveyTitle.trim(),
        description: state.surveyDescription.trim(),
        acknowledgement: state.acknowledgement.trim(),
        community_id: state.category || null,
        category: state.surveyCategory || null,
        target_responses: state.targetResponses,
        deadline: state.deadline ? new Date(state.deadline).toISOString() : null,
        time_limit_minutes: state.timeLimitMinutes || null,
        questions: state.questions.map((q, i) => ({
          order: i + 1,
          question_type: QUESTION_TYPE_TO_API[q.type] ?? q.type,
          question_text: q.question.trim(),
          required: q.required,
          options: q.options.map((o) => ({ text: o.text.trim() })).filter((o) => o.text),
        })),
      };
      return api.put<ApiSurveyOut>(`/surveys/${surveyId}`, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.mySurveys() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.survey(surveyId ?? "") });
      toast({ title: "Draft saved", description: "Your survey has been updated." });
    },
    onError: (err) => {
      toast({
        title: "Failed to save",
        description: err instanceof Error ? err.message : "Something went wrong.",
        variant: "destructive",
      });
    },
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      if (!surveyId) throw new Error("Missing survey id");
      // Save latest changes first, then publish
      await saveMutation.mutateAsync();
      return api.post<ApiSurveyOut>(`/surveys/${surveyId}/publish`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.mySurveys() });
      navigate(ROUTES.surveyPublished, {
        state: { surveyId: Number(surveyId), surveyTitle: state.surveyTitle.trim() },
      });
    },
    onError: (err) => {
      toast({
        title: "Failed to publish",
        description: err instanceof Error ? err.message : "Something went wrong.",
        variant: "destructive",
      });
    },
  });

  const handleSaveChanges = () => {
    const error = validateDraftSurvey(state);
    if (error) {
      toast({ title: "Cannot save", description: error, variant: "destructive" });
      return;
    }
    saveMutation.mutate();
  };

  const handlePublish = () => {
    const error = validateDraftSurvey(state);
    if (error) {
      toast({ title: "Survey not ready", description: error, variant: "destructive" });
      return;
    }
    publishMutation.mutate();
  };

  const isLoading = surveyQuery.isFetching || surveyQuery.isLoading;
  const isBusy = saveMutation.isPending || publishMutation.isPending;

  // Status guard — only drafts can be edited
  if (!isLoading && surveyQuery.data && surveyQuery.data.status !== "draft") {
    return (
      <AppShell withContainer mainClassName="max-w-4xl px-4 pb-12 pt-24" backgroundClassName="bg-gradient-subtle">
        <Card className="space-y-4 border-border/50 bg-card/50 p-8 backdrop-blur text-center">
          <h2 className="text-2xl font-semibold">Cannot edit this survey</h2>
          <p className="text-muted-foreground">
            Only draft surveys can be edited. This survey is{" "}
            <span className="font-semibold capitalize">{surveyQuery.data.status}</span>.
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
            {surveyId && (
              <Button asChild>
                <Link to={getSurveyAnalyticsRoute(surveyId)}>View Analytics</Link>
              </Button>
            )}
          </div>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell withContainer mainClassName="max-w-4xl px-4 pb-12 pt-24" backgroundClassName="bg-gradient-subtle">
      <div className="mb-8">
        <h1 className="mb-3 text-4xl font-bold">
          <span className="bg-gradient-primary bg-clip-text text-transparent">
            Edit Survey
          </span>
        </h1>
        <p className="text-lg text-muted-foreground">
          Update your survey details and questions.
        </p>
      </div>

      {isLoading && (
        <Card className="border-border/50 bg-card/50 p-8 backdrop-blur">
          <p className="text-muted-foreground">Loading survey details...</p>
        </Card>
      )}

      {!isLoading && surveyQuery.isError && (
        <Card className="space-y-4 border-border/50 bg-card/50 p-8 backdrop-blur">
          <h2 className="text-2xl font-semibold">Survey unavailable</h2>
          <p className="text-muted-foreground">
            {surveyQuery.error instanceof Error ? surveyQuery.error.message : "Unable to load survey."}
          </p>
          <Button onClick={() => navigate(-1)} variant="outline">Back</Button>
        </Card>
      )}

      {!isLoading && !surveyQuery.isError && (
        <div className="space-y-6">
          {/* Metadata card */}
          <Card className="border-border/50 bg-card/50 p-6 backdrop-blur">
            <div className="space-y-4">
              <div>
                <Label>Survey Title</Label>
                <Input
                  placeholder="Enter survey title"
                  value={state.surveyTitle}
                  onChange={(e) => dispatch({ type: "SET_FIELD", field: "surveyTitle", value: e.target.value })}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  placeholder="What is this survey about?"
                  value={state.surveyDescription}
                  onChange={(e) => dispatch({ type: "SET_FIELD", field: "surveyDescription", value: e.target.value })}
                  className="mt-2"
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label>Community</Label>
                  <CommunitySelector
                    value={state.category}
                    onValueChange={(value) => dispatch({ type: "SET_FIELD", field: "category", value })}
                  />
                </div>

                <div>
                  <Label>Category</Label>
                  <Select
                    value={state.surveyCategory}
                    onValueChange={(value) => dispatch({ type: "SET_FIELD", field: "surveyCategory", value })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_LIST.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Target Responses</Label>
                  <Input
                    type="number"
                    placeholder="100"
                    className="mt-2"
                    value={state.targetResponses ?? ""}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_FIELD",
                        field: "targetResponses",
                        value: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    min={1}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Deadline</Label>
                  <Input
                    type="date"
                    className="mt-2"
                    value={state.deadline}
                    onChange={(e) => dispatch({ type: "SET_FIELD", field: "deadline", value: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Time Limit (minutes)</Label>
                  <Input
                    type="number"
                    placeholder="No limit"
                    className="mt-2"
                    value={state.timeLimitMinutes ?? ""}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_FIELD",
                        field: "timeLimitMinutes",
                        value: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    min={1}
                    max={180}
                  />
                </div>
              </div>

              <div>
                <Label>Participant Consent Statement</Label>
                <Textarea
                  placeholder="Leave blank for the default consent statement."
                  value={state.acknowledgement}
                  onChange={(e) => dispatch({ type: "SET_FIELD", field: "acknowledgement", value: e.target.value })}
                  className="mt-2"
                  rows={2}
                />
              </div>
            </div>
          </Card>

          {/* Questions */}
          {state.questions.map((question, index) => (
            <Card key={question.id} className="border-border/50 bg-card/50 p-6 backdrop-blur">
              <div className="flex items-start gap-4">
                <div className="mt-8 cursor-move">
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                </div>

                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <Badge variant="secondary">Question {index + 1}</Badge>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => dispatch({ type: "DUPLICATE_QUESTION", questionId: question.id })}
                        type="button"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => dispatch({ type: "REMOVE_QUESTION", questionId: question.id })}
                        type="button"
                        className="text-red-500 hover:text-red-600 hover:border-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Question</Label>
                      <Input
                        value={question.question}
                        onChange={(e) =>
                          dispatch({
                            type: "UPDATE_QUESTION",
                            questionId: question.id,
                            updates: { question: e.target.value },
                          })
                        }
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label>Type</Label>
                      <QuestionTypeSelector
                        value={question.type}
                        onValueChange={(value) =>
                          dispatch({
                            type: "UPDATE_QUESTION",
                            questionId: question.id,
                            updates: { type: value },
                          })
                        }
                        className="mt-2 w-full"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={question.required}
                      onCheckedChange={(value) =>
                        dispatch({
                          type: "UPDATE_QUESTION",
                          questionId: question.id,
                          updates: { required: Boolean(value) },
                        })
                      }
                    />
                    <Label className="cursor-pointer">Required</Label>
                  </div>

                  {(question.type === "multiple-choice" ||
                    question.type === "checkboxes" ||
                    question.type === "dropdown") && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold">Options</h4>
                      {question.options.map((option) => (
                        <div key={option.id} className="flex gap-2">
                          <Input
                            value={option.text}
                            onChange={(e) =>
                              dispatch({
                                type: "UPDATE_OPTION",
                                questionId: question.id,
                                optionId: option.id,
                                value: e.target.value,
                              })
                            }
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              dispatch({
                                type: "REMOVE_OPTION",
                                questionId: question.id,
                                optionId: option.id,
                              })
                            }
                            type="button"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => dispatch({ type: "ADD_OPTION", questionId: question.id })}
                        type="button"
                      >
                        Add Option
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={() => dispatch({ type: "ADD_QUESTION" })}
            type="button"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Question
          </Button>

          {/* Action bar */}
          <Card className="border-border/50 bg-card/50 p-6 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-muted-foreground">
                Cost: <span className="font-bold text-primary">2 Points</span> to publish
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={handleSaveChanges}
                  disabled={isBusy}
                  type="button"
                >
                  {saveMutation.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
                <Button
                  onClick={handlePublish}
                  disabled={isBusy}
                  type="button"
                >
                  {publishMutation.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Publishing...</>
                  ) : (
                    "Publish Survey"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate(-1)}
                  disabled={isBusy}
                  type="button"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </AppShell>
  );
};

export default SurveyEdit;
