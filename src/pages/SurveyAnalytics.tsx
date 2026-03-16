import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AppShell } from "@/shared/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ROUTES } from "@/lib/routes";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from "recharts";
import { Users, Clock, TrendingUp, ArrowLeft } from "lucide-react";

interface DailyCount { date: string; count: number; }
interface QuestionBreakdown {
  question_id: number;
  question_text: string;
  question_type: string;
  total_answers: number;
  distribution: Record<string, number> | null;
  mean: number | null;
  median: number | null;
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
  demographics: { profession: Record<string, number>; category: Record<string, number> };
}

const fmtSeconds = (s: number) => {
  if (s < 60) return `${Math.round(s)}s`;
  return `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`;
};

const SurveyAnalytics = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const { data, isPending, isError } = useQuery({
    queryKey: ["analytics", surveyId],
    queryFn: () => api.get<SurveyAnalytics>(`/surveys/${surveyId}/analytics`),
    enabled: !!surveyId,
  });

  if (isPending) return (
    <AppShell withContainer mainClassName="px-4 pb-12 pt-24">
      <div className="text-center py-16 text-muted-foreground">Loading analytics...</div>
    </AppShell>
  );

  if (isError || !data) return (
    <AppShell withContainer mainClassName="px-4 pb-12 pt-24">
      <div className="text-center py-16 text-destructive">Failed to load analytics. Make sure you are the survey creator.</div>
    </AppShell>
  );

  const professionData = Object.entries(data.demographics.profession).map(([k, v]) => ({ name: k.replace("_", " "), value: v }));
  const categoryData = Object.entries(data.demographics.category).map(([k, v]) => ({ name: k, value: v }));

  return (
    <AppShell withContainer mainClassName="max-w-5xl px-4 pb-12 pt-24" backgroundClassName="bg-gradient-subtle">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4 -ml-2">
          <Link to={ROUTES.profile}><ArrowLeft className="mr-2 h-4 w-4" />Back to Profile</Link>
        </Button>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">{data.title}</h1>
          <Badge variant={data.status === "published" ? "default" : "secondary"}>
            {data.status}
          </Badge>
        </div>
        <p className="text-muted-foreground">Survey Analytics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-5 border-border/50 bg-card/50 backdrop-blur text-center">
          <Users className="mx-auto h-5 w-5 text-primary mb-2" />
          <div className="text-2xl font-bold text-primary">{data.response_count}</div>
          <div className="text-xs text-muted-foreground">Responses{data.target_responses ? ` / ${data.target_responses}` : ""}</div>
        </Card>
        <Card className="p-5 border-border/50 bg-card/50 backdrop-blur text-center">
          <TrendingUp className="mx-auto h-5 w-5 text-success mb-2" />
          <div className="text-2xl font-bold text-success">
            {data.completion_rate !== null ? `${Math.round(data.completion_rate * 100)}%` : "—"}
          </div>
          <div className="text-xs text-muted-foreground">Completion Rate</div>
        </Card>
        <Card className="p-5 border-border/50 bg-card/50 backdrop-blur text-center">
          <Clock className="mx-auto h-5 w-5 text-accent mb-2" />
          <div className="text-2xl font-bold text-accent">
            {data.avg_completion_seconds !== null ? fmtSeconds(data.avg_completion_seconds) : "—"}
          </div>
          <div className="text-xs text-muted-foreground">Avg Time</div>
        </Card>
        <Card className="p-5 border-border/50 bg-card/50 backdrop-blur text-center">
          <div className="text-2xl font-bold mb-2">{data.question_breakdowns.length}</div>
          <div className="text-xs text-muted-foreground">Questions</div>
        </Card>
      </div>

      {/* Completion progress bar */}
      {data.target_responses && (
        <Card className="p-6 mb-8 border-border/50 bg-card/50 backdrop-blur">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Response Progress</span>
            <span className="text-muted-foreground">{data.response_count} / {data.target_responses}</span>
          </div>
          <Progress value={data.completion_rate ? data.completion_rate * 100 : 0} className="h-3" />
        </Card>
      )}

      {/* Responses over time */}
      {data.responses_by_day.length > 0 && (
        <Card className="p-6 mb-8 border-border/50 bg-card/50 backdrop-blur">
          <h2 className="font-semibold mb-4">Responses Over Time</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.responses_by_day}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Per-question breakdowns */}
      <div className="space-y-6 mb-8">
        <h2 className="text-xl font-semibold">Question Breakdowns</h2>
        {data.question_breakdowns.map((q, i) => (
          <Card key={q.question_id} className="p-6 border-border/50 bg-card/50 backdrop-blur">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-muted-foreground">Q{i + 1}</span>
              <Badge variant="outline" className="text-xs">{q.question_type}</Badge>
            </div>
            <h3 className="font-medium mb-4">{q.question_text}</h3>
            <p className="text-xs text-muted-foreground mb-3">{q.total_answers} answers</p>
            {q.distribution && Object.keys(q.distribution).length > 0 && (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={Object.entries(q.distribution).map(([k, v]) => ({ option: k, count: v }))}>
                  <XAxis dataKey="option" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
            {q.mean !== null && (
              <div className="text-sm text-muted-foreground">
                Mean: <span className="font-medium text-foreground">{q.mean}</span>
                {q.median !== null && <> · Median: <span className="font-medium text-foreground">{q.median}</span></>}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Demographics */}
      <div className="grid md:grid-cols-2 gap-6">
        {professionData.length > 0 && (
          <Card className="p-6 border-border/50 bg-card/50 backdrop-blur">
            <h2 className="font-semibold mb-4">Respondents by Profession</h2>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={professionData} layout="vertical">
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={120} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}
        {categoryData.length > 0 && (
          <Card className="p-6 border-border/50 bg-card/50 backdrop-blur">
            <h2 className="font-semibold mb-4">Respondents by Category</h2>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={categoryData} layout="vertical">
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>
    </AppShell>
  );
};

export default SurveyAnalytics;
