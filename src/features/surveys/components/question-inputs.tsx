import { type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getRatingScale } from "@/features/surveys/domain/validation";
import {
  type QuestionType,
  type SurveyAnswerValue,
  type SurveyQuestion,
} from "@/features/surveys/domain/types";

type UpdateSurveyAnswer = (id: string, value: SurveyAnswerValue) => void;

const renderShortTextInput = (
  question: SurveyQuestion,
  answer: SurveyAnswerValue,
  updateAnswer: UpdateSurveyAnswer,
) => (
  <Input
    value={typeof answer === "string" ? answer : ""}
    onChange={(event) => updateAnswer(question.id, event.target.value)}
    placeholder={question.placeholder ?? "Type your answer"}
  />
);

const renderLongTextInput = (
  question: SurveyQuestion,
  answer: SurveyAnswerValue,
  updateAnswer: UpdateSurveyAnswer,
) => (
  <Textarea
    value={typeof answer === "string" ? answer : ""}
    onChange={(event) => updateAnswer(question.id, event.target.value)}
    placeholder={question.placeholder ?? "Type your answer"}
    rows={4}
  />
);

const renderRadioGroupInput = (
  question: SurveyQuestion,
  answer: SurveyAnswerValue,
  updateAnswer: UpdateSurveyAnswer,
) => (
  <RadioGroup
    value={typeof answer === "string" ? answer : ""}
    onValueChange={(value) => updateAnswer(question.id, value)}
    className="space-y-3"
  >
    {question.options.map((option) => (
      <div key={option.value} className="flex items-center space-x-2">
        <RadioGroupItem value={option.value} id={`${question.id}-${option.value}`} />
        <Label htmlFor={`${question.id}-${option.value}`}>{option.label}</Label>
      </div>
    ))}
  </RadioGroup>
);

const renderMultipleChoiceInput = (
  question: SurveyQuestion,
  answer: SurveyAnswerValue,
  updateAnswer: UpdateSurveyAnswer,
) => {
  const selectedValues = Array.isArray(answer) ? answer : [];

  return (
    <div className="space-y-3">
      {question.options.map((option) => {
        const optionId = `${question.id}-${option.value}`;
        const isChecked = selectedValues.includes(option.value);

        return (
          <div key={option.value} className="flex items-center space-x-2">
            <Checkbox
              id={optionId}
              checked={isChecked}
              onCheckedChange={(checked) => {
                if (checked === true) {
                  updateAnswer(question.id, [...selectedValues, option.value]);
                  return;
                }

                updateAnswer(
                  question.id,
                  selectedValues.filter((value) => value !== option.value),
                );
              }}
            />
            <Label htmlFor={optionId}>{option.label}</Label>
          </div>
        );
      })}
    </div>
  );
};

const renderDropdownInput = (
  question: SurveyQuestion,
  answer: SurveyAnswerValue,
  updateAnswer: UpdateSurveyAnswer,
) => (
  <Select
    value={typeof answer === "string" ? answer : ""}
    onValueChange={(value) => updateAnswer(question.id, value)}
  >
    <SelectTrigger>
      <SelectValue placeholder={question.placeholder ?? "Select one"} />
    </SelectTrigger>
    <SelectContent>
      {question.options.map((option) => (
        <SelectItem key={option.value} value={option.value}>
          {option.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

const renderRatingInput = (
  question: SurveyQuestion,
  answer: SurveyAnswerValue,
  updateAnswer: UpdateSurveyAnswer,
) => {
  const ratingScale = getRatingScale(question);
  const selectedRating = typeof answer === "number" ? answer : null;

  return (
    <div className="flex flex-wrap gap-2">
      {ratingScale.map((value) => (
        <Button
          key={value}
          type="button"
          variant={selectedRating === value ? "default" : "outline"}
          onClick={() => updateAnswer(question.id, value)}
          className="min-w-10"
        >
          {value}
        </Button>
      ))}
    </div>
  );
};

const renderNumberInput = (
  question: SurveyQuestion,
  answer: SurveyAnswerValue,
  updateAnswer: UpdateSurveyAnswer,
) => (
  <Input
    type="number"
    value={typeof answer === "number" ? answer : ""}
    onChange={(event) => {
      const nextValue = event.target.value;
      updateAnswer(question.id, nextValue === "" ? null : Number.parseFloat(nextValue));
    }}
    min={question.min}
    max={question.max}
    step={question.step}
    placeholder={question.placeholder ?? "Enter a number"}
  />
);

const renderDateInput = (
  question: SurveyQuestion,
  answer: SurveyAnswerValue,
  updateAnswer: UpdateSurveyAnswer,
) => (
  <Input
    type="date"
    value={typeof answer === "string" ? answer : ""}
    onChange={(event) => updateAnswer(question.id, event.target.value)}
  />
);

const rendererMap: Record<
  QuestionType,
  (
    question: SurveyQuestion,
    answer: SurveyAnswerValue,
    updateAnswer: UpdateSurveyAnswer,
  ) => ReactNode
> = {
  shortText: renderShortTextInput,
  longText: renderLongTextInput,
  singleChoice: renderRadioGroupInput,
  multipleChoice: renderMultipleChoiceInput,
  dropdown: renderDropdownInput,
  rating: renderRatingInput,
  number: renderNumberInput,
  date: renderDateInput,
  yesNo: renderRadioGroupInput,
};

export const renderSurveyQuestionInput = (
  question: SurveyQuestion,
  answer: SurveyAnswerValue,
  updateAnswer: UpdateSurveyAnswer,
) => {
  const renderer = rendererMap[question.type];
  if (!renderer) {
    return (
      <p className="text-sm text-muted-foreground">
        Unsupported question type: {question.type}
      </p>
    );
  }

  return renderer(question, answer, updateAnswer);
};
