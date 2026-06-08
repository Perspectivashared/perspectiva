import { useReducer, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "@/lib/api";
import { ROUTES } from "@/lib/routes";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, GripVertical, Copy, Loader2, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  createId,
  createInitialSurveyBuilderState,
  surveyBuilderReducer,
} from "@/features/survey-builder/domain/reducer";
import { validateDraftSurvey } from "@/features/survey-builder/domain/validation";
import { AppShell } from "@/shared/components/layout/AppShell";
import { QuestionTypeSelector } from "@/features/survey-builder/components/question-type-selector";
import { CommunitySelector } from "@/features/survey-builder/components/community-selector";
import { CATEGORY_LIST } from "@/components/SurveyCard";
import type { SurveyBuilderQuestionType } from "@/features/survey-builder/domain/types";

interface ApiSurveyOut {
  id: number;
  status: string;
}

interface LocationState {
  draftId?: number;
  surveyTitle?: string;
  surveyDescription?: string;
  acknowledgement?: string;
  category?: string | null;
  surveyCategory?: string;
  timeLimitMinutes?: number | null;
  targetResponses?: number | null;
  deadline?: string;
  questions?: Array<{
    question: string;
    type: SurveyBuilderQuestionType;
    required: boolean;
    options: Array<{ text: string }>;
  }>;
}

