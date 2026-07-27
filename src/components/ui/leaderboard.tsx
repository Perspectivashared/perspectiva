import * as React from "react";

import { cn } from "@/lib/utils";

export interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  /** Optional secondary line (e.g. community, streak). */
  detail?: string;
  isCurrentUser?: boolean;
}

/** Rank color: gold (coin token) / silver (muted) / bronze for the top three. */
const rankTone = (rank: number): string => {
  if (rank === 1) return "text-[hsl(var(--coin))]";
  if (rank === 2) return "text-muted-foreground";
  if (rank === 3) return "text-[hsl(24_55%_50%)]";
  return "text-muted-foreground/70";
};

interface LeaderboardProps extends React.HTMLAttributes<HTMLOListElement> {
  entries: LeaderboardEntry[];
}

const Leaderboard = React.forwardRef<HTMLOListElement, LeaderboardProps>(
  ({ entries, className, ...props }, ref) => (
    <ol ref={ref} className={cn("flex flex-col divide-y divide-border/60", className)} {...props}>
      {entries.map((entry) => (
        <li
          key={entry.rank}
          aria-current={entry.isCurrentUser ? "true" : undefined}
          className={cn(
            "flex items-center gap-3 py-2.5",
            entry.isCurrentUser && "-mx-2 rounded-md bg-primary/5 px-2",
          )}
        >
          <span className={cn("w-6 shrink-0 text-center font-mono text-sm font-semibold tabular-nums", rankTone(entry.rank))}>
            {entry.rank}
          </span>
          <div className="min-w-0 flex-1">
            <p className={cn("truncate text-sm font-medium", entry.isCurrentUser ? "text-primary" : "text-foreground")}>
              {entry.name}
            </p>
            {entry.detail ? <p className="truncate text-xs text-muted-foreground">{entry.detail}</p> : null}
          </div>
          <span className="shrink-0 font-mono text-sm font-semibold tabular-nums text-foreground">
            {entry.points.toLocaleString()}
          </span>
        </li>
      ))}
    </ol>
  ),
);
Leaderboard.displayName = "Leaderboard";

export { Leaderboard };
