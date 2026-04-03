import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ALL_COMMUNITIES,
  type Community,
} from "@/features/communities/domain/community-data";

// Group communities by their category field
const COMMUNITY_GROUPS: Array<{ group: string; communities: Community[] }> =
  Object.values(
    ALL_COMMUNITIES.reduce<Record<string, { group: string; communities: Community[] }>>(
      (acc, community) => {
        if (!acc[community.category]) {
          acc[community.category] = { group: community.category, communities: [] };
        }
        acc[community.category].communities.push(community);
        return acc;
      },
      {},
    ),
  );

interface CommunityPickerModalProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly currentValue: string | null;
  readonly favouriteIds: Set<string>;
  readonly onSelect: (value: string) => void;
}

export function CommunityPickerModal({
  open,
  onOpenChange,
  currentValue,
  favouriteIds,
  onSelect,
}: CommunityPickerModalProps) {
  const [search, setSearch] = useState("");

  const favouriteCommunities = useMemo(
    () => ALL_COMMUNITIES.filter((c) => favouriteIds.has(c.id)),
    [favouriteIds],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return COMMUNITY_GROUPS;
    return COMMUNITY_GROUPS.map((group) => ({
      ...group,
      communities: group.communities.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q),
      ),
    })).filter((group) => group.communities.length > 0);
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
          <DialogTitle>All Communities</DialogTitle>
        </DialogHeader>

        <div className="relative shrink-0">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search communities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            autoFocus
          />
        </div>

        <div
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain space-y-6 pr-1"
          data-lenis-prevent
        >
          {!search && favouriteCommunities.length > 0 && (
            <div>
              <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                Favourites
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {favouriteCommunities.map((community) => (
                  <button
                    key={community.id}
                    onClick={() => onSelect(community.id)}
                    className={cn(
                      "flex flex-col items-start rounded-lg border px-3 py-2.5 text-left transition-colors",
                      currentValue === community.id
                        ? "border-primary bg-primary/5"
                        : "border-border/50 hover:border-primary/50 hover:bg-accent",
                    )}
                    type="button"
                  >
                    <span className="text-sm font-medium">{community.name}</span>
                    <span className="mt-0.5 text-xs text-muted-foreground">
                      {community.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filtered.map((group) => (
            <div key={group.group}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group.group}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {group.communities.map((community) => (
                  <button
                    key={community.id}
                    onClick={() => onSelect(community.id)}
                    className={cn(
                      "flex flex-col items-start rounded-lg border px-3 py-2.5 text-left transition-colors",
                      currentValue === community.id
                        ? "border-primary bg-primary/5"
                        : "border-border/50 hover:border-primary/50 hover:bg-accent",
                    )}
                    type="button"
                  >
                    <span className="text-sm font-medium">{community.name}</span>
                    <span className="mt-0.5 text-xs text-muted-foreground">
                      {community.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No communities match &ldquo;{search}&rdquo;
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