function parseDeadlineIso(deadline: string): string | null {
  if (!deadline) return null;
  const d = new Date(deadline);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

const buildSurveyPayload = (state: ReturnType<typeof createInitialSurveyBuilderState>) => ({
  title: state.surveyTitle.trim(),
  description: state.surveyDescription.trim(),
  acknowledgement: state.acknowledgement.trim(),
  // state.category holds the selected community ID
  community_id: state.category || null,
  category: state.surveyCategory || null,
  target_responses: state.targetResponses,
  deadline: parseDeadlineIso(state.deadline),
  time_limit_minutes: state.timeLimitMinutes || null,
  questions: state.questions.map((q, i) => ({
    order: i + 1,
    question_type: q.type,
    question_text: q.question.trim(),
    required: q.required,
    options: q.options.map((o) => ({ text: o.text.trim() })).filter((o) => o.text),
  })),
});

const CreateSurvey = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state ?? {}) as LocationState;

  const [state, dispatch] = useReducer(
    surveyBuilderReducer,
    undefined,
    () => {
      const initial = createInitialSurveyBuilderState();
      if (locationState.surveyTitle) {
        return {
          ...initial,
          surveyTitle: locationState.surveyTitle ?? "",
          surveyDescription: locationState.surveyDescription ?? "",
          acknowledgement: locationState.acknowledgement ?? "",
          category: locationState.category ?? "",
          surveyCategory: locationState.surveyCategory ?? "",
          timeLimitMinutes: locationState.timeLimitMinutes ?? null,
          targetResponses: locationState.targetResponses ?? null,
          deadline: locationState.deadline ?? "",
          questions: locationState.questions?.map((q) => ({
            id: createId(),
            type: q.type,
            question: q.question,
            required: q.required,
            options: q.options.map((o) => ({ id: createId(), text: o.text })),
          })) ?? initial.questions,
        };
      }
      return initial;
    },
  );

  const [draftId, setDraftId] = useState<number | null>(locationState.draftId ?? null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const saveDraft = useCallback(async () => {
    if (!state.surveyTitle.trim()) {
      toast({ title: "Add a title before saving", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      const payload = buildSurveyPayload(state);
      if (draftId) {
        await api.put<ApiSurveyOut>(`/surveys/${draftId}`, payload);
        toast({ title: "Draft updated", description: "Your draft has been saved." });
      } else {
        const created = await api.post<ApiSurveyOut>("/surveys", payload);
        setDraftId(created.id);
        toast({ title: "Draft saved", description: "Your draft has been saved." });
      }
    } catch (error) {
      toast({
        title: "Failed to save draft",
        description: error instanceof Error ? error.message : "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [state, draftId, toast]);

  const publishSurvey = useCallback(async () => {
    const validationError = validateDraftSurvey(state);
    if (validationError) {
      toast({ title: "Survey not ready", description: validationError, variant: "destructive" });
      return;
    }

    setIsPublishing(true);
    try {
      let surveyId = draftId;

      if (surveyId) {
        await api.put<ApiSurveyOut>(`/surveys/${surveyId}`, buildSurveyPayload(state));
      } else {
        const created = await api.post<ApiSurveyOut>("/surveys", buildSurveyPayload(state));
        surveyId = created.id;
      }

      await api.post<ApiSurveyOut>(`/surveys/${surveyId}/publish`);

      navigate(ROUTES.surveyPublished, {
        state: { surveyId, surveyTitle: state.surveyTitle.trim() },
      });
    } catch (error) {
      toast({
        title: "Failed to publish",
        description: error instanceof Error ? error.message : "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  }, [state, draftId, toast, navigate]);

  return (
    <AppShell withContainer mainClassName="max-w-4xl px-4 pb-12 pt-24" backgroundClassName="bg-gradient-subtle">
      <div className="mb-8">
        <h1 className="mb-3 text-4xl font-bold">
          <span className="bg-gradient-primary bg-clip-text text-transparent">
            {draftId ? "Edit Draft" : "Create Survey"}
          </span>
        </h1>
        <p className="text-lg text-muted-foreground">
          Build your survey from scratch
        </p>
      </div>

      <Tabs defaultValue="create" className="mb-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">Create New</TabsTrigger>
          <TabsTrigger value="import">Import</TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="mt-6">
          <Card className="border-border/50 bg-card/50 p-6 backdrop-blur">
            <div className="space-y-4">
              <p className="text-center text-muted-foreground">
                Import from Google Forms feature coming soon.
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="mt-6 space-y-6">
          {/* Survey metadata */}
          <Card className="border-border/50 bg-card/50 p-6 backdrop-blur">
            <div className="space-y-4">
              <div>
                <Label>Survey Title</Label>
                <Input
                  placeholder="Enter survey title"
                  value={state.surveyTitle}
                  onChange={(e) =>
                    dispatch({ type: "SET_FIELD", field: "surveyTitle", value: e.target.value })
                  }
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  placeholder="What is this survey about?"
                  value={state.surveyDescription}
                  onChange={(e) =>
                    dispatch({ type: "SET_FIELD", field: "surveyDescription", value: e.target.value })
                  }
                  className="mt-2"
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label>Community</Label>
                  <CommunitySelector
                    value={state.category}
                    onValueChange={(value) =>
                      dispatch({ type: "SET_FIELD", field: "category", value })
                    }
                  />
                </div>

                <div>
                  <Label>Category</Label>
                  <Select
                    value={state.surveyCategory}
                    onValueChange={(value) =>
                      dispatch({ type: "SET_FIELD", field: "surveyCategory", value })
                    }
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
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) =>
                      dispatch({ type: "SET_FIELD", field: "deadline", value: e.target.value })
                    }
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
                  placeholder="e.g. By proceeding, you agree that your responses will be used anonymously for research purposes. Leave blank for the default statement."
                  value={state.acknowledgement}
                  onChange={(e) =>
                    dispatch({ type: "SET_FIELD", field: "acknowledgement", value: e.target.value })
                  }
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
                        disabled={state.questions.length === 1}
                        type="button"
                        className="text-red-500 hover:text-red-600 hover:border-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Input
                    placeholder="Question"
                    value={question.question}
                    onChange={(e) =>
                      dispatch({
                        type: "UPDATE_QUESTION",
                        questionId: question.id,
                        updates: { question: e.target.value },
                      })
                    }
                  />

                  <div className="flex gap-4">
                    <QuestionTypeSelector
                      value={question.type}
                      onValueChange={(value) =>
                        dispatch({
                          type: "UPDATE_QUESTION",
                          questionId: question.id,
                          updates: { type: value },
                        })
                      }
                    />

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={question.required}
                        onChange={(e) =>
                          dispatch({
                            type: "UPDATE_QUESTION",
                            questionId: question.id,
                            updates: { required: e.target.checked },
                          })
                        }
                        className="h-4 w-4"
                      />
                      <span className="text-sm">Required</span>
                    </label>
                  </div>

                  {(question.type === "multiple-choice" ||
                    question.type === "checkboxes" ||
                    question.type === "dropdown") && (
                    <div className="ml-4 space-y-3">
                      {question.options.map((option, optionIndex) => (
                        <div key={option.id} className="flex items-center gap-2">
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
                            placeholder={`Option ${optionIndex + 1}`}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              dispatch({
                                type: "REMOVE_OPTION",
                                questionId: question.id,
                                optionId: option.id,
                              })
                            }
                            disabled={question.options.length <= 1}
                            className="text-red-500 hover:text-red-600 hover:border-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        onClick={() => dispatch({ type: "ADD_OPTION", questionId: question.id })}
                        variant="outline"
                        size="sm"
                        type="button"
                      >
                        <Plus className="mr-1 h-4 w-4" />
                        Add Option
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}

          <Button
            onClick={() => dispatch({ type: "ADD_QUESTION" })}
            variant="outline"
            className="w-full border-2 border-dashed"
            type="button"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Question
          </Button>

          {/* Action bar */}
          <Card className="border-border/50 bg-card/50 p-6 backdrop-blur">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Cost: <span className="font-bold text-primary">2 Points</span> to publish
                {Boolean(draftId) && <span className="ml-2 text-xs text-success">• Draft #{draftId}</span>}
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={saveDraft} disabled={isSaving || isPublishing}>
                  {isSaving ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
                  ) : (
                    <><Save className="mr-2 h-4 w-4" />Save as Draft</>
                  )}
                </Button>
                <Button
                  onClick={() => { void publishSurvey(); }}
                  type="button"
                  disabled={isPublishing || isSaving}
                >
                  {isPublishing ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Publishing...</>
                  ) : (
                    "Publish Survey"
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
};

export default CreateSurvey;
