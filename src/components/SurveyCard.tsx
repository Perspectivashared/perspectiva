import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  BarChart3,
  Bookmark,
  BookmarkCheck,
  Brain,
  BookOpen,
  Briefcase,
  Clock,
  Code2,
  Dumbbell,
  Heart,
  Leaf,
  Megaphone,
  Microscope,
  Palette,
  Scale,
  TrendingUp,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ROUTES } from "@/lib/routes";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ApiSurveySummary {
  id: number;
  title: string;
  description: string;
  category: string | null;
  status: string;
  target_responses: number | null;
  deadline: string | null;
  response_count: number;
  published_at: string | null;
  created_at: string;
}

// ─── Category icon map ───────────────────────────────────────────────────────

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Technology: Code2,
  Economics: TrendingUp,
  Business: Briefcase,
  "Sports Science": Dumbbell,
  Research: Microscope,
  Education: BookOpen,
  "Health Sciences": Heart,
  "Climate Policy": Leaf,
  "Design Thinking": Palette,
  "Public Policy": Scale,
  Psychology: Brain,
  "Media Studies": Megaphone,
};

export const CATEGORY_LIST = Object.keys(CATEGORY_ICONS);

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const formatDeadline = (deadline: string | null): string => {
  if (!deadline) return "No deadline";
  const diff = Math.ceil(
    (new Date(deadline).getTime() - Date.now()) / 86_400_000,
  );
  if (diff <= 0) return "Closing today";
  if (diff === 1) return "1 day left";
  return `${diff} days left`;
};

// ─── Survey grid card ────────────────────────────────────────────────────────

interface SurveyCardProps {
  survey: ApiSurveySummary;
  isSaved: boolean;
  onToggleSave: (id: number) => void;
  urgentDeadline?: boolean;
}

export const SurveyCard = ({
  survey,
  isSaved,
  onToggleSave,
  urgentDeadline,
}: SurveyCardProps) => {
  const navigate = useNavigate();
  const Icon = (survey.category ? CATEGORY_ICONS[survey.category] : null) ?? BarChart3;

  const progress =
    survey.target_responses != null
      ? Math.min(100, Math.round((survey.response_count / survey.target_responses) * 100))
      : null;

  const daysLeft =
    survey.deadline != null
      ? Math.ceil((new Date(survey.deadline).getTime() - Date.now()) / 86_400_000)
      : null;

  const isUrgent = urgentDeadline && daysLeft != null && daysLeft <= 3;

  return (
    // No focus-within ring — it leaks from child buttons and causes the blue-ring artifact
    <Card className="group relative flex h-full min-h-[200px] flex-col rounded-xl border-border/70 bg-gradient-to-b from-primary/[0.03] via-card to-card p-5 shadow-sm transition-all duration-200 ease-out hover:border-primary/45 hover:ring-2 hover:ring-primary/35 hover:shadow-md">
      {/* Top-right: Take Survey button + Save button */}
      <div className="absolute right-4 top-4 z-10 flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => navigate(ROUTES.survey, { state: { surveyId: String(survey.id), source: "for-you" } })}
          aria-label="Take survey"
          className="flex h-9 w-9 origin-right items-center justify-end overflow-hidden rounded-lg bg-gradient-primary px-2 text-primary-foreground shadow-elegant transition-all duration-[190ms] ease-out hover:shadow-glow group-hover:w-[7rem]"
        >
          <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-medium opacity-0 transition-all duration-[190ms] ease-out group-hover:mr-1.5 group-hover:max-w-[4.5rem] group-hover:opacity-100">
            Take Survey
          </span>
          <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => onToggleSave(survey.id)}
          title={isSaved ? "Unsave" : "Save"}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-card/90 text-muted-foreground shadow-sm transition-colors hover:border-primary/50 hover:text-primary"
        >
          {isSaved
            ? <BookmarkCheck className="h-4 w-4 fill-primary text-primary" />
            : <Bookmark className="h-4 w-4" />
          }
        </button>
      </div>

      {/* Header: icon + title */}
      <div className="mb-3 flex items-start gap-3 pr-24">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all duration-200 ease-out group-hover:bg-primary/20 group-hover:scale-105">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 space-y-1">
          <h3 className="line-clamp-2 text-base font-semibold leading-snug tracking-tight">
            {survey.title}
          </h3>
          {survey.category && (
            <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
              {survey.category}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
        {survey.description}
      </p>

      {/* Footer */}
      <div className="mt-auto border-t border-border/70 pt-3">
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              {survey.response_count}
              {survey.target_responses != null ? `/${survey.target_responses}` : ""}
            </span>
            <span className={`flex items-center gap-1.5 ${isUrgent ? "text-destructive font-semibold" : ""}`}>
              <Clock className="h-3.5 w-3.5" />
              {formatDeadline(survey.deadline)}
            </span>
          </div>
          <span className="flex items-center gap-1 font-medium text-primary">
            <TrendingUp className="h-3.5 w-3.5" />
            10 pts
          </span>
        </div>
        {progress != null && <Progress value={progress} className="mt-2 h-1" />}
      </div>
    </Card>
  );
};

// ─── Owned survey grid card (published by current user — no save, no points) ──

interface OwnedSurveyCardProps {
  survey: ApiSurveySummary;
}

export const OwnedSurveyCard = ({ survey }: OwnedSurveyCardProps) => {
  const navigate = useNavigate();
  const Icon = (survey.category ? CATEGORY_ICONS[survey.category] : null) ?? BarChart3;

  const progress =
    survey.target_responses != null
      ? Math.min(100, Math.round((survey.response_count / survey.target_responses) * 100))
      : null;

  return (
    <Card className="group relative flex h-full min-h-[200px] flex-col rounded-xl border-border/70 bg-gradient-to-b from-primary/[0.03] via-card to-card p-5 shadow-sm transition-all duration-200 ease-out hover:border-primary/45 hover:ring-2 hover:ring-primary/35 hover:shadow-md">
      {/* Analytics button — content-based width */}
      <button
        type="button"
        onClick={() => navigate(`/surveys/${survey.id}/analytics`)}
        aria-label="View analytics"
        className="absolute right-4 top-4 z-10 flex h-9 w-9 origin-right items-center justify-end overflow-hidden rounded-lg bg-gradient-primary px-2 text-primary-foreground shadow-elegant transition-all duration-[150ms] ease-out hover:shadow-glow group-hover:w-[6rem]"
      >
        <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-medium opacity-0 transition-all duration-[150ms] ease-out group-hover:mr-1.5 group-hover:max-w-[3.5rem] group-hover:opacity-100">
          Analytics
        </span>
        <BarChart3 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      </button>

      {/* Header: icon + title */}
      <div className="mb-3 flex items-start gap-3 pr-12">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all duration-200 ease-out group-hover:bg-primary/20 group-hover:scale-105">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 space-y-1">
          <h3 className="line-clamp-2 text-base font-semibold leading-snug tracking-tight">
            {survey.title}
          </h3>
          {survey.category && (
            <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
              {survey.category}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
        {survey.description}
      </p>

      {/* Footer — responses and deadline only */}
      <div className="mt-auto border-t border-border/70 pt-3">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {survey.response_count}
            {survey.target_responses != null ? `/${survey.target_responses}` : ""}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {formatDeadline(survey.deadline)}
          </span>
        </div>
        {progress != null && <Progress value={progress} className="mt-2 h-1" />}
      </div>
    </Card>
  );
};
