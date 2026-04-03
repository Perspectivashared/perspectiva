/**
 * QuestionTypePickerModal
 *
 * Built on Radix UI's <Dialog> which provides:
 *   • Portal rendering (DialogPortal → createPortal to document.body)
 *     Escapes ancestor stacking contexts; prevents scroll-event leakage from
 *     nested overflow containers.
 *   • Body scroll lock — Radix automatically applies `overflow: hidden` plus
 *     a scrollbar-width `padding-right` compensation to document.body when the
 *     dialog opens, and removes them on close.
 *
 * Because Radix manages the body lock, we do NOT call useScrollLock here.
 * Calling it inside a Radix Dialog would cause a restore-order conflict:
 *   open  → Radix sets overflow:hidden → our hook snapshots "hidden" as prevValue
 *   close → our hook restores "hidden"  → Radix removes its own lock
 *   result → body is permanently frozen (overflow: hidden never cleared)
 *
 * Scroll fix applied to the inner list region (see the scrollable div below):
 *   flex-1          — fills remaining height after header + search bar
 *   min-h-0         — overrides flex child's default min-height:auto so the div
 *                     can actually shrink below its content height; without this
 *                     overflow-y-auto is a no-op and wheel events bubble to body
 *   overflow-y-auto — activates once content exceeds the constrained height
 *   overscroll-contain — absorbs scroll events at list boundaries; prevents
 *                        chaining to body even at the top/bottom edge
 */

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { EXTENDED_QUESTION_CATEGORIES } from "@/features/survey-builder/domain/question-types";
import type { SurveyBuilderQuestionType } from "@/features/survey-builder/domain/types";

interface QuestionTypePickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentType: SurveyBuilderQuestionType;
  onSelect: (type: SurveyBuilderQuestionType) => void;
}

export function QuestionTypePickerModal({
  open,
  onOpenChange,
  currentType,
  onSelect,
}: QuestionTypePickerModalProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return EXTENDED_QUESTION_CATEGORIES;
    return EXTENDED_QUESTION_CATEGORIES.map((cat) => ({
      ...cat,
      types: cat.types.filter(
        (t) =>
          t.label.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q),
      ),
    })).filter((cat) => cat.types.length > 0);
  }, [search]);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setSearch("");
        onOpenChange(next);
      }}
    >
      <DialogContent className="flex max-h-[80vh] max-w-2xl flex-col gap-4">
        <DialogHeader>
          <DialogTitle>Browse Question Types</DialogTitle>
        </DialogHeader>

        <div className="relative shrink-0">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search question types..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            autoFocus
          />
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain space-y-6 pr-1" data-lenis-prevent>
          {filtered.map((cat) => (
            <div key={cat.category}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {cat.category}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {cat.types.map((typeOption) => (
                  <button
                    key={typeOption.value}
                    onClick={() => {
                      if (!typeOption.comingSoon) {
                        onSelect(typeOption.value as SurveyBuilderQuestionType);
                      }
                    }}
                    disabled={typeOption.comingSoon}
                    className={cn(
                      "flex flex-col items-start rounded-lg border px-3 py-2.5 text-left transition-colors",
                      typeOption.comingSoon
                        ? "cursor-not-allowed border-border/40 opacity-50"
                        : currentType === typeOption.value
                          ? "border-primary bg-primary/5"
                          : "border-border/50 hover:border-primary/50 hover:bg-accent",
                    )}
                    type="button"
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className="text-sm font-medium">
                        {typeOption.label}
                      </span>
                      {typeOption.comingSoon && (
                        <Badge
                          variant="secondary"
                          className="px-1.5 py-0 text-[10px]"
                        >
                          Soon
                        </Badge>
                      )}
                    </div>
                    <span className="mt-0.5 text-xs text-muted-foreground">
                      {typeOption.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No question types match &ldquo;{search}&rdquo;
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
