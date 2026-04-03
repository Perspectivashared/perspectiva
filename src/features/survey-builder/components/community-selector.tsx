import { useMemo, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, LayoutGrid, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { CommunityPickerModal } from "./community-picker-modal";
import {
  ALL_COMMUNITIES,
  sortCommunities,
} from "@/features/communities/domain/community-data";
import { useFavouriteCommunitiesQuery } from "@/features/communities/hooks/use-favourite-communities-query";

const DEFAULT_COMMUNITIES = sortCommunities(ALL_COMMUNITIES, "mostActive").slice(0, 6);

interface CommunitySelectorProps {
  readonly value: string | null;
  readonly onValueChange: (value: string) => void;
  readonly className?: string;
}

export function CommunitySelector({
  value,
  onValueChange,
  className,
}: CommunitySelectorProps) {
  const [open, setOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const { data: favouritesData } = useFavouriteCommunitiesQuery();

  const favouriteIds = useMemo(
    () => new Set((favouritesData ?? []).map((c) => c.id)),
    [favouritesData],
  );

  const favouriteCommunities = useMemo(
    () => ALL_COMMUNITIES.filter((c) => favouriteIds.has(c.id)),
    [favouriteIds],
  );

  const currentLabel =
    ALL_COMMUNITIES.find((c) => c.id === value)?.name ?? "Select community";

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "mt-2 w-full justify-between font-normal",
              !value && "text-muted-foreground",
              className,
            )}
            type="button"
          >
            <span className="truncate">{currentLabel}</span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-52 p-1" align="start">
          {favouriteCommunities.length > 0 && (
            <>
              <p className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                Favourites
              </p>
              {favouriteCommunities.map((community) => (
                <button
                  key={community.id}
                  className={cn(
                    "w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground",
                    value === community.id && "bg-accent text-accent-foreground",
                  )}
                  onClick={() => {
                    onValueChange(community.id);
                    setOpen(false);
                  }}
                  type="button"
                >
                  {community.name}
                </button>
              ))}
              <Separator className="my-1" />
            </>
          )}

          {DEFAULT_COMMUNITIES.map((community) => (
            <button
              key={community.id}
              className={cn(
                "w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground",
                value === community.id && "bg-accent text-accent-foreground",
              )}
              onClick={() => {
                onValueChange(community.id);
                setOpen(false);
              }}
              type="button"
            >
              {community.name}
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
            All communities
          </button>
        </PopoverContent>
      </Popover>

      <CommunityPickerModal
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        currentValue={value}
        favouriteIds={favouriteIds}
        onSelect={(val) => {
          onValueChange(val);
          setPickerOpen(false);
        }}
      />
    </>
  );
}
