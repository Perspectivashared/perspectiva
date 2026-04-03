import { useEffect, useMemo, useReducer, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, GripVertical, Copy } from "@/components/icons/simple-icons";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  createInitialSurveyBuilderState,
  surveyBuilderReducer,
} from "@/features/survey-builder/domain/reducer";
import { validateDraftSurvey } from "@/features/survey-builder/domain/validation";
import {
  mapDraftSurveyToRawSurveyPayload,
  mapSurveyDefinitionToDraftSurvey,
} from "@/features/survey-builder/domain/mappers";
import {
  SURVEY_BUILDER_CATEGORY_OPTIONS,
} from "@/features/survey-builder/domain/question-types";
import {
  hasDraftSurvey,
  loadDraftSurvey,
  saveDraftSurvey,
  clearDraftSurvey,
} from "@/features/survey-builder/services/draft-storage";
import {
  fetchSurveyById,
  saveSurvey,
} from "@/features/surveys/services/survey-service";
import { AppShell } from "@/shared/components/layout/AppShell";
import { QuestionTypeSelector } from "@/features/survey-builder/components/question-type-selector";
import type { RawSurveyPayload } from "@/features/surveys/domain/types";

const SURVEY_EDIT_STALE_TIME_MS = 300_000;
const SURVEY_EDIT_GC_TIME_MS = 1_800_000;

