import { memo } from "react";
import type { LucideIcon } from "lucide-react";
import { Activity, ArrowUpRight, CalendarDays, FileText, Heart, Users } from "lucide-react";
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
  onFavourite?: (communityId: string) => void;
  isFavourited?: boolean;
  isJoined?: boolean;
  className?: string;
  buttonLabel?: string;
}

const CommunityCard = ({
  community,
  onExplore,
  onFavourite,
  isFavourited = false,
  isJoined = false,
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

  return (
    <Card
      onClick={() => onExplore(community.id)}
      className={cn(
        "group relative flex h-full min-h-[252px] cursor-pointer flex-col rounded-xl border-border/70 card-arc-gradient p-6 shadow-sm transition-all duration-200 ease-out hover:border-primary/45 hover:shadow-elegant focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        className,
      )}
    >
      {/* Top-right: Explore button + optional Favourite button */}
      <div className="absolute right-5 top-5 z-10 flex items-center gap-1.5">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onExplore(community.id); }}
          aria-label="Explore community"
          className={cn(
            "flex h-9 w-9 origin-right items-center justify-center overflow-hidden rounded-lg px-2 text-white shadow-elegant transition-all duration-[110ms] ease-out focus-visible:w-[5.5rem] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/30 focus-visible:ring-offset-2 group-hover:w-[5.5rem] group-focus-within:w-[5.5rem]",
            isJoined
              ? "bg-success hover:bg-success/90 hover:shadow-[0_0_12px_-2px_hsl(var(--success)/0.6)]"
              : "bg-gradient-primary hover:shadow-glow",
          )}
        >
          <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-medium opacity-0 transition-all duration-[110ms] ease-out group-hover:mr-1 group-hover:max-w-[3.5rem] group-hover:opacity-100 group-focus-within:mr-1 group-focus-within:max-w-[3.5rem] group-focus-within:opacity-100 focus-visible:mr-1 focus-visible:max-w-[3.5rem] focus-visible:opacity-100">
            {buttonLabel}
          </span>
          <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        </button>
        {onFavourite && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onFavourite(community.id); }}
            title={isFavourited ? "Remove from favourites" : "Add to favourites"}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg border bg-card/90 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30",
              isFavourited
                ? "border-2 border-rose-400/60 text-rose-500 hover:border-rose-400/80"
                : "border-border/60 text-muted-foreground hover:border-rose-400/50 hover:text-rose-500",
            )}
          >
            <Heart
              className={cn(
                "h-3.5 w-3.5 transition-colors",
                isFavourited && "fill-rose-500 text-rose-500",
              )}
              aria-hidden="true"
            />
          </button>
        )}
      </div>

      <div className={cn("mb-4 flex items-start gap-3", onFavourite ? "pr-24" : "pr-12")}>
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
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{community.surveys.toLocaleString()}</span>
          </div>
          <span aria-hidden="true">·</span>
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{community.members.toLocaleString()}</span>
          </div>
        </div>

        <div className="mt-0.5 h-4 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5 opacity-0 transition-all duration-200 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 -translate-y-1">
            <Activity className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <span>{community.activeSurveys} active surveys</span>
            <span aria-hidden="true">·</span>
            <Users className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <span>{community.members.toLocaleString()} active members</span>
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

export default memo(CommunityCard);
