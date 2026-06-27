import {
  COMMUNITY_SORT_OPTIONS,
  type CommunityCategoryFilter,
  type CommunitySortOption,
} from "@/features/communities/domain/community-data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CommunityFilterBarProps {
  category: CommunityCategoryFilter;
  onCategoryChange: (value: CommunityCategoryFilter) => void;
  sortBy?: CommunitySortOption;
  onSortChange?: (value: CommunitySortOption) => void;
  categories: Array<{
    value: CommunityCategoryFilter;
    label: string;
  }>;
  className?: string;
  idPrefix?: string;
  showSort?: boolean;
}

const CommunityFilterBar = ({
  category,
  onCategoryChange,
  sortBy,
  onSortChange,
  categories,
  className,
  idPrefix = "community-filter",
  showSort = true,
}: CommunityFilterBarProps) => (
  <Card
    className={cn(
      "border-primary/15 bg-linear-to-r from-primary/6 via-card to-card p-4 shadow-xs",
      className,
    )}
  >
    <div className={cn("grid gap-3", showSort ? "md:grid-cols-2" : "md:grid-cols-1")}>
      <div className="space-y-1.5">
        <label
          className="text-xs font-medium text-foreground/80"
          htmlFor={`${idPrefix}-category`}
        >
          Category
        </label>
        <Select
          value={category}
          onValueChange={(value) =>
            onCategoryChange(value as CommunityCategoryFilter)
          }
        >
          <SelectTrigger
            id={`${idPrefix}-category`}
            className="border-border/70 bg-background/95"
          >
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showSort ? (
        <div className="space-y-1.5">
          <label
            className="text-xs font-medium text-foreground/80"
            htmlFor={`${idPrefix}-sort`}
          >
            Sort
          </label>
          <Select
            value={sortBy ?? COMMUNITY_SORT_OPTIONS[0].value}
            onValueChange={(value) => onSortChange?.(value as CommunitySortOption)}
          >
            <SelectTrigger
              id={`${idPrefix}-sort`}
              className="border-border/70 bg-background/95"
            >
              <SelectValue placeholder="Sort communities" />
            </SelectTrigger>
            <SelectContent>
              {COMMUNITY_SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}
    </div>
  </Card>
);

export default CommunityFilterBar;
