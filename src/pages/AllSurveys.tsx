import { useMemo, useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorCard } from "@/shared/components/state/ErrorCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SurveyCard, CATEGORY_LIST, type ApiSurveySummary } from "@/components/SurveyCard";
import { AppShell } from "@/shared/components/layout/AppShell";
import { api } from "@/lib/api";
import { useSaveSurvey } from "@/hooks/use-save-survey";

const PAGE_SIZE = 50;

const AllSurveys = () => {
  const [searchParams] = useSearchParams();
  const communityIdFilter = searchParams.get("community") ?? null;

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Server-driven pagination: pages of PAGE_SIZE are appended as the user
  // loads more, instead of a hard one-shot limit=100 cap.
  const publishedQ = useInfiniteQuery({
    queryKey: ["published-surveys", "infinite"],
    queryFn: ({ pageParam }) =>
      api.get<ApiSurveySummary[]>(`/surveys/published?limit=${PAGE_SIZE}&offset=${pageParam}`),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length * PAGE_SIZE : undefined,
  });

  const savedQ = useQuery({
    queryKey: ["saved-surveys"],
    queryFn: () => api.get<ApiSurveySummary[]>("/users/me/saved-surveys"),
  });

  const published = useMemo(
    () => (publishedQ.data?.pages ?? []).flat(),
    [publishedQ.data],
  );

  const { savedIds, toggleSave: handleToggleSave } = useSaveSurvey(savedQ.data ?? []);

  const filtered = useMemo(
    () =>
      published
        .filter(
          (s) =>
            (!communityIdFilter || s.community_id === communityIdFilter) &&
            (categoryFilter === "all" || s.category === categoryFilter) &&
            (searchQuery === "" ||
              s.title.toLowerCase().includes(searchQuery.toLowerCase())),
        )
        .sort((a, b) => {
          if (sortBy === "deadline") {
            if (!a.deadline) return 1;
            if (!b.deadline) return -1;
            return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
          }
          if (sortBy === "popular") return b.response_count - a.response_count;
          return (
            new Date(b.published_at ?? b.created_at).getTime() -
            new Date(a.published_at ?? a.created_at).getTime()
          );
        }),
    [published, communityIdFilter, categoryFilter, searchQuery, sortBy],
  );


  return (
    <AppShell withContainer mainClassName="pb-14 pt-24">
      {/* Header */}
      <section className="mb-10 space-y-2 rounded-xl border border-primary/15 bg-linear-to-r from-primary/8 via-card to-card p-5">
        {publishedQ.isPending ? (
          <>
            <Skeleton className="mb-3 h-12 w-64" />
            <Skeleton className="h-5 w-full max-w-xl" />
          </>
        ) : (
          <>
            <h1 className="mb-1 text-4xl font-bold">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                All Surveys
              </span>
            </h1>
            <p className="text-sm text-muted-foreground md:text-base">
              Browse, search, and filter every published survey on the platform.
            </p>
            <p className="text-sm text-muted-foreground">
              {filtered.length === 1 ? "Showing 1 survey" : `Showing ${filtered.length} surveys`}
            </p>
          </>
        )}
      </section>

      {/* Filter bar */}
      <section className="mb-8">
        <div className="grid md:grid-cols-4 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search surveys…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORY_LIST.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="deadline">Deadline</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Grid */}
      {publishedQ.isPending && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 9 }, (_, i) => (
            <Skeleton key={`survey-skeleton-${i}`} className="h-[200px] rounded-xl" />
          ))}
        </div>
      )}

      {!publishedQ.isPending && publishedQ.isError && (
        <ErrorCard
          title="Failed to load surveys"
          message="Something went wrong. Please try again."
          onRetry={() => void publishedQ.refetch()}
        />
      )}

      {!publishedQ.isPending && !publishedQ.isError && filtered.length === 0 && (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No surveys match your current filters.
        </p>
      )}

      {!publishedQ.isPending && !publishedQ.isError && filtered.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 px-2 py-1">
            {filtered.map((s) => (
              <SurveyCard
                key={s.id}
                survey={s}
                isSaved={savedIds.has(s.id)}
                onToggleSave={handleToggleSave}
              />
            ))}
          </div>
          {publishedQ.hasNextPage && (
            <div className="flex justify-center pt-6">
              <Button
                variant="outline"
                disabled={publishedQ.isFetchingNextPage}
                onClick={() => void publishedQ.fetchNextPage()}
              >
                {publishedQ.isFetchingNextPage ? "Loading…" : "Load more surveys"}
              </Button>
            </div>
          )}
        </>
      )}
    </AppShell>
  );
};

export default AllSurveys;
