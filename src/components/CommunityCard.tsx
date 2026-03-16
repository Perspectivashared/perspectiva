import type { LucideIcon } from "lucide-react";
import { Activity, ArrowUpRight, CalendarDays, FileText, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { CommunityCardSummary } from "@/features/communities/domain/community-data";
import { cn } from "@/lib/utils";

export interface CommunityCardData extends Omit<CommunityCardSummary, "icon"> {
  icon: LucideIcon;
  category?: string;
  activityLevel?: number;
  launchedAt?: string;
}

interface CommunityCardProps {
  community: CommunityCardData;
  onExplore: (communityId: string) => void;
  className?: string;
  buttonLabel?: string;
}

const CommunityCard = ({
  community,
  onExplore,
  className,
  buttonLabel = "Explore",
}: CommunityCardProps) => {
  const Icon = community.icon;
  const launchLabel = community.launchedAt
    ? new Date(community.launchedAt).toLocaleDateString(undefined, {
        month: "short",
        year: "numeric",
      })
    : null;
  const activityLabel = community.activityLevel
    ? `${community.activityLevel}% activity`
    : `${community.activeSurveys} active`;

  return (
    <Card
      className={cn(
        "group relative flex h-full min-h-[252px] flex-col rounded-xl border-border/70 bg-gradient-to-b from-primary/[0.03] via-card to-card p-6 shadow-sm transition-all duration-200 ease-out hover:border-primary/45 hover:ring-2 hover:ring-primary/35 hover:shadow-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        className,
      )}
    >
      <Button
        type="button"
        variant="default"
        size="sm"
        onClick={() => onExplore(community.id)}
        aria-label="Explore community"
        className="absolute right-5 top-5 z-10 h-9 w-9 origin-right justify-end overflow-hidden rounded-lg bg-gradient-primary px-2 text-primary-foreground shadow-elegant transition-all duration-200 ease-out hover:bg-gradient-primary hover:shadow-glow focus-visible:w-24 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 group-hover:w-24 group-focus-within:w-24"
      >
        <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-medium opacity-0 transition-all duration-200 ease-out group-hover:mr-1 group-hover:max-w-14 group-hover:opacity-100 group-focus-within:mr-1 group-focus-within:max-w-14 group-focus-within:opacity-100 focus-visible:mr-1 focus-visible:max-w-14 focus-visible:opacity-100">
          {buttonLabel}
        </span>
        <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      </Button>

      <div className="mb-4 flex items-start gap-3 pr-12">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all duration-200 ease-out group-hover:bg-primary/20 group-hover:scale-105">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h3 className="line-clamp-2 text-lg font-semibold tracking-tight">
            {community.name}
          </h3>
          {community.category ? (
            <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
              {community.category}
            </span>
          ) : null}
        </div>
      </div>

      <p className="line-clamp-3 min-h-[3.75rem] max-w-prose text-sm leading-relaxed text-muted-foreground">
        {community.description}
      </p>

      <div className="mt-auto border-t border-border/70 pt-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{community.members.toLocaleString()}</span>
          </div>
          <span aria-hidden="true">·</span>
          <div className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{community.surveys.toLocaleString()}</span>
          </div>
        </div>

        <div className="mt-1 flex h-5 items-center text-[11px] text-muted-foreground">
          <span className="truncate">{activityLabel}</span>
        </div>

        <div className="mt-0.5 h-4 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5 opacity-0 transition-all duration-200 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 -translate-y-1">
            <Activity className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <span>{community.activeSurveys} active surveys</span>
            {launchLabel ? (
              <>
                <span aria-hidden="true">·</span>
                <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Launched {launchLabel}</span>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CommunityCard;
