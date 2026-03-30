import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SurveyCard, CATEGORY_LIST, type ApiSurveySummary } from "@/components/SurveyCard";
import { AppShell } from "@/shared/components/layout/AppShell";
import { api, SESSION_EXPIRED } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const AllSurveys = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const communityIdFilter = searchParams.get("community") ?? null;

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const publishedQ = useQuery({
    queryKey: ["published-surveys"],
    queryFn: () => api.get<ApiSurveySummary[]>("/surveys/published"),
  });

  const savedQ = useQuery({
    queryKey: ["saved-surveys"],
    queryFn: () => api.get<ApiSurveySummary[]>("/users/me/saved-surveys"),
  });

  const published = publishedQ.data ?? [];
  const savedSurveys = savedQ.data ?? [];

  const [localSavedIds, setLocalSavedIds] = useState<Set<number>>(new Set());
  const savedIds = useMemo(
    () => new Set([...localSavedIds, ...savedSurveys.map((s) => s.id)]),
    [localSavedIds, savedSurveys],
  );

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
    [published, categoryFilter, searchQuery, sortBy],
  );

  const handleToggleSave = async (surveyId: number) => {
    const isSaved = savedIds.has(surveyId);
    setLocalSavedIds((prev) => {
      const next = new Set(prev);
      if (isSaved) { next.delete(surveyId); } else { next.add(surveyId); }
      return next;
    });
    try {
      if (isSaved) {
        await api.delete(`/surveys/${surveyId}/save`);
      } else {
        await api.post(`/surveys/${surveyId}/save`);
      }
      queryClient.invalidateQueries({ queryKey: ["saved-surveys"] });
    } catch (err) {
      setLocalSavedIds((prev) => {
        const next = new Set(prev);
        if (isSaved) { next.add(surveyId); } else { next.delete(surveyId); }
        return next;
      });
      if (err instanceof Error && err.message === SESSION_EXPIRED) {
        throw err;
      }
      toast({ title: "Failed to update saved status", variant: "destructive" });
    }
  };

  return (
    <AppShell withContainer mainClassName="pb-14 pt-24">
      {/* Header */}
      <section className="mb-10 space-y-2 rounded-xl border border-primary/15 bg-gradient-to-r from-primary/[0.08] via-card to-card p-5">
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
              {filtered.length === 1
                ? "Showing 1 survey"
                : `Showing ${filtered.length} survey${filtered.length === 0 ? "s" : "s"}`}
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
      {publishedQ.isPending ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-[200px] rounded-xl" />
          ))}
        </div>
      ) : publishedQ.isError ? (
        <Card className="border-border/70 p-8 text-center shadow-sm">
          <h2 className="text-xl font-semibold">Failed to load surveys</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Something went wrong. Please try again.
          </p>
          <Button onClick={() => void publishedQ.refetch()} className="mt-5">
            Try again
          </Button>
        </Card>
      ) : filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No surveys match your current filters.
        </p>
      ) : (
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
      )}
    </AppShell>
  );
};

export default AllSurveys;
