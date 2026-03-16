import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROUTES } from "@/lib/routes";
import { Search, Clock, Users, TrendingUp, Filter, Bookmark, BookmarkCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { AppShell } from "@/shared/components/layout/AppShell";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface ApiSurveySummary {
  id: number;
  title: string;
  description: string;
  category: string | null;
  status: string;
  target_responses: number | null;
  deadline: string | null;
  response_count: number;
  published_at: string | null;
}

const formatDeadline = (deadline: string | null): string => {
  if (!deadline) return "No deadline";
  const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
  if (diff <= 0) return "Today";
  if (diff === 1) return "1 day left";
  return `${diff} days left`;
};

const ForYou = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  const { data: surveys = [], isPending, isError } = useQuery({
    queryKey: ["published-surveys"],
    queryFn: () => api.get<ApiSurveySummary[]>("/surveys/published"),
  });

  const handleToggleSave = async (surveyId: number) => {
    const isSaved = savedIds.has(surveyId);
    try {
      if (isSaved) {
        await api.delete(`/surveys/${surveyId}/save`);
        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(surveyId);
          return next;
        });
        toast({ title: "Survey unsaved" });
      } else {
        await api.post(`/surveys/${surveyId}/save`);
        setSavedIds((prev) => new Set(prev).add(surveyId));
        toast({ title: "Survey saved" });
      }
    } catch {
      toast({ title: "Failed to update saved status", variant: "destructive" });
    }
  };

  const filteredSurveys = useMemo(
    () =>
      surveys
        .filter(
          (s) =>
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
          // newest
          return new Date(b.published_at ?? b.id).getTime() - new Date(a.published_at ?? a.id).getTime();
        }),
    [surveys, categoryFilter, searchQuery, sortBy],
  );

  return (
    <AppShell withContainer mainClassName="px-4 pb-12 pt-24" backgroundClassName="bg-background">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-3">
          <span className="bg-gradient-primary bg-clip-text text-transparent">
            For You
          </span>
        </h1>
        <p className="text-muted-foreground text-lg">
          Surveys matched to your interests and expertise
        </p>
      </div>

      <Card className="p-6 mb-8 border-border/50 bg-card/50 backdrop-blur">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search surveys..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Technology">Technology</SelectItem>
              <SelectItem value="Economics">Economics</SelectItem>
              <SelectItem value="Business">Business</SelectItem>
              <SelectItem value="Sports Science">Sports Science</SelectItem>
              <SelectItem value="Research">Research</SelectItem>
              <SelectItem value="Education">Education</SelectItem>
              <SelectItem value="Health Sciences">Health Sciences</SelectItem>
              <SelectItem value="Climate Policy">Climate Policy</SelectItem>
              <SelectItem value="Design Thinking">Design Thinking</SelectItem>
              <SelectItem value="Public Policy">Public Policy</SelectItem>
              <SelectItem value="Psychology">Psychology</SelectItem>
              <SelectItem value="Media Studies">Media Studies</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="deadline">Deadline</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {isPending ? (
        <div className="text-center py-16 text-muted-foreground">Loading surveys...</div>
      ) : isError ? (
        <div className="text-center py-16 text-destructive">Failed to load surveys. Make sure the backend is running.</div>
      ) : filteredSurveys.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          No surveys available yet. Be the first to create one!
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredSurveys.map((survey) => {
            const progress = survey.target_responses
              ? Math.min(100, Math.round((survey.response_count / survey.target_responses) * 100))
              : null;

            return (
              <Card
                key={survey.id}
                className="p-6 hover:shadow-elegant transition-all border-border/50 bg-card/50 backdrop-blur"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{survey.title}</h3>
                    </div>
                    <p className="text-muted-foreground mb-4">{survey.description}</p>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {survey.category && (
                        <div className="flex items-center gap-1">
                          <Filter className="w-4 h-4" />
                          <span>{survey.category}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>
                          {survey.response_count}
                          {survey.target_responses ? `/${survey.target_responses}` : ""} responses
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatDeadline(survey.deadline)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        <span className="font-medium text-primary">10 points</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleSave(survey.id)}
                      title={savedIds.has(survey.id) ? "Unsave survey" : "Save survey"}
                    >
                      {savedIds.has(survey.id) ? (
                        <BookmarkCheck className="h-5 w-5 text-primary" />
                      ) : (
                        <Bookmark className="h-5 w-5" />
                      )}
                    </Button>
                    <Button
                      asChild
                      className="bg-gradient-primary shadow-elegant hover:shadow-glow transition-all"
                    >
                      <Link
                        to={ROUTES.survey}
                        state={{ surveyId: String(survey.id), source: "for-you" }}
                      >
                        Take Survey
                      </Link>
                    </Button>
                  </div>
                </div>

                {progress !== null && (
                  <div className="w-full bg-secondary rounded-full h-2 mt-4">
                    <div
                      className="bg-gradient-primary h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </AppShell>
  );
};

export default ForYou;
