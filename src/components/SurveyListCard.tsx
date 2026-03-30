import type { ReactNode } from "react";
import { Calendar, Tag, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export type SurveyCardStatus = "active" | "closed" | "completed" | "draft" | "in-progress";

const STATUS_CONFIG: Record<SurveyCardStatus, { label: string; chipClass: string }> = {
  active: {
    label: "Active",
    chipClass: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  closed: {
    label: "Closed",
    chipClass: "bg-muted text-muted-foreground border-border/60",
  },
  completed: {
    label: "Completed",
    chipClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  },
  draft: {
    label: "Draft",
    chipClass: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  "in-progress": {
    label: "In Progress",
    chipClass: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  },
};

export interface SurveyListCardProps {
  title: string;
  status: SurveyCardStatus;
  category?: string | null;
  /** ISO date string */
  date?: string | null;
  /** Label shown before the formatted date, e.g. "Created", "Published", "Updated" */
  dateLabel?: string;
  responseCount?: number;
  targetResponses?: number | null;
  /** Override the metric row label, e.g. "Total responses", "Questions answered" */
  metricLabel?: string;
  action?: ReactNode;
  className?: string;
}

const SurveyListCard = ({
  title,
  status,
  category,
  date,
  dateLabel = "Created",
  responseCount,
  targetResponses,
  metricLabel = "Responses",
  action,
  className,
}: SurveyListCardProps) => {
  const { label: statusLabel, chipClass } = STATUS_CONFIG[status];

  const progress =
    responseCount != null && targetResponses != null && targetResponses > 0
      ? Math.min(100, Math.round((responseCount / targetResponses) * 100))
      : null;

  const formattedDate = date ? new Date(date).toLocaleDateString() : null;
  const showMetrics = responseCount != null;

  return (
    <Card
      className={cn(
        "border-border/50 bg-card/50 backdrop-blur transition-all duration-200",
        "hover:border-border/80 hover:shadow-md",
        className,
      )}
    >
      <div className="p-5 space-y-3">
        {/* Row 1: Title + status chip + action */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
            <h3 className="text-base font-semibold leading-snug tracking-tight">{title}</h3>
            <span
              className={cn(
                "inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium leading-none",
                chipClass,
              )}
            >
              {statusLabel}
            </span>
          </div>
          {action && (
            <div className="flex shrink-0 items-center gap-2">{action}</div>
          )}
        </div>

        {/* Row 2: Metadata — category + date */}
        {(category || formattedDate) && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {category && (
              <span className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {category}
              </span>
            )}
            {formattedDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {dateLabel} {formattedDate}
              </span>
            )}
          </div>
        )}

        {/* Row 3: Response metrics + progress bar */}
        {showMetrics && (
          <div className="space-y-1.5 border-t border-border/40 pt-3">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="h-3 w-3" />
                {metricLabel}
              </span>
              <span className="font-medium tabular-nums text-foreground">
                {responseCount}
                {targetResponses != null ? `/${targetResponses}` : ""}
              </span>
            </div>
            {progress !== null && (
              <Progress value={progress} className="h-2" />
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default SurveyListCard;