const SurveyEdit = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [state, dispatch] = useReducer(
    surveyBuilderReducer,
    undefined,
    createInitialSurveyBuilderState,
  );
  const [hasSavedDraft, setHasSavedDraft] = useState(false);

  const surveyQuery = useQuery({
    queryKey: ["survey", surveyId],
    queryFn: async () => {
      if (!surveyId) {
        throw new Error("Missing survey id");
      }
      return fetchSurveyById(surveyId);
    },
    enabled: Boolean(surveyId),
    staleTime: SURVEY_EDIT_STALE_TIME_MS,
    gcTime: SURVEY_EDIT_GC_TIME_MS,
  });

  const saveSurveyMutation = useMutation({
    mutationFn: async (payload: RawSurveyPayload) => saveSurvey(payload),
    onSuccess: () => {
      toast({
        title: "Survey saved",
        description: "Your survey has been updated successfully.",
      });
    },
  });

  useEffect(() => {
    setHasSavedDraft(hasDraftSurvey());
  }, []);

  useEffect(() => {
    if (!surveyQuery.data) {
      return;
    }

    dispatch({
      type: "LOAD_DRAFT",
      payload: mapSurveyDefinitionToDraftSurvey(surveyQuery.data),
    });
  }, [surveyQuery.data]);

  const saveDraft = () => {
    saveDraftSurvey(state);
    setHasSavedDraft(true);
    toast({
      title: "Draft saved",
      description: "Your survey draft was saved locally.",
    });
  };

  const discardDraft = () => {
    clearDraftSurvey();
    setHasSavedDraft(false);
    toast({
      title: "Draft removed",
      description: "Your local draft has been cleared.",
    });
  };

  const publishSurvey = () => {
    const validationError = validateDraftSurvey(state);
    if (validationError) {
      toast({
        title: "Survey not ready",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    const payload: RawSurveyPayload = mapDraftSurveyToRawSurveyPayload(
      state,
      surveyId ?? "",
    );
    saveSurveyMutation.mutate(payload);
  };

  const loadDraft = () => {
    const draft = loadDraftSurvey();

    if (!draft) {
      toast({
        title: "No valid draft found",
        description: "There is no valid local draft to load.",
        variant: "destructive",
      });
      return;
    }

    dispatch({
      type: "LOAD_DRAFT",
      payload: draft,
    });

    toast({
      title: "Draft loaded",
      description: "Your saved survey draft is now loaded.",
    });
  };

  const isLoading = surveyQuery.isFetching || surveyQuery.isLoading;
  const surveyLoadErrorMessage =
    surveyQuery.error instanceof Error
      ? surveyQuery.error.message
      : "Unable to load survey details.";

  return (
    <AppShell
      withContainer
      mainClassName="max-w-4xl px-4 pb-12 pt-24"
      backgroundClassName="bg-gradient-subtle"
    >
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

      <div className="flex flex-col gap-4 mb-6">
        <Button onClick={() => navigate(-1)} variant="outline" size="sm">
          Back to Dashboard
        </Button>
        {hasSavedDraft && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Draft available
            </span>
            <Button size="sm" variant="outline" onClick={loadDraft}>
              Load Draft
            </Button>
            <Button size="sm" variant="outline" onClick={discardDraft}>
              Discard Draft
            </Button>
          </div>
        )}
      </div>

      {isLoading ? (
        <Card className="border-border/50 bg-card/50 p-8 backdrop-blur">
          <p className="text-muted-foreground">Loading survey details...</p>
        </Card>
      ) : surveyQuery.isError ? (
        <Card className="space-y-4 border-border/50 bg-card/50 p-8 backdrop-blur">
          <h2 className="text-2xl font-semibold">Survey unavailable</h2>
          <p className="text-muted-foreground">{surveyLoadErrorMessage}</p>
          <Button onClick={() => navigate(-1)} variant="outline">
            Back
          </Button>
        </Card>
      ) : (
        <>
          <Tabs defaultValue="create" className="mb-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Edit</TabsTrigger>
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
              <Card className="border-border/50 bg-card/50 p-6 backdrop-blur">
                <div className="space-y-4">
                  <div>
                    <Label>Survey Title</Label>
                    <Input
                      placeholder="Enter survey title"
                      value={state.surveyTitle}
                      onChange={(event) =>
                        dispatch({
                          type: "SET_FIELD",
                          field: "surveyTitle",
                          value: event.target.value,
                        })
                      }
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea
                      placeholder="What is this survey about?"
                      value={state.surveyDescription}
                      onChange={(event) =>
                        dispatch({
                          type: "SET_FIELD",
                          field: "surveyDescription",
                          value: event.target.value,
                        })
                      }
                      className="mt-2"
                      rows={3}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <Label>Category</Label>
                      <Select
                        value={state.category || undefined}
                        onValueChange={(value) =>
                          dispatch({
                            type: "SET_FIELD",
                            field: "category",
                            value,
                          })
                        }
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {SURVEY_BUILDER_CATEGORY_OPTIONS.map((category) => (
                            <SelectItem
                              key={category.value}
                              value={category.value}
                            >
                              {category.label}
                            </SelectItem>
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
                        onChange={(event) =>
                          dispatch({
                            type: "SET_FIELD",
                            field: "targetResponses",
                            value: event.target.value
                              ? Number(event.target.value)
                              : null,
                          })
                        }
                        min={1}
                      />
                    </div>

                    <div>
                      <Label>Deadline</Label>
                      <Input
                        type="date"
                        className="mt-2"
                        value={state.deadline}
                        onChange={(event) =>
                          dispatch({
                            type: "SET_FIELD",
                            field: "deadline",
                            value: event.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {state.questions.map((question, index) => (
                <Card
                  key={question.id}
                  className="border-border/50 bg-card/50 p-6 backdrop-blur"
                >
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
                            onClick={() =>
                              dispatch({
                                type: "DUPLICATE_QUESTION",
                                questionId: question.id,
                              })
                            }
                            type="button"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              dispatch({
                                type: "REMOVE_QUESTION",
                                questionId: question.id,
                              })
                            }
                            type="button"
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
                            onChange={(event) =>
                              dispatch({
                                type: "UPDATE_QUESTION",
                                questionId: question.id,
                                updates: { question: event.target.value },
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
                                onChange={(event) =>
                                  dispatch({
                                    type: "UPDATE_OPTION",
                                    questionId: question.id,
                                    optionId: option.id,
                                    value: event.target.value,
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
                            onClick={() =>
                              dispatch({
                                type: "ADD_OPTION",
                                questionId: question.id,
                              })
                            }
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

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={saveDraft}
                  disabled={saveSurveyMutation.status === "pending"}
                  type="button"
                >
                  Save Draft
                </Button>
                <Button
                  onClick={publishSurvey}
                  disabled={saveSurveyMutation.status === "pending"}
                  type="button"
                >
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate(-1)}
                  disabled={saveSurveyMutation.status === "pending"}
                  type="button"
                >
                  Cancel
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </AppShell>
  );
};

export default SurveyEdit;
