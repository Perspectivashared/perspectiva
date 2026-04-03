import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuestionTypePickerModal } from "./question-type-picker-modal";
import { SURVEY_BUILDER_QUESTION_TYPE_OPTIONS } from "@/features/survey-builder/domain/question-types";
import type { SurveyBuilderQuestionType } from "@/features/survey-builder/domain/types";

interface QuestionTypeSelectorProps {
  value: SurveyBuilderQuestionType;
  onValueChange: (value: SurveyBuilderQuestionType) => void;
  className?: string;
}

export function QuestionTypeSelector({
  value,
  onValueChange,
  className,
}: QuestionTypeSelectorProps) {
  const [open, setOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const currentLabel =
    SURVEY_BUILDER_QUESTION_TYPE_OPTIONS.find((t) => t.value === value)
      ?.label ?? value;

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-48 justify-between font-normal", className)}
            type="button"
          >
            <span className="truncate">{currentLabel}</span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-48 p-1" align="start">
          {SURVEY_BUILDER_QUESTION_TYPE_OPTIONS.map((typeOption) => (
            <button
              key={typeOption.value}
              className={cn(
                "w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground",
                value === typeOption.value &&
                  "bg-accent text-accent-foreground",
              )}
              onClick={() => {
                onValueChange(typeOption.value);
                setOpen(false);
              }}
              type="button"
            >
              {typeOption.label}
            </button>
          ))}

          <Separator className="my-1" />

          <button
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            onClick={() => {
              setOpen(false);
              setPickerOpen(true);
            }}
            type="button"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Browse all types
          </button>
        </PopoverContent>
      </Popover>

      <QuestionTypePickerModal
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        currentType={value}
        onSelect={(type) => {
          onValueChange(type);
          setPickerOpen(false);
        }}
      />
    </>
  );
}
