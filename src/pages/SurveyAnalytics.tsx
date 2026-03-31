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
  LineChart, Line, CartesianGrid, PieChart, Pie, Cell,
  ReferenceLine, Legend,
} from "recharts";
import { Users, Clock, TrendingUp, ArrowLeft, MessageSquare, HelpCircle } from "lucide-react";

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

const PIE_COLORS = [
  "hsl(var(--primary))",
  "#6366f1",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#84cc16",
];

const fmtSeconds = (s: number) => {
  if (s < 60) return `${Math.round(s)}s`;
  return `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`;
};

const QUESTION_TYPE_LABELS: Record<string, string> = {
  "multiple-choice": "Multiple Choice",
  "checkboxes": "Checkboxes",
  "dropdown": "Dropdown",
  "linear-scale": "Linear Scale",
  "short-text": "Short Answer",
  "long-text": "Long Answer",
};

/** Pie/donut chart for multiple-choice and dropdown */
const ChoicePieChart = ({ distribution }: { distribution: Record<string, number> }) => {
  const data = Object.entries(distribution).map(([name, value]) => ({ name, value }));
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      <ResponsiveContainer width={220} height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v: number) => [`${v} (${Math.round((v / total) * 100)}%)`, "Responses"]} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center gap-2 text-sm">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
            />
            <span className="truncate flex-1 text-muted-foreground">{d.name}</span>
            <span className="font-medium tabular-nums">{d.value}</span>
            <span className="text-muted-foreground tabular-nums w-10 text-right">
              {Math.round((d.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/** Horizontal bar chart for checkboxes (multiple-select) */
const CheckboxBarChart = ({ distribution }: { distribution: Record<string, number> }) => {
  const data = Object.entries(distribution)
    .map(([option, count]) => ({ option, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <ResponsiveContainer width="100%" height={Math.max(160, data.length * 40)}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
        <YAxis type="category" dataKey="option" tick={{ fontSize: 11 }} width={140} />
        <Tooltip />
        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} label={{ position: "right", fontSize: 11 }} />
      </BarChart>
    </ResponsiveContainer>
  );
};

/** Bar chart for linear scale with mean reference line */
const LinearScaleChart = ({ distribution, mean }: { distribution: Record<string, number>; mean: number | null }) => {
  const data = Object.entries(distribution)
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => Number(a.value) - Number(b.value));

  return (
    <div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="value" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          {mean !== null && (
            <ReferenceLine
              x={String(Math.round(mean))}
              stroke="hsl(var(--destructive))"
              strokeDasharray="4 2"
              label={{ value: `avg ${mean}`, position: "top", fontSize: 11, fill: "hsl(var(--destructive))" }}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

/** Text answer bubbles for short/long text questions */
const TextAnswerList = ({ answers }: { answers: string[] }) => {
  if (answers.length === 0) {
    return <p className="text-sm text-muted-foreground italic">No text responses yet.</p>;
  }
  return (
    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
      {answers.map((a, i) => (
        <div key={i} className="bg-muted/50 rounded-lg px-4 py-2 text-sm text-foreground border border-border/40">
          {a}
        </div>
      ))}
    </div>
  );
};

/** Renders the right chart per question type */
const QuestionVisualization = ({ q }: { q: QuestionBreakdown }) => {
  const { question_type, distribution, mean, text_answers, total_answers } = q;

  if (total_answers === 0) {
    return <p className="text-sm text-muted-foreground italic">No responses yet.</p>;
  }

  if (question_type === "multiple-choice" || question_type === "dropdown") {
    if (distribution && Object.keys(distribution).length > 0) {
      return <ChoicePieChart distribution={distribution} />;
    }
  }

  if (question_type === "checkboxes") {
    if (distribution && Object.keys(distribution).length > 0) {
      return <CheckboxBarChart distribution={distribution} />;
    }
  }

  if (question_type === "linear-scale") {
    if (distribution && Object.keys(distribution).length > 0) {
      return <LinearScaleChart distribution={distribution} mean={mean} />;
    }
  }

  if (question_type === "short-text" || question_type === "long-text") {
    return <TextAnswerList answers={text_answers ?? []} />;
  }

  return <p className="text-sm text-muted-foreground italic">No visualization available for this question type.</p>;
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
      {/* Header */}
      <div className="mb-8">
        <Button variant="outline" asChild className="mb-4 -ml-2">
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
          <div className="text-xs text-muted-foreground">
            Responses{data.target_responses ? ` / ${data.target_responses}` : ""}
          </div>
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
          <HelpCircle className="mx-auto h-5 w-5 text-muted-foreground mb-2" />
          <div className="text-2xl font-bold">{data.question_breakdowns.length}</div>
          <div className="text-xs text-muted-foreground">Questions</div>
        </Card>
      </div>

      {/* Response Progress */}
      {data.target_responses && (
        <Card className="p-6 mb-8 border-border/50 bg-card/50 backdrop-blur">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Response Progress</span>
            <span className="text-muted-foreground">{data.response_count} / {data.target_responses}</span>
          </div>
          <Progress value={data.completion_rate ? data.completion_rate * 100 : 0} className="h-3" />
        </Card>
      )}

      {/* Responses Over Time */}
      {data.responses_by_day.length > 0 && (
        <Card className="p-6 mb-8 border-border/50 bg-card/50 backdrop-blur">
          <h2 className="font-semibold mb-4">Responses Over Time</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.responses_by_day}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Per-Question Breakdowns */}
      <div className="space-y-6 mb-8">
        <h2 className="text-xl font-semibold">Questions</h2>
        {data.question_breakdowns.map((q, i) => (
          <Card key={q.question_id} className="p-6 border-border/50 bg-card/50 backdrop-blur">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-muted-foreground">Q{i + 1}</span>
              <Badge variant="outline" className="text-xs">
                {QUESTION_TYPE_LABELS[q.question_type] ?? q.question_type}
              </Badge>
              {(q.question_type === "short-text" || q.question_type === "long-text") && (
                <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </div>
            <h3 className="font-medium text-base mb-1">{q.question_text}</h3>
            <p className="text-xs text-muted-foreground mb-4">{q.total_answers} response{q.total_answers !== 1 ? "s" : ""}</p>

            <QuestionVisualization q={q} />

            {/* Mean / Median footer for scale questions */}
            {q.mean !== null && (
              <div className="mt-3 flex gap-4 text-sm text-muted-foreground">
                <span>Mean: <span className="font-semibold text-foreground">{q.mean}</span></span>
                {q.median !== null && (
                  <span>Median: <span className="font-semibold text-foreground">{q.median}</span></span>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Demographics */}
      {(professionData.length > 0 || categoryData.length > 0) && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Respondent Demographics</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {professionData.length > 0 && (
              <Card className="p-6 border-border/50 bg-card/50 backdrop-blur">
                <h3 className="font-semibold mb-4 text-sm">By Profession</h3>
                <ResponsiveContainer width="100%" height={Math.max(160, professionData.length * 40)}>
                  <BarChart data={professionData} layout="vertical" margin={{ left: 8, right: 24 }}>
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={130} />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            )}
            {categoryData.length > 0 && (
              <Card className="p-6 border-border/50 bg-card/50 backdrop-blur">
                <h3 className="font-semibold mb-4 text-sm">By Category</h3>
                <ResponsiveContainer width="100%" height={Math.max(160, categoryData.length * 40)}>
                  <BarChart data={categoryData} layout="vertical" margin={{ left: 8, right: 24 }}>
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
};

export default SurveyAnalytics;
