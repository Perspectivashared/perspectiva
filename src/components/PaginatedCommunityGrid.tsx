import { useEffect, useMemo, useState } from "react";
import CommunityCard, { type CommunityCardData } from "@/components/CommunityCard";
import PaginationControls from "@/components/PaginationControls";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PaginatedCommunityGridProps {
  communities: CommunityCardData[];
  onExplore: (communityId: string) => void;
  onFavourite?: (communityId: string) => void;
  isFavourited?: (communityId: string) => boolean;
  pageSize?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

const PaginatedCommunityGrid = ({
  communities,
  onExplore,
  onFavourite,
  isFavourited,
  pageSize = 6,
  emptyTitle = "No communities found",
  emptyDescription = "Try updating your filters to explore other communities.",
  className,
}: PaginatedCommunityGridProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(communities.length / pageSize));

  useEffect(() => {
    setCurrentPage(1);
  }, [communities]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedCommunities = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return communities.slice(start, end);
  }, [communities, currentPage, pageSize]);

  if (communities.length === 0) {
    return (
      <Card className="border-border/70 bg-card p-8 text-center shadow-sm">
        <h3 className="text-2xl font-semibold tracking-tight">{emptyTitle}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{emptyDescription}</p>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {paginatedCommunities.map((community) => (
          <CommunityCard
            key={community.id}
            community={community}
            onExplore={onExplore}
            onFavourite={onFavourite}
            isFavourited={isFavourited ? isFavourited(community.id) : undefined}
          />
        ))}
      </div>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default PaginatedCommunityGrid;
