import { useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { AppShell } from "@/shared/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  Users, Clock, TrendingUp, Star, ArrowLeft, ShieldCheck,
  type LucideIcon,
} from "lucide-react";

// ─── Types (mirrors backend SurveyAnalytics schema) ──────────────────────────

interface DailyCount { date: string; count: number; }

interface QuestionBreakdown {
  question_id: number;
  question_text: string;
  question_type: string;
  total_answers: number;
  distribution: Record<string, number> | null;
  mean: number | null;
  median: number | null;
  text_answers: string[] | null;
  question_completion_rate: number | null;
  sentiment: Record<string, number> | null;
}

interface DemographicBreakdown {
  profession: Record<string, number>;
  category: Record<string, number>;
}

interface SurveyAnalytics {
  survey_id: number;
  title: string;
  status: string;
  response_count: number;
  target_responses: number | null;
  completion_rate: number | null;
  avg_completion_seconds: number | null;
  responses_by_day: DailyCount[];
  question_breakdowns: QuestionBreakdown[];
  demographics: DemographicBreakdown;
  avg_rating: number | null;
  rating_count: number;
  weekly_velocity: number | null;
  deadline: string | null;
  published_at: string | null;
  verified_respondent_count: number;
  verified_percentage: number | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const COLORS_A = ["hsl(var(--primary))", "#6366f1", "#f59e0b", "#10b981", "#ef4444"];
const COLORS_B = ["hsl(var(--accent))",  "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

const fmtSeconds = (s: number | null) => {
  if (s === null) return "N/A";
  if (s < 60) return `${Math.round(s)}s`;
  return `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const MetricCard = ({
  label,
  a,
  b,
  icon: Icon,
}: {
  label: string;
  a: string;
  b: string;
  icon: LucideIcon;
}) => (
  <Card className="p-4 border-border/50 bg-card/50 backdrop-blur-sm">
    <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </div>
    <div className="grid grid-cols-2 gap-2">
      <div className="rounded-lg bg-primary/5 p-3 text-center">
        <p className="text-lg font-bold text-primary">{a}</p>
        <p className="text-xs text-muted-foreground mt-0.5">Survey A</p>
      </div>
      <div className="rounded-lg bg-accent/5 p-3 text-center">
        <p className="text-lg font-bold text-accent">{b}</p>
        <p className="text-xs text-muted-foreground mt-0.5">Survey B</p>
      </div>
    </div>
  </Card>
);

const DistributionComparison = ({
  a,
  b,
}: {
  a: QuestionBreakdown;
  b: QuestionBreakdown | undefined;
}) => {
  if (!a.distribution && !b?.distribution) return null;

  const keys = Array.from(
    new Set([
      ...Object.keys(a.distribution ?? {}),
      ...Object.keys(b?.distribution ?? {}),
    ]),
  );

  const data = keys.map((key) => ({
    name: key.length > 20 ? `${key.slice(0, 18)}…` : key,
    A: a.distribution?.[key] ?? 0,
    B: b?.distribution?.[key] ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="A" fill={COLORS_A[0]} name="Survey A" />
        <Bar dataKey="B" fill={COLORS_B[0]} name="Survey B" />
      </BarChart>
    </ResponsiveContainer>
  );
};

const DemographicPie = ({
  data,
  colors,
  label,
}: {
  data: Record<string, number>;
  colors: string[];
  label: string;
}) => {
  const entries = Object.entries(data).slice(0, 5).map(([name, value]) => ({ name, value }));
  if (entries.length === 0) return <p className="text-xs text-muted-foreground py-4 text-center">No data</p>;
  return (
    <>
      <p className="text-xs font-semibold text-muted-foreground mb-2">{label}</p>
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie data={entries} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60}>
            {entries.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => [Number(v), "responses"]} />
          <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

const SurveyComparison = () => {
  const [searchParams] = useSearchParams();
  const idsParam = searchParams.get("ids") ?? "";
  const surveyIds = useMemo(
    () =>
      idsParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 2),
    [idsParam],
  );

  const comparisonQuery = useQuery({
    queryKey: queryKeys.surveyComparison(surveyIds.join(",")),
    queryFn: () =>
      api.get<SurveyAnalytics[]>(`/surveys/compare?survey_ids=${surveyIds.join(",")}`),
    enabled: surveyIds.length === 2,
    staleTime: 60_000,
  });

  const [a, b] = comparisonQuery.data ?? [];

  if (surveyIds.length < 2) {
    return (
      <AppShell withContainer mainClassName="max-w-5xl px-4 pb-12 pt-24">
        <Card className="p-8 text-center border-border/50 bg-card/50 backdrop-blur-sm space-y-4">
          <h1 className="text-2xl font-bold">Compare Surveys</h1>
          <p className="text-muted-foreground">
            Navigate here from a survey's analytics page to compare two surveys side by side.
          </p>
          <Button asChild variant="outline">
            <Link to={ROUTES.profile}>Go to Profile</Link>
          </Button>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell withContainer mainClassName="max-w-6xl px-4 pb-12 pt-24" backgroundClassName="bg-gradient-subtle">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2">
            <Link to={ROUTES.profile}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Link>
          </Button>
          <h1 className="text-4xl font-bold">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Survey Comparison
            </span>
          </h1>
        </div>
      </div>

      {comparisonQuery.isPending && (
        <Card className="p-8 text-center border-border/50 bg-card/50 backdrop-blur-sm">
          <p className="text-muted-foreground">Loading comparison data…</p>
        </Card>
      )}

      {comparisonQuery.isError && (
        <Card className="p-8 text-center border-border/50 bg-card/50 backdrop-blur-sm space-y-3">
          <p className="font-semibold">Failed to load comparison</p>
          <p className="text-sm text-muted-foreground">
            {comparisonQuery.error instanceof Error
              ? comparisonQuery.error.message
              : "You must be the creator of both surveys."}
          </p>
          <Button variant="outline" onClick={() => comparisonQuery.refetch()}>
            Retry
          </Button>
        </Card>
      )}

      {a && b && (
        <div className="space-y-8">
          {/* Survey titles */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { survey: a, colors: COLORS_A, label: "Survey A" },
              { survey: b, colors: COLORS_B, label: "Survey B" },
            ].map(({ survey, label }) => (
              <Card key={survey.survey_id} className="p-5 border-border/50 bg-card/50 backdrop-blur-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
                <h2 className="text-lg font-semibold leading-snug">{survey.title}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="capitalize">{survey.status}</Badge>
                  {survey.avg_rating && (
                    <Badge variant="secondary">★ {survey.avg_rating.toFixed(1)}</Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Key metric cards */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <MetricCard
              label="Responses"
              a={String(a.response_count)}
              b={String(b.response_count)}
              icon={Users}
            />
            <MetricCard
              label="Completion Rate"
              a={a.completion_rate !== null ? `${Math.round(a.completion_rate * 100)}%` : "N/A"}
              b={b.completion_rate !== null ? `${Math.round(b.completion_rate * 100)}%` : "N/A"}
              icon={TrendingUp}
            />
            <MetricCard
              label="Avg. Time"
              a={fmtSeconds(a.avg_completion_seconds)}
              b={fmtSeconds(b.avg_completion_seconds)}
              icon={Clock}
            />
            <MetricCard
              label="Avg. Rating"
              a={a.avg_rating !== null ? `${a.avg_rating.toFixed(2)} / 5` : "N/A"}
              b={b.avg_rating !== null ? `${b.avg_rating.toFixed(2)} / 5` : "N/A"}
              icon={Star}
            />
          </div>

          {/* Verified respondents */}
          <div className="grid grid-cols-2 gap-4">
            <MetricCard
              label="Verified Respondents"
              a={`${a.verified_respondent_count} (${a.verified_percentage?.toFixed(0) ?? "?"}%)`}
              b={`${b.verified_respondent_count} (${b.verified_percentage?.toFixed(0) ?? "?"}%)`}
              icon={ShieldCheck}
            />
            <MetricCard
              label="Weekly Velocity"
              a={a.weekly_velocity !== null ? `${a.weekly_velocity >= 0 ? "+" : ""}${a.weekly_velocity} this week` : "N/A"}
              b={b.weekly_velocity !== null ? `${b.weekly_velocity >= 0 ? "+" : ""}${b.weekly_velocity} this week` : "N/A"}
              icon={TrendingUp}
            />
          </div>

          {/* Demographics side-by-side */}
          <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
            <h3 className="font-semibold mb-4">Profession Demographics</h3>
            <div className="grid grid-cols-2 gap-6">
              <DemographicPie data={a.demographics.profession} colors={COLORS_A} label="Survey A" />
              <DemographicPie data={b.demographics.profession} colors={COLORS_B} label="Survey B" />
            </div>
          </Card>

          {/* Per-question distributions */}
          {a.question_breakdowns.filter((q) => q.distribution).map((qA) => {
            const qB = b.question_breakdowns.find((q) => q.question_text === qA.question_text);
            return (
              <Card key={qA.question_id} className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Question comparison
                </p>
                <h4 className="font-medium mb-4 leading-snug">{qA.question_text}</h4>
                <DistributionComparison a={qA} b={qB} />
                {!qB && (
                  <p className="text-xs text-muted-foreground mt-2">
                    This question is only in Survey A.
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </AppShell>
  );
};

export default SurveyComparison;
