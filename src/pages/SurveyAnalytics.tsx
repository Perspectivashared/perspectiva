import { useState, useMemo, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import * as XLSX from "xlsx";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { AppShell } from "@/shared/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ROUTES } from "@/lib/routes";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell,
  ReferenceLine, Legend, ComposedChart, Area,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import {
  Users, Clock, TrendingUp, ArrowLeft, HelpCircle,
  Lightbulb, Star, ShieldCheck, Download, Filter, SlidersHorizontal,
  X, FlaskConical, AlertTriangle, Info, Zap, Sparkles, Activity,
  FileText, Copy, Printer, Table as TableIcon, Zap as ZapIcon,
  Microscope, Wind, Moon, User,
} from "lucide-react";

// ---------------------------------------------------------------------------
// TypeScript interfaces (mirror backend schemas)
// ---------------------------------------------------------------------------

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
  profession_distribution: Record<string, Record<string, number>> | null;
  completion_time_distribution: Record<string, Record<string, number>> | null;
}

interface DemographicBreakdown {
  profession: Record<string, number>;
  category: Record<string, number>;
  institution: Record<string, number>;
  sub_category: Record<string, number>;
}

interface QuestionCorrelation {
  question_a_id: number;
  question_b_id: number;
  question_a_text: string;
  question_b_text: string;
  pearson_r: number;
}

interface PlatformBenchmark {
  avg_completion_seconds: number | null;
  avg_response_count: number | null;
}

interface DemographicCross {
  profession: string;
  category: string;
  count: number;
}

interface RespondentCluster {
  label: string;
  count: number;
  avg_completion_seconds: number | null;
  avg_question_completion: number;
}

interface SurveyAnalytics {
  survey_id: number;
  title: string;
  status: string;
  response_count: number;
  target_responses: number | null;
  completion_rate: number | null;
  avg_completion_seconds: number | null;
  median_completion_seconds: number | null;
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
  suspicious_response_count: number;
  suspicious_percentage: number | null;
  speeder_count: number;
  straight_line_count: number;
  saved_count: number;
  completion_time_buckets: Array<{ label: string; count: number }>;
  correlations: QuestionCorrelation[];
  platform_benchmark: PlatformBenchmark | null;
  cross_demographics: DemographicCross[];
  clusters: RespondentCluster[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CHART_COLORS = [
  "hsl(var(--primary))",
  "#6366f1", "#f59e0b", "#10b981", "#ef4444",
  "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#84cc16",
];

const PROF_COLORS: Record<string, string> = {
  student: "hsl(var(--primary))",
  corporate_employee: "#6366f1",
  self_employed: "#f59e0b",
  independent_researcher: "#10b981",
  other: "#8b5cf6",
};

const QUESTION_TYPE_LABELS: Record<string, string> = {
  "multiple-choice": "Multiple Choice",
  "checkboxes": "Checkboxes",
  "dropdown": "Dropdown",
  "linear-scale": "Linear Scale",
  "short-text": "Short Answer",
  "long-text": "Long Answer",
};

const INSIGHT_THRESHOLDS = {
  MIN_RESPONSES: 10,
  MIN_DOMINANCE_PCT: 40,
  MIN_OPTION_DELTA_PCT: 20,
  MIN_VELOCITY_DELTA: 5,
  MIN_PROFESSION_PCT: 35,
} as const;

const STOP_WORDS = new Set([
  "the","a","an","and","or","but","in","on","at","to","for","of","with",
  "is","it","this","that","was","are","i","my","we","you","be","has","had",
  "have","do","did","will","would","could","should","its","our","their",
]);

const POSITIVE_WORDS = new Set([
  "good","great","excellent","amazing","love","helpful","easy","clear","perfect",
  "useful","enjoyed","happy","satisfied","awesome","fantastic","best","nice",
  "pleased","wonderful","brilliant","outstanding","superb",
]);

const NEGATIVE_WORDS = new Set([
  "bad","poor","terrible","awful","hard","confusing","unclear","difficult","hate",
  "waste","boring","useless","disappointed","worst","frustrating","slow","broken",
  "wrong","annoying","buggy",
]);

import type { LucideIcon } from "lucide-react";

const CLUSTER_ICONS: Record<string, LucideIcon> = {
  "Fast & Complete": ZapIcon,
  "Thorough": Microscope,
  "Rushed": Wind,
  "Disengaged": Moon,
};

// ---------------------------------------------------------------------------
// Utility functions
// ---------------------------------------------------------------------------

const fmtSeconds = (s: number) => {
  if (s < 60) return `${Math.round(s)}s`;
  return `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`;
};

function calcMarginOfError(n: number): number | null {
  if (n < 2) return null;
  return Math.round(1.96 * Math.sqrt(0.25 / n) * 100 * 10) / 10;
}

function classifyDistribution(distribution: Record<string, number>): string {
  const values = Object.entries(distribution)
    .map(([k, v]) => ({ val: Number(k), count: v }))
    .sort((a, b) => a.val - b.val);
  if (values.length < 3) return "";
  const total = values.reduce((s, v) => s + v.count, 0);
  const mean = values.reduce((s, v) => s + v.val * v.count, 0) / total;
  const max = Math.max(...values.map(v => v.val));
  const min = Math.min(...values.map(v => v.val));
  const midpoint = (max + min) / 2;
  const counts = values.map(v => v.count);
  const localMaxima = counts.filter(
    (c, i) => i > 0 && i < counts.length - 1 && c > counts[i - 1] && c > counts[i + 1]
  );
  if (localMaxima.length >= 2) return "Bimodal — respondents are polarized";
  if (mean < midpoint - 1) return "Skewed low — most responses are low";
  if (mean > midpoint + 1) return "Skewed high — most responses are high";
  const topCount = Math.max(...counts);
  if (topCount / total > 0.5) return "Concentrated — strong consensus";
  return "Roughly uniform";
}

function calcDifficultyIndex(q: QuestionBreakdown): "Easy" | "Moderate" | "Hard" | null {
  if (q.question_completion_rate == null) return null;
  const completionScore = 1 - q.question_completion_rate;
  let varianceScore = 0;
  if (q.distribution) {
    const vals = Object.values(q.distribution);
    const total = vals.reduce((s, v) => s + v, 0);
    const probs = vals.map(v => v / total);
    const entropy = -probs.reduce((s, p) => s + (p > 0 ? p * Math.log2(p) : 0), 0);
    const maxEntropy = Math.log2(vals.length || 1);
    varianceScore = maxEntropy > 0 ? entropy / maxEntropy : 0;
  }
  const index = completionScore * 0.6 + (1 - varianceScore) * 0.4;
  if (index < 0.3) return "Easy";
  if (index < 0.6) return "Moderate";
  return "Hard";
}

function detectOutliers(distribution: Record<string, number>): { count: number; values: number[] } {
  const expanded: number[] = [];
  for (const [k, cnt] of Object.entries(distribution)) {
    for (let i = 0; i < cnt; i++) expanded.push(Number(k));
  }
  expanded.sort((a, b) => a - b);
  const q1 = expanded[Math.floor(expanded.length * 0.25)];
  const q3 = expanded[Math.floor(expanded.length * 0.75)];
  const iqr = q3 - q1;
  const lo = q1 - 1.5 * iqr;
  const hi = q3 + 1.5 * iqr;
  const outliers = expanded.filter(v => v < lo || v > hi);
  return { count: outliers.length, values: [...new Set(outliers)] };
}

function detectPolarization(distribution: Record<string, number>) {
  const sorted = Object.entries(distribution).sort(([, a], [, b]) => b - a);
  if (sorted.length < 2) return null;
  const total = Object.values(distribution).reduce((s, v) => s + v, 0);
  if (total < 10) return null;
  const [[optA, cntA], [optB, cntB]] = sorted;
  const pctA = (cntA / total) * 100;
  const pctB = (cntB / total) * 100;
  if (pctA + pctB >= 70 && Math.abs(pctA - pctB) <= 15) {
    return { optionA: optA, optionB: optB, pctA: Math.round(pctA), pctB: Math.round(pctB) };
  }
  return null;
}

function buildWordFrequency(answers: string[]) {
  const freq: Record<string, number> = {};
  for (const a of answers) {
    for (const w of (a.toLowerCase().match(/\b[a-z]{3,}\b/g) ?? [])) {
      if (!STOP_WORDS.has(w)) freq[w] = (freq[w] ?? 0) + 1;
    }
  }
  return Object.entries(freq)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 40);
}

function buildNGrams(answers: string[], n: 2 | 3) {
  const freq: Record<string, number> = {};
  for (const answer of answers) {
    const words = (answer.toLowerCase().match(/\b[a-z]{2,}\b/g) ?? [])
      .filter(w => !STOP_WORDS.has(w));
    for (let i = 0; i <= words.length - n; i++) {
      const phrase = words.slice(i, i + n).join(" ");
      freq[phrase] = (freq[phrase] ?? 0) + 1;
    }
  }
  return Object.entries(freq)
    .filter(([, count]) => count >= 2)
    .map(([phrase, count]) => ({ phrase, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);
}

function extractRepresentativeQuotes(answers: string[]): string[] {
  const scored = answers
    .filter(a => a.trim().length > 20)
    .map(a => {
      const words = a.toLowerCase().split(/\s+/);
      const sentimentStrength =
        words.filter(w => POSITIVE_WORDS.has(w)).length +
        words.filter(w => NEGATIVE_WORDS.has(w)).length;
      const lengthScore = Math.min(a.length / 200, 1);
      return { text: a, score: sentimentStrength * 0.6 + lengthScore * 0.4 };
    })
    .sort((a, b) => b.score - a.score);

  const selected: string[] = [];
  for (const { text } of scored) {
    const textWords = new Set(text.toLowerCase().split(/\s+/));
    const isDuplicate = selected.some(s => {
      const sWords = new Set(s.toLowerCase().split(/\s+/));
      const overlap = [...textWords].filter(w => sWords.has(w)).length;
      return overlap / Math.min(textWords.size, sWords.size) > 0.5;
    });
    if (!isDuplicate) selected.push(text);
    if (selected.length === 3) break;
  }
  return selected;
}

function detectFatigue(breakdowns: QuestionBreakdown[]) {
  const rates = breakdowns.map(q => q.question_completion_rate ?? 1);
  if (rates.length < 3) return { detected: false, drop_starts_at: null, gradient: 0 };
  const n = rates.length;
  const xs = rates.map((_, i) => i);
  const mx = xs.reduce((s, x) => s + x, 0) / n;
  const my = rates.reduce((s, y) => s + y, 0) / n;
  const ssxx = xs.reduce((s, x) => s + (x - mx) ** 2, 0) || 1;
  const gradient = xs.reduce((s, x, i) => s + (x - mx) * (rates[i] - my), 0) / ssxx;
  let drop_starts_at: number | null = null;
  for (let i = 1; i < rates.length; i++) {
    if (rates[i - 1] - rates[i] > 0.1) { drop_starts_at = i + 1; break; }
  }
  return { detected: gradient < -0.02, drop_starts_at, gradient: Math.round(gradient * 100) };
}

function detectTrendAcceleration(days: DailyCount[]) {
  if (days.length < 5) return { trend: "insufficient" as const, slope: 0 };
  const ys = days.map(d => d.count);
  const n = ys.length;
  const xs = ys.map((_, i) => i);
  const mx = xs.reduce((s, x) => s + x, 0) / n;
  const my = ys.reduce((s, y) => s + y, 0) / n;
  const ssxx = xs.reduce((s, x) => s + (x - mx) ** 2, 0) || 1;
  const slope = xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0) / ssxx;
  if (slope > 0.5) return { trend: "accelerating" as const, slope };
  if (slope < -0.5) return { trend: "decelerating" as const, slope };
  return { trend: "stable" as const, slope };
}

function detectSpikes(days: DailyCount[]) {
  if (days.length < 5) return [];
  const counts = days.map(d => d.count);
  const mean = counts.reduce((s, c) => s + c, 0) / counts.length;
  const std = Math.sqrt(counts.reduce((s, c) => s + (c - mean) ** 2, 0) / counts.length);
  return days.filter(d => d.count > mean + 2 * std && d.count > 3);
}

function checkDemographicDominance(demographics: DemographicBreakdown, total: number) {
  for (const [dim, counts] of [
    ["profession", demographics.profession],
    ["category", demographics.category],
  ] as const) {
    const entries = Object.entries(counts).sort(([, a], [, b]) => b - a);
    if (!entries.length) continue;
    const [topGroup, topCount] = entries[0];
    const pct = Math.round((topCount / total) * 100);
    if (pct >= 70) {
      return `${pct}% of respondents are ${topGroup.replace(/_/g, " ")} (by ${dim}) — results may not represent a broader population`;
    }
  }
  return null;
}

function calcProjection(data: SurveyAnalytics) {
  if (!data.published_at || !data.deadline || !data.responses_by_day.length) return null;
  const now = Date.now();
  const deadline = new Date(data.deadline).getTime();
  const daysLeft = Math.max(0, Math.ceil((deadline - now) / 86400000));
  const published = new Date(data.published_at).getTime();
  const daysSince = Math.max(1, Math.ceil((now - published) / 86400000));
  const dailyAvg = data.response_count / daysSince;
  return { projected: Math.round(data.response_count + dailyAvg * daysLeft), daysLeft };
}

function calcEngagementScore(data: SurveyAnalytics): { score: number; label: string } {
  let score = 0;
  let weight = 0;
  if (data.completion_rate != null) { score += data.completion_rate * 40; weight += 40; }
  if (data.avg_rating != null) { score += ((data.avg_rating - 1) / 4) * 30; weight += 30; }
  if (data.weekly_velocity != null && data.response_count > 0) {
    const velScore = Math.min(Math.max((data.weekly_velocity / data.response_count) * 100, 0), 1);
    score += velScore * 20; weight += 20;
  }
  if (data.verified_percentage != null) { score += (data.verified_percentage / 100) * 10; weight += 10; }
  const normalized = weight > 0 ? Math.round((score / weight) * 100) : 0;
  const label = normalized >= 75 ? "Excellent" : normalized >= 50 ? "Strong" : normalized >= 25 ? "Moderate" : "Poor";
  return { score: normalized, label };
}

// ---------------------------------------------------------------------------
// Insight generation
// ---------------------------------------------------------------------------

interface Insight {
  text: string;
  severity: "info" | "warning" | "action";
  score: number;
}

function generateInsights(data: SurveyAnalytics): Insight[] {
  const insights: Insight[] = [];

  // Dominant choice answer
  const firstChoice = data.question_breakdowns.find(q =>
    ["multiple-choice", "dropdown", "checkboxes"].includes(q.question_type) && q.distribution
  );
  if (firstChoice?.distribution && firstChoice.total_answers >= INSIGHT_THRESHOLDS.MIN_RESPONSES) {
    const sorted = Object.entries(firstChoice.distribution).sort(([, a], [, b]) => b - a);
    const [top, topCnt] = sorted[0];
    const secondCnt = sorted[1]?.[1] ?? 0;
    const pct = Math.round((topCnt / firstChoice.total_answers) * 100);
    const delta = pct - Math.round((secondCnt / firstChoice.total_answers) * 100);
    if (pct >= INSIGHT_THRESHOLDS.MIN_DOMINANCE_PCT && delta >= INSIGHT_THRESHOLDS.MIN_OPTION_DELTA_PCT) {
      insights.push({
        severity: "info",
        score: (pct / 100) * 0.4 + Math.min(firstChoice.total_answers / 100, 1) * 0.3 + (delta / 100) * 0.3,
        text: `Most popular answer for "${firstChoice.question_text.slice(0, 45)}..." was "${top}" (${pct}%)`,
      });
    }
  }

  // Avg completion time
  if (data.avg_completion_seconds != null) {
    insights.push({
      severity: "info", score: 0.3,
      text: `Average completion time is ${fmtSeconds(data.avg_completion_seconds)}`,
    });
  }

  // Dominant profession
  const profEntries = Object.entries(data.demographics.profession ?? {}).sort(([, a], [, b]) => b - a);
  if (profEntries.length > 0 && data.response_count >= INSIGHT_THRESHOLDS.MIN_RESPONSES) {
    const [prof, cnt] = profEntries[0];
    const pct = Math.round((cnt / data.response_count) * 100);
    if (pct >= INSIGHT_THRESHOLDS.MIN_PROFESSION_PCT) {
      insights.push({
        severity: "info",
        score: (pct / 100) * 0.4 + Math.min(data.response_count / 100, 1) * 0.3 + 0.3,
        text: `${pct}% of respondents are ${prof.replace(/_/g, " ")}`,
      });
    }
  }

  // Weekly velocity
  if (data.weekly_velocity != null && Math.abs(data.weekly_velocity) >= INSIGHT_THRESHOLDS.MIN_VELOCITY_DELTA) {
    const dir = data.weekly_velocity > 0 ? "up" : "down";
    insights.push({
      severity: data.weekly_velocity < 0 ? "warning" : "info",
      score: 0.4 + Math.min(Math.abs(data.weekly_velocity) / 20, 0.4),
      text: `Response rate is trending ${dir} by ${Math.abs(data.weekly_velocity)} vs. last week`,
    });
  }

  // Peak day
  if (data.responses_by_day.length > 1) {
    const peak = [...data.responses_by_day].sort((a, b) => b.count - a.count)[0];
    insights.push({
      severity: "info", score: 0.25,
      text: `Highest single-day count: ${peak.count} responses on ${peak.date}`,
    });
  }

  // Fatigue detection
  const fatigue = detectFatigue(data.question_breakdowns);
  if (fatigue.detected && fatigue.drop_starts_at) {
    insights.push({
      severity: "warning", score: 0.7,
      text: `Survey fatigue detected — completion drops significantly from Question ${fatigue.drop_starts_at}`,
    });
  }

  // Polarization
  for (const q of data.question_breakdowns) {
    if (q.distribution && q.total_answers >= INSIGHT_THRESHOLDS.MIN_RESPONSES) {
      const pol = detectPolarization(q.distribution);
      if (pol) {
        insights.push({
          severity: "warning", score: 0.65,
          text: `Polarized opinions on "${q.question_text.slice(0, 40)}..." — split between "${pol.optionA}" (${pol.pctA}%) and "${pol.optionB}" (${pol.pctB}%)`,
        });
      }
    }
  }

  // Verified percentage
  if (data.verified_percentage != null) {
    insights.push({
      severity: "info", score: 0.3,
      text: `${data.verified_percentage}% of respondents have verified email addresses`,
    });
  }

  // Suspicious responses warning
  if (data.suspicious_percentage != null && data.suspicious_percentage > 10) {
    insights.push({
      severity: "warning", score: 0.75,
      text: `${data.suspicious_percentage}% of responses show suspicious patterns (${data.suspicious_response_count} flagged)`,
    });
  }

  // Low response count — actionable
  if (data.target_responses && data.response_count < data.target_responses * 0.1 && data.response_count >= 1) {
    insights.push({
      severity: "action", score: 0.8,
      text: `Response count is under 10% of target — consider promoting this survey`,
    });
  }

  // Negative velocity — actionable
  if (data.weekly_velocity != null && data.weekly_velocity < -5) {
    insights.push({
      severity: "action", score: 0.75,
      text: `Response rate is declining — survey may need resharing`,
    });
  }

  // Overall sentiment
  const textQsWithSentiment = data.question_breakdowns.filter(q => q.sentiment);
  if (textQsWithSentiment.length > 0) {
    const totals = textQsWithSentiment.reduce(
      (s, q) => ({
        pos: s.pos + (q.sentiment?.positive ?? 0),
        neg: s.neg + (q.sentiment?.negative ?? 0),
        all: s.all + Object.values(q.sentiment ?? {}).reduce((a, b) => a + b, 0),
      }),
      { pos: 0, neg: 0, all: 0 }
    );
    if (totals.all > 0) {
      const dom = totals.pos > totals.neg ? "positive" : totals.neg > totals.pos ? "negative" : "mixed";
      insights.push({
        severity: dom === "negative" ? "warning" : "info",
        score: 0.45,
        text: `Text responses are predominantly ${dom} in tone (${Math.round((totals.pos / totals.all) * 100)}% positive)`,
      });
    }
  }

  // Trend acceleration
  const accel = detectTrendAcceleration(data.responses_by_day);
  if (accel.trend === "decelerating") {
    insights.push({ severity: "warning", score: 0.55, text: "Response rate is decelerating over time" });
  } else if (accel.trend === "accelerating") {
    insights.push({ severity: "info", score: 0.5, text: "Response rate is accelerating — survey is gaining momentum" });
  }

  // Spike detection
  const spikes = detectSpikes(data.responses_by_day);
  if (spikes.length > 0) {
    insights.push({
      severity: "info", score: 0.35,
      text: `Response spike detected on ${spikes[0].date} (${spikes[0].count} responses) — likely from an external share`,
    });
  }

  return insights.sort((a, b) => b.score - a.score).slice(0, 6);
}

// ---------------------------------------------------------------------------
// Health dashboard
// ---------------------------------------------------------------------------

type HealthStatus = "good" | "warn" | "bad" | "na";
interface HealthMetric { label: string; status: HealthStatus; detail: string }

function getSurveyHealth(data: SurveyAnalytics): HealthMetric[] {
  return [
    {
      label: "Response Rate",
      status: !data.completion_rate ? "na" : data.completion_rate >= 0.5 ? "good" : data.completion_rate >= 0.2 ? "warn" : "bad",
      detail: data.completion_rate != null ? `${Math.round(data.completion_rate * 100)}%` : "No target",
    },
    {
      label: "Data Quality",
      status: data.verified_percentage == null ? "na" : data.verified_percentage >= 70 ? "good" : data.verified_percentage >= 40 ? "warn" : "bad",
      detail: data.verified_percentage != null ? `${data.verified_percentage}% verified` : "Unknown",
    },
    {
      label: "Momentum",
      status: data.weekly_velocity == null ? "na" : data.weekly_velocity > 0 ? "good" : data.weekly_velocity === 0 ? "warn" : "bad",
      detail: data.weekly_velocity != null ? `${data.weekly_velocity > 0 ? "+" : ""}${data.weekly_velocity} this week` : "Insufficient data",
    },
    {
      label: "Satisfaction",
      status: !data.avg_rating ? "na" : data.avg_rating >= 4 ? "good" : data.avg_rating >= 3 ? "warn" : "bad",
      detail: data.avg_rating != null ? `${data.avg_rating.toFixed(1)} / 5` : "No ratings",
    },
    {
      label: "Completion",
      status: (() => {
        const rates = data.question_breakdowns.map(q => q.question_completion_rate ?? 1);
        if (!rates.length) return "na";
        const avg = rates.reduce((s, r) => s + r, 0) / rates.length;
        return avg >= 0.85 ? "good" : avg >= 0.65 ? "warn" : "bad";
      })(),
      detail: (() => {
        const rates = data.question_breakdowns.map(q => q.question_completion_rate ?? 1);
        if (!rates.length) return "N/A";
        return `Avg ${Math.round(rates.reduce((s, r) => s + r, 0) / rates.length * 100)}%`;
      })(),
    },
  ];
}

// ---------------------------------------------------------------------------
// Recommendation engine
// ---------------------------------------------------------------------------

interface Recommendation { title: string; description: string; priority: "high" | "medium" | "low" }

function generateRecommendations(data: SurveyAnalytics): Recommendation[] {
  const recs: Recommendation[] = [];
  const rates = data.question_breakdowns.map(q => q.question_completion_rate ?? 1);
  const avgRate = rates.reduce((s, r) => s + r, 0) / (rates.length || 1);

  if (avgRate < 0.7 && data.question_breakdowns.length > 8) {
    recs.push({ priority: "high", title: "Consider shortening the survey",
      description: `Average question completion rate is ${Math.round(avgRate * 100)}%. Fewer questions typically improve completion.` });
  }
  const textQs = data.question_breakdowns.filter(q => ["short-text", "long-text"].includes(q.question_type)).length;
  if (textQs > 2) {
    recs.push({ priority: "medium", title: "Reduce open-text questions",
      description: `${textQs} open-ended questions may increase abandonment. Consider converting some to structured formats.` });
  }
  if (data.verified_percentage != null && data.verified_percentage < 50) {
    recs.push({ priority: "medium", title: "Promote to verified users",
      description: `Only ${data.verified_percentage}% of respondents have verified emails. Targeting verified users improves credibility.` });
  }
  if (data.weekly_velocity != null && data.weekly_velocity < 0 && data.completion_rate != null && data.completion_rate < 0.5) {
    recs.push({ priority: "high", title: "Re-share your survey",
      description: "Response rate is declining and target is below 50%. Resharing in relevant communities could help." });
  }
  const fatigue = detectFatigue(data.question_breakdowns);
  if (fatigue.detected && fatigue.drop_starts_at) {
    recs.push({ priority: "high", title: `Reorder questions after Q${fatigue.drop_starts_at}`,
      description: `Respondents consistently drop off after question ${fatigue.drop_starts_at}. Move critical questions earlier.` });
  }
  if (data.suspicious_response_count > 0 && data.response_count > 0 && (data.suspicious_response_count / data.response_count) > 0.15) {
    recs.push({ priority: "high", title: "High suspicious response rate",
      description: `${data.suspicious_response_count} responses appear low-quality. Consider adding attention checks.` });
  }
  return recs.sort((a, b) => (a.priority === "high" ? -1 : a.priority === "medium" ? 0 : 1) - (b.priority === "high" ? -1 : b.priority === "medium" ? 0 : 1));
}

// ---------------------------------------------------------------------------
// Export functions
// ---------------------------------------------------------------------------

function exportToCSV(data: SurveyAnalytics) {
  const rows: string[][] = [];
  rows.push(["== Summary =="]);
  rows.push(["Survey", data.title]);
  rows.push(["Status", data.status]);
  rows.push(["Total Responses", String(data.response_count)]);
  rows.push(["Target Responses", String(data.target_responses ?? "N/A")]);
  rows.push(["Completion Rate", data.completion_rate != null ? `${Math.round(data.completion_rate * 100)}%` : "N/A"]);
  rows.push(["Avg Completion Time", data.avg_completion_seconds != null ? fmtSeconds(data.avg_completion_seconds) : "N/A"]);
  rows.push(["Avg Rating", data.avg_rating != null ? String(data.avg_rating) : "N/A"]);
  rows.push(["Verified Respondents %", data.verified_percentage != null ? `${data.verified_percentage}%` : "N/A"]);
  rows.push([]);
  rows.push(["== Question Breakdowns =="]);
  rows.push(["Question", "Type", "Total Answers", "Completion %", "Mean", "Median", "Option", "Count"]);
  for (const q of data.question_breakdowns) {
    if (q.distribution) {
      for (const [opt, cnt] of Object.entries(q.distribution)) {
        rows.push([q.question_text, q.question_type, String(q.total_answers),
          q.question_completion_rate != null ? `${Math.round(q.question_completion_rate * 100)}%` : "",
          String(q.mean ?? ""), String(q.median ?? ""), opt, String(cnt)]);
      }
    } else {
      rows.push([q.question_text, q.question_type, String(q.total_answers),
        q.question_completion_rate != null ? `${Math.round(q.question_completion_rate * 100)}%` : "",
        String(q.mean ?? ""), String(q.median ?? ""), "", ""]);
    }
  }
  rows.push([]);
  rows.push(["== Demographics (Profession) =="]);
  for (const [k, v] of Object.entries(data.demographics.profession ?? {})) rows.push([k.replace(/_/g, " "), String(v)]);
  // Neutralise CSV formula injection: a cell beginning with = + - @ (or a
  // leading tab/CR) is executed as a formula by Excel/Sheets. Prefix such cells
  // with a single quote, then quote-escape as usual.
  const csvCell = (c: string) => {
    const s = String(c ?? "");
    const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  const csv = rows.map(r => r.map(csvCell).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: `${data.title.replace(/[^a-z0-9]/gi, "_")}_analytics.csv` });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportToXLSX(data: SurveyAnalytics) {
  const { score } = calcEngagementScore(data);
  const moe = calcMarginOfError(data.response_count);
  const wb = XLSX.utils.book_new();

  const summary: (string | number)[][] = [
    ["Survey", data.title],
    ["Status", data.status],
    ["Total Responses", data.response_count],
    ["Target Responses", data.target_responses ?? "N/A"],
    ["Completion Rate", data.completion_rate != null ? `${Math.round(data.completion_rate * 100)}%` : "N/A"],
    ["Avg Completion Time", data.avg_completion_seconds != null ? fmtSeconds(data.avg_completion_seconds) : "N/A"],
    ["Avg Rating", data.avg_rating ?? "N/A"],
    ["Verified Respondents %", data.verified_percentage != null ? `${data.verified_percentage}%` : "N/A"],
    ["Engagement Score", score],
    ["Margin of Error", moe != null ? `±${moe}%` : "N/A"],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summary), "Summary");

  const qRows: (string | number)[][] = [["Question", "Type", "Total Answers", "Completion %", "Mean", "Median", "Option", "Count", "Difficulty"]];
  for (const q of data.question_breakdowns) {
    const diff = calcDifficultyIndex(q) ?? "";
    const compPct = q.question_completion_rate != null ? Math.round(q.question_completion_rate * 100) : "";
    if (q.distribution) {
      for (const [opt, cnt] of Object.entries(q.distribution)) {
        qRows.push([q.question_text, q.question_type, q.total_answers, compPct, q.mean ?? "", q.median ?? "", opt, cnt, diff]);
      }
    } else {
      qRows.push([q.question_text, q.question_type, q.total_answers, compPct, q.mean ?? "", q.median ?? "", "", "", diff]);
    }
  }
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(qRows), "Questions");

  const dRows: (string | number)[][] = [["Dimension", "Value", "Count"]];
  for (const [k, v] of Object.entries(data.demographics.profession ?? {})) dRows.push(["Profession", k.replace(/_/g, " "), v]);
  for (const [k, v] of Object.entries(data.demographics.category ?? {})) dRows.push(["Category", k, v]);
  for (const [k, v] of Object.entries(data.demographics.institution ?? {})) dRows.push(["Institution", k, v]);
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(dRows), "Demographics");

  const insights = generateInsights(data);
  const iRows: (string | number)[][] = [["Severity", "Insight", "Score"]];
  for (const ins of insights) iRows.push([ins.severity, ins.text, ins.score.toFixed(3)]);
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(iRows), "Insights");

  const tsRows: (string | number)[][] = [["Date", "Daily Responses", "Cumulative"]];
  let cum = 0;
  for (const d of data.responses_by_day) { cum += d.count; tsRows.push([d.date, d.count, cum]); }
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(tsRows), "Time Series");

  XLSX.writeFile(wb, `${data.title.replace(/[^a-z0-9]/gi, "_")}_analytics.xlsx`);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const SEVERITY_STYLES = {
  info: { icon: <Info className="h-3.5 w-3.5 text-primary shrink-0" />, text: "text-muted-foreground" },
  warning: { icon: <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />, text: "text-amber-600 dark:text-amber-400" },
  action: { icon: <Zap className="h-3.5 w-3.5 text-destructive shrink-0" />, text: "text-destructive" },
};

const KeyInsightsPanel = ({ data }: { data: SurveyAnalytics }) => {
  const insights = generateInsights(data);
  if (!insights.length) return null;
  return (
    <Card className="p-6 mb-8 border-amber-200/30 bg-amber-50/5 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="h-5 w-5 text-amber-500" />
        <h2 className="font-semibold">Key Insights</h2>
      </div>
      <ul className="space-y-2.5">
        {insights.map((insight) => (
          <li key={`${insight.severity}:${insight.text}`} className="flex items-start gap-2 text-sm">
            {SEVERITY_STYLES[insight.severity].icon}
            <span className={SEVERITY_STYLES[insight.severity].text}>{insight.text}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
};

const STATUS_DOT: Record<HealthStatus, string> = {
  good: "bg-emerald-500", warn: "bg-amber-500", bad: "bg-destructive", na: "bg-muted-foreground/40"
};

const SurveyHealthDashboard = ({ data }: { data: SurveyAnalytics }) => {
  const metrics = getSurveyHealth(data);
  return (
    <Card className="p-6 mb-8 border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-5 w-5 text-primary" />
        <h2 className="font-semibold">Survey Health</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {metrics.map(m => (
          <div key={m.label} className="text-center">
            <div className={cn("h-2.5 w-2.5 rounded-full mx-auto mb-2", STATUS_DOT[m.status])} />
            <div className="text-xs font-medium">{m.label}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{m.detail}</div>
          </div>
        ))}
      </div>
    </Card>
  );
};

const RespondentClusters = ({ clusters, total }: { clusters: RespondentCluster[]; total: number }) => {
  if (clusters.length < 2) return null;
  return (
    <Card className="p-6 mb-8 border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-5">
        <Users className="h-5 w-5 text-primary" />
        <h2 className="font-semibold">Respondent Segments</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {clusters.map(c => {
          const ClusterIcon = CLUSTER_ICONS[c.label] ?? User;
          return (
          <div key={c.label} className="rounded-xl border border-border/40 p-4 text-center">
            <div className="flex justify-center mb-1"><ClusterIcon className="h-6 w-6 text-primary" /></div>
            <div className="font-semibold text-sm">{c.label}</div>
            <div className="text-2xl font-bold text-primary mt-1">{c.count}</div>
            <div className="text-xs text-muted-foreground">{Math.round((c.count / total) * 100)}% of respondents</div>
            {c.avg_completion_seconds != null && (
              <div className="text-xs text-muted-foreground mt-1">Avg: {fmtSeconds(c.avg_completion_seconds)}</div>
            )}
            <div className="text-xs text-muted-foreground">{Math.round(c.avg_question_completion * 100)}% answered</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

const WordFrequencyCloud = ({ answers }: { answers: string[] }) => {
  const [mode, setMode] = useState<"words" | "phrases">("words");
  const wordData = buildWordFrequency(answers);
  const phraseData = buildNGrams(answers, 2);
  const quotes = extractRepresentativeQuotes(answers);
  const items = mode === "words" ? wordData.map(w => ({ text: w.word, count: w.count })) : phraseData.map(p => ({ text: p.phrase, count: p.count }));
  const maxCount = items[0]?.count ?? 1;

  return (
    <div>
      {quotes.length > 0 && (
        <div className="space-y-2 mb-4">
          {quotes.map((q, i) => (
            <blockquote key={i} className="border-l-2 border-primary/40 pl-3 text-sm text-muted-foreground italic">
              "{q}"
            </blockquote>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2 mb-3">
        {(["words", "phrases"] as const).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={cn("text-xs px-2.5 py-1 rounded-md transition-colors capitalize",
              mode === m ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground"
            )}>
            {m}
          </button>
        ))}
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">Not enough data for {mode} cloud.</p>
      ) : (
        <div className="flex flex-wrap gap-2 py-1">
          {items.map(({ text, count }) => (
            <span key={text}
              className="rounded-full px-3 py-1 bg-primary/10 text-primary font-medium cursor-default hover:bg-primary/20 transition-colors"
              style={{ fontSize: `${0.7 + (count / maxCount) * 0.8}rem`, opacity: 0.5 + (count / maxCount) * 0.5 }}
              title={`${count} occurrence${count !== 1 ? "s" : ""}`}>
              {text}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const TextAnswerList = ({ answers }: { answers: string[] }) => {
  if (!answers.length) return <p className="text-sm text-muted-foreground italic">No text responses yet.</p>;
  return (
    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
      {answers.map((a, i) => (
        <div key={i} className="bg-muted/50 rounded-lg px-4 py-2 text-sm text-foreground border border-border/40">{a}</div>
      ))}
    </div>
  );
};

const SentimentBar = ({ sentiment }: { sentiment: Record<string, number> }) => {
  const total = Object.values(sentiment).reduce((s, v) => s + v, 0);
  if (total === 0) return null;
  const SENT_COLORS: Record<string, string> = {
    positive: "#10b981", neutral: "#6b7280", negative: "#ef4444"
  };
  const entries = [
    { key: "positive", label: "Positive", count: sentiment.positive ?? 0 },
    { key: "neutral",  label: "Neutral",  count: sentiment.neutral  ?? 0 },
    { key: "negative", label: "Negative", count: sentiment.negative ?? 0 },
  ].filter(e => e.count > 0);
  return (
    <div className="mt-3">
      <p className="text-xs text-muted-foreground font-medium mb-2">Sentiment</p>
      <div className="flex rounded-full overflow-hidden h-2.5 w-full">
        {entries.map(e => (
          <div key={e.key} style={{ width: `${(e.count / total) * 100}%`, backgroundColor: SENT_COLORS[e.key] }} />
        ))}
      </div>
      <div className="flex gap-4 mt-1.5">
        {entries.map(e => (
          <span key={e.key} className="text-xs text-muted-foreground flex items-center gap-1">
            <span className="h-2 w-2 rounded-full inline-block" style={{ backgroundColor: SENT_COLORS[e.key] }} />
            {e.label}: {Math.round((e.count / total) * 100)}%
          </span>
        ))}
      </div>
    </div>
  );
};

/** Diverging horizontal bar for choice questions with ≥4 options */
const DivergingBar = ({ distribution, total, sort }: {
  distribution: Record<string, number>; total: number; sort: "count" | "alpha"
}) => {
  const entries = Object.entries(distribution)
    .sort(sort === "count" ? ([, a], [, b]) => b - a : ([a], [b]) => a.localeCompare(b))
    .map(([label, count], i) => ({ label, count, pct: Math.round((count / total) * 100), color: CHART_COLORS[i % CHART_COLORS.length] }));
  return (
    <div className="space-y-1.5 mt-2">
      {entries.map(({ label, count, pct, color }) => (
        <div key={label} className="flex items-center gap-2 text-xs">
          <span className="w-32 text-right text-muted-foreground truncate" title={label}>{label}</span>
          <div className="flex-1 flex items-center gap-1.5">
            <div className="h-5 rounded-r-sm transition-all" style={{ width: `${pct}%`, backgroundColor: color, opacity: 0.85, minWidth: pct > 0 ? "4px" : "0" }} />
            <span className="text-muted-foreground tabular-nums whitespace-nowrap">{pct}% ({count})</span>
          </div>
        </div>
      ))}
    </div>
  );
};

const ChoicePieChart = ({ distribution }: { distribution: Record<string, number> }) => {
  const data = Object.entries(distribution).map(([name, value]) => ({ name, value }));
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      <ResponsiveContainer width={200} height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={2} dataKey="value">
            {data.map((entry, i) => <Cell key={entry.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
          </Pie>
          <Tooltip formatter={(v) => { const n = Number(v); return [`${n} (${Math.round((n / total) * 100)}%)`, "Responses"]; }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
            <span className="truncate flex-1 text-muted-foreground">{d.name}</span>
            <span className="font-medium tabular-nums">{d.value}</span>
            <span className="text-muted-foreground tabular-nums w-10 text-right">{Math.round((d.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const CheckboxBarChart = ({ distribution, sort }: { distribution: Record<string, number>; sort: "count" | "alpha" }) => {
  const data = Object.entries(distribution)
    .sort(sort === "count" ? ([, a], [, b]) => b - a : ([a], [b]) => a.localeCompare(b))
    .map(([option, count]) => ({ option, count }));
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

const LinearScaleHeatmap = ({ distribution, mean }: { distribution: Record<string, number>; mean: number | null }) => {
  const entries = Object.entries(distribution).map(([k, v]) => ({ val: Number(k), count: v })).sort((a, b) => a.val - b.val);
  const maxCount = Math.max(...entries.map(e => e.count), 1);
  return (
    <div className="mt-2">
      <div className="flex gap-1 items-end">
        {entries.map(({ val, count }) => (
          <div key={val} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full rounded-sm transition-all"
              style={{ height: `${Math.max(8, (count / maxCount) * 60)}px`, backgroundColor: `hsl(var(--primary) / ${0.15 + (count / maxCount) * 0.85})` }}
              title={`${val}: ${count} responses`} />
            <span className="text-xs text-muted-foreground">{val}</span>
          </div>
        ))}
      </div>
      {mean != null && <p className="text-xs text-muted-foreground mt-2 text-center">Mean: <span className="font-mono text-foreground">{mean.toFixed(2)}</span></p>}
    </div>
  );
};

const ProfessionBreakdownChart = ({ distribution }: { distribution: Record<string, Record<string, number>> }) => {
  const allOptions = [...new Set(Object.values(distribution).flatMap(d => Object.keys(d)))];
  const professions = Object.keys(distribution);
  const chartData = allOptions.map(option => {
    const row: Record<string, string | number> = { option: option.slice(0, 22) };
    for (const prof of professions) row[prof] = distribution[prof]?.[option] ?? 0;
    return row;
  });
  return (
    <div className="mt-4">
      <p className="text-xs text-muted-foreground mb-2 font-medium">By Profession</p>
      <ResponsiveContainer width="100%" height={Math.max(160, allOptions.length * 36)}>
        <BarChart layout="vertical" data={chartData}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border/30" />
          <XAxis type="number" tick={{ fontSize: 10 }} />
          <YAxis type="category" dataKey="option" width={130} tick={{ fontSize: 10 }} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {professions.map(prof => (
            <Bar key={prof} dataKey={prof} name={prof.replace(/_/g, " ")} stackId="a"
              fill={PROF_COLORS[prof] ?? "#8b5cf6"} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

/** Router: picks the right chart for each question type */
const QuestionVisualization = ({ q, distSort, activeProfession }: {
  q: QuestionBreakdown; distSort: "count" | "alpha"; activeProfession: string | null;
}) => {
  const { question_type, distribution, mean, text_answers, total_answers, profession_distribution } = q;

  const effectiveDist = (activeProfession && profession_distribution?.[activeProfession])
    ? profession_distribution[activeProfession]
    : distribution;

  if (total_answers === 0) return <p className="text-sm text-muted-foreground italic">No responses yet.</p>;

  if (question_type === "multiple-choice" || question_type === "dropdown") {
    if (effectiveDist && Object.keys(effectiveDist).length > 0) {
      const optCount = Object.keys(effectiveDist).length;
      return optCount >= 4
        ? <DivergingBar distribution={effectiveDist} total={Object.values(effectiveDist).reduce((s, v) => s + v, 0)} sort={distSort} />
        : <ChoicePieChart distribution={effectiveDist} />;
    }
  }

  if (question_type === "checkboxes") {
    if (effectiveDist && Object.keys(effectiveDist).length > 0) {
      return <CheckboxBarChart distribution={effectiveDist} sort={distSort} />;
    }
  }

  if (question_type === "linear-scale") {
    if (distribution && Object.keys(distribution).length > 0) {
      return <LinearScaleHeatmap distribution={distribution} mean={mean} />;
    }
  }

  if (question_type === "short-text" || question_type === "long-text") {
    const answers = text_answers ?? [];
    return answers.length >= 5 ? <WordFrequencyCloud answers={answers} /> : <TextAnswerList answers={answers} />;
  }

  return <p className="text-sm text-muted-foreground italic">No visualization available.</p>;
};

const DropoffFunnel = ({ breakdowns }: { breakdowns: QuestionBreakdown[] }) => {
  const withRate = breakdowns.filter(q => q.question_completion_rate != null);
  if (withRate.length < 2) return null;
  const funnelData = withRate.map((q, i) => ({
    name: `Q${i + 1}: ${q.question_text.slice(0, 28)}`,
    rate: Math.round((q.question_completion_rate ?? 0) * 100),
  }));
  return (
    <Card className="p-6 mb-8 border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-primary" />
        <h2 className="font-semibold">Question Drop-off</h2>
        <span className="text-xs text-muted-foreground ml-1">— where respondents stopped answering</span>
      </div>
      <ResponsiveContainer width="100%" height={funnelData.length * 44 + 20}>
        <BarChart layout="vertical" data={funnelData} barCategoryGap="25%">
          <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border/30" />
          <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="name" width={190} tick={{ fontSize: 11 }} />
          <Tooltip formatter={(v) => `${v}%`} />
          <Bar dataKey="rate" name="Answered" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

const LinearScaleRadar = ({ breakdowns }: { breakdowns: QuestionBreakdown[] }) => {
  const scaleQs = breakdowns.filter(q => q.question_type === "linear-scale" && q.mean != null);
  if (scaleQs.length < 2) return null;
  const radarData = scaleQs.map(q => ({
    question: q.question_text.slice(0, 28),
    mean: q.mean ?? 0,
    fullMark: 10,
  }));
  return (
    <Card className="p-6 mb-8 border-border/50 bg-card/50 backdrop-blur-sm">
      <h2 className="font-semibold mb-4">Scale Questions Overview</h2>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={radarData}>
          <PolarGrid className="stroke-border/40" />
          <PolarAngleAxis dataKey="question" tick={{ fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fontSize: 10 }} />
          <Radar name="Mean Score" dataKey="mean" stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))" fillOpacity={0.25} strokeWidth={2} />
          <Tooltip formatter={(v) => Number(v).toFixed(2)} />
        </RadarChart>
      </ResponsiveContainer>
    </Card>
  );
};

const CorrelationMatrix = ({ correlations, breakdowns }: { correlations: QuestionCorrelation[]; breakdowns: QuestionBreakdown[] }) => {
  const scaleQs = breakdowns.filter(q => q.question_type === "linear-scale");
  if (scaleQs.length < 2 || !correlations.length) return null;
  const getR = (aId: number, bId: number) =>
    correlations.find(c => (c.question_a_id === aId && c.question_b_id === bId) || (c.question_a_id === bId && c.question_b_id === aId))?.pearson_r ?? null;
  const cellBg = (r: number | null) => {
    if (r === null) return "bg-muted/30";
    if (r > 0.6) return "bg-emerald-500/70 text-white";
    if (r > 0.3) return "bg-emerald-500/25";
    if (r < -0.6) return "bg-destructive/70 text-white";
    if (r < -0.3) return "bg-destructive/25";
    return "bg-muted/30";
  };
  return (
    <Card className="p-6 mb-8 border-border/50 bg-card/50 backdrop-blur-sm overflow-x-auto">
      <h2 className="font-semibold mb-4">Question Correlation Matrix</h2>
      <table className="text-xs border-collapse">
        <thead>
          <tr>
            <th className="w-32" />
            {scaleQs.map(q => (
              <th key={q.question_id} className="px-2 py-1 text-center max-w-20 font-normal text-muted-foreground">
                {q.question_text.slice(0, 18)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {scaleQs.map(rowQ => (
            <tr key={rowQ.question_id}>
              <td className="pr-3 text-right text-muted-foreground max-w-32 truncate">{rowQ.question_text.slice(0, 22)}</td>
              {scaleQs.map(colQ => {
                const r = rowQ.question_id === colQ.question_id ? 1 : getR(rowQ.question_id, colQ.question_id);
                return (
                  <td key={colQ.question_id} className={cn("w-14 h-10 text-center rounded-sm m-0.5 font-mono transition-colors", cellBg(r))}
                    title={r != null && r !== 1 ? `r = ${r}` : ""}>
                    {rowQ.question_id === colQ.question_id ? "—" : r?.toFixed(2) ?? ""}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-muted-foreground mt-3">Green = positive · Red = negative · Values = Pearson r</p>
    </Card>
  );
};

const AutoResearchSummary = ({ data }: { data: SurveyAnalytics }) => {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const parts: string[] = [];
  parts.push(`This survey titled "${data.title}" received ${data.response_count} response${data.response_count !== 1 ? "s" : ""}.`);
  const topProf = Object.entries(data.demographics.profession ?? {}).sort(([, a], [, b]) => b - a)[0];
  if (topProf && data.response_count > 0) {
    parts.push(`The majority of respondents (${Math.round(topProf[1] / data.response_count * 100)}%) were ${topProf[0].replace(/_/g, " ")}s.`);
  }
  if (data.avg_completion_seconds != null) parts.push(`The average completion time was ${fmtSeconds(data.avg_completion_seconds)}.`);
  const choiceQ = data.question_breakdowns.find(q => q.question_type === "multiple-choice" && q.distribution);
  if (choiceQ?.distribution) {
    const [top, cnt] = Object.entries(choiceQ.distribution).sort(([, a], [, b]) => b - a)[0];
    parts.push(`For "${choiceQ.question_text.slice(0, 50)}...", the most selected answer was "${top}" (${Math.round(cnt / choiceQ.total_answers * 100)}%).`);
  }
  if (data.avg_rating != null) parts.push(`Respondents rated this survey an average of ${data.avg_rating.toFixed(1)} out of 5.`);
  const summary = parts.join(" ");
  const copy = () => {
    void navigator.clipboard.writeText(summary);
    setCopied(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Card className="p-6 mb-8 border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-semibold">Auto Research Summary</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={copy} className="gap-1.5 text-xs">
          <Copy className="h-3.5 w-3.5" />{copied ? "Copied!" : "Copy"}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{summary}</p>
    </Card>
  );
};

const RecommendationsPanel = ({ data }: { data: SurveyAnalytics }) => {
  const recs = generateRecommendations(data);
  if (!recs.length) return null;
  const PRIORITY_COLOR: Record<string, string> = { high: "text-destructive", medium: "text-amber-500", low: "text-muted-foreground" };
  return (
    <Card className="p-6 mb-8 border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="font-semibold">Recommendations</h2>
      </div>
      <div className="space-y-3">
        {recs.map((rec) => (
          <div key={`${rec.priority}:${rec.title}`} className="flex items-start gap-3 rounded-lg border border-border/30 p-3">
            <span className={cn("text-xs font-semibold uppercase mt-0.5 w-14 shrink-0", PRIORITY_COLOR[rec.priority])}>
              {rec.priority}
            </span>
            <div>
              <div className="text-sm font-medium">{rec.title}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{rec.description}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

const CrossSegmentChart = ({ crosses }: { crosses: DemographicCross[] }) => {
  if (crosses.length < 4) return null;
  const categories = [...new Set(crosses.map(c => c.category))].slice(0, 10);
  const professions = [...new Set(crosses.map(c => c.profession))];
  const chartData = categories.map(cat => {
    const row: Record<string, string | number> = { category: cat.slice(0, 15) };
    for (const prof of professions) {
      row[prof] = crosses.find(c => c.category === cat && c.profession === prof)?.count ?? 0;
    }
    return row;
  });
  return (
    <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
      <h3 className="text-sm font-semibold mb-4">Profession × Category</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
          <XAxis dataKey="category" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {professions.map((prof, i) => (
            <Bar key={prof} dataKey={prof} name={prof.replace(/_/g, " ")}
              stackId="a" fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const SurveyAnalytics = () => {
  const { surveyId } = useParams<{ surveyId: string }>();

  // Filter state
  const [activeProfession, setActiveProfession] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Question controls
  const [questionSort, setQuestionSort] = useState<"order" | "most-answers" | "completion-asc" | "completion-desc">("order");
  const [questionTypeFilter, setQuestionTypeFilter] = useState("all");
  const [distSort, setDistSort] = useState<"count" | "alpha">("count");

  const { data, isPending, isError } = useQuery({
    queryKey: ["analytics", surveyId, dateFrom, dateTo],
    queryFn: () => {
      const params = new URLSearchParams();
      if (dateFrom) params.set("date_from", dateFrom);
      if (dateTo) params.set("date_to", dateTo);
      const qs = params.toString();
      return api.get<SurveyAnalytics>(`/surveys/${surveyId}/analytics${qs ? `?${qs}` : ""}`);
    },
    enabled: !!surveyId,
  });

  const hasActiveFilters = activeProfession || activeCategory || dateFrom || dateTo;

  const clearFilters = () => {
    setActiveProfession(null);
    setActiveCategory(null);
    setDateFrom("");
    setDateTo("");
  };

  const sortedFilteredQuestions = useMemo(() => {
    if (!data) return [];
    let qs = data.question_breakdowns;
    if (questionTypeFilter !== "all") qs = qs.filter(q => q.question_type === questionTypeFilter);
    switch (questionSort) {
      case "most-answers": qs = [...qs].sort((a, b) => b.total_answers - a.total_answers); break;
      case "completion-asc": qs = [...qs].sort((a, b) => (a.question_completion_rate ?? 1) - (b.question_completion_rate ?? 1)); break;
      case "completion-desc": qs = [...qs].sort((a, b) => (b.question_completion_rate ?? 0) - (a.question_completion_rate ?? 0)); break;
    }
    return qs;
  }, [data, questionSort, questionTypeFilter]);

  const derived = useMemo(() => {
    if (!data) return null;
    const { score: engScore, label: engLabel } = calcEngagementScore(data);
    const moe = calcMarginOfError(data.response_count);
    const proj = calcProjection(data);
    const professions = Object.keys(data.demographics.profession ?? {});
    const categories = Object.keys(data.demographics.category ?? {});
    const availableTypes = [...new Set(data.question_breakdowns.map(q => q.question_type))];
    const scored = data.question_breakdowns.map(q => {
      const completionPenalty = 1 - (q.question_completion_rate ?? 1);
      let variance = 0;
      if (q.distribution) {
        const vals = Object.values(q.distribution);
        const total = vals.reduce((s, v) => s + v, 0);
        const mean = vals.reduce((s, v, i) => s + v * i, 0) / total;
        variance = vals.reduce((s, v, i) => s + v * (i - mean) ** 2, 0) / total;
      }
      return { q, score: completionPenalty * 0.5 + Math.min(variance / 10, 1) * 0.5 };
    });
    scored.sort((a, b) => b.score - a.score);
    const featuredQuestion = scored[0]?.score > 0.2 ? scored[0].q : null;
    const cumulativeData = data.responses_by_day.reduce<Array<{ date: string; daily: number; cumulative: number }>>(
      (acc, d) => [...acc, { date: d.date, daily: d.count, cumulative: (acc[acc.length - 1]?.cumulative ?? 0) + d.count }], []
    );
    const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayCounts = Array<number>(7).fill(0);
    for (const { date, count } of data.responses_by_day) {
      dayCounts[new Date(date + "T00:00:00").getDay()] += count;
    }
    const dayOfWeek = DAY_NAMES.map((name, i) => ({ name, count: dayCounts[i] }));
    const spikes = detectSpikes(data.responses_by_day);
    const accel = detectTrendAcceleration(data.responses_by_day);
    const demographicWarning = checkDemographicDominance(data.demographics, data.response_count);
    const professionData = Object.entries(data.demographics.profession ?? {}).sort(([, a], [, b]) => b - a).map(([k, v]) => ({ name: k.replace(/_/g, " "), value: v }));
    const categoryData = Object.entries(data.demographics.category ?? {}).sort(([, a], [, b]) => b - a).map(([k, v]) => ({ name: k, value: v }));
    const institutionData = Object.entries(data.demographics.institution ?? {}).sort(([, a], [, b]) => b - a).map(([k, v]) => ({ name: k, value: v }));
    const subCatData = Object.entries(data.demographics.sub_category ?? {}).sort(([, a], [, b]) => b - a).map(([k, v]) => ({ name: k, value: v }));
    return { engScore, engLabel, moe, proj, professions, categories, availableTypes, featuredQuestion, cumulativeData, dayOfWeek, spikes, accel, demographicWarning, professionData, categoryData, institutionData, subCatData };
  }, [data]);

  if (isPending) return (
    <AppShell withContainer mainClassName="px-4 pb-12 pt-24">
      <div className="text-center py-16 text-muted-foreground">Loading analytics...</div>
    </AppShell>
  );
  if (isError || !data || !derived) return (
    <AppShell withContainer mainClassName="px-4 pb-12 pt-24">
      <div className="text-center py-16 text-destructive">Failed to load analytics. Make sure you are the survey creator.</div>
    </AppShell>
  );

  const { engScore, engLabel, moe, proj, professions, categories, availableTypes, featuredQuestion, cumulativeData, dayOfWeek, spikes, accel, demographicWarning, professionData, categoryData, institutionData, subCatData } = derived;

  return (
    <AppShell withContainer mainClassName="max-w-5xl px-4 pb-12 pt-24" backgroundClassName="bg-gradient-subtle">
      {/* Print styles */}
      <style>{`@media print { [data-print-hide]{display:none!important} body{background:white!important} .backdrop-blur-sm{backdrop-filter:none!important} [data-print-section]{page-break-inside:avoid;margin-bottom:1.5rem} }`}</style>

      {/* Header */}
      <div className="mb-8" data-print-section>
        <div className="flex flex-wrap items-center gap-2 mb-4" data-print-hide>
          <Button variant="outline" asChild className="-ml-2">
            <Link to={ROUTES.profile}><ArrowLeft className="mr-2 h-4 w-4" />Back to Profile</Link>
          </Button>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" asChild className="gap-2">
              <Link to={`/surveys/compare?ids=${surveyId ?? ""}`}>
                <Copy className="h-4 w-4" />Compare
              </Link>
            </Button>
            <Button variant="outline" onClick={() => exportToCSV(data)} className="gap-2">
              <Download className="h-4 w-4" />CSV
            </Button>
            <Button variant="outline" onClick={() => exportToXLSX(data)} className="gap-2">
              <TableIcon className="h-4 w-4" />Excel
            </Button>
            <Button variant="outline" onClick={() => window.print()} className="gap-2">
              <Printer className="h-4 w-4" />PDF
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">{data.title}</h1>
          <Badge variant={data.status === "published" ? "default" : "secondary"}>{data.status}</Badge>
        </div>
        <p className="text-muted-foreground">Survey Analytics</p>
      </div>

      {/* Small sample warning */}
      {data.response_count < 20 && data.response_count > 0 && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-400/40 bg-amber-50/10 px-5 py-4" data-print-section>
          <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-600">Small sample — interpret with caution</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Only {data.response_count} response{data.response_count !== 1 ? "s" : ""} so far. Statistical patterns are unreliable below 20.
              {data.target_responses && ` Target: ${data.target_responses}.`}
            </p>
          </div>
        </div>
      )}

      {/* Engagement score + summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8" data-print-section>
        {/* Engagement score */}
        <Card className="p-4 border-border/50 bg-card/50 backdrop-blur-sm text-center col-span-1">
          <div className="relative inline-flex items-center justify-center w-16 h-16 mb-1 mx-auto">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" className="stroke-muted" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsl(var(--primary))" strokeWidth="3"
                strokeDasharray={`${engScore} 100`} strokeLinecap="round" />
            </svg>
            <span className="absolute text-sm font-bold">{engScore}</span>
          </div>
          <div className="text-xs font-medium">{engLabel}</div>
          <div className="text-xs text-muted-foreground">Engagement</div>
        </Card>

        {/* Responses */}
        <Card className="p-5 border-border/50 bg-card/50 backdrop-blur-sm text-center">
          <Users className="mx-auto h-5 w-5 text-primary mb-2" />
          <div className="text-2xl font-bold text-primary">{data.response_count}</div>
          <div className="text-xs text-muted-foreground">Responses{data.target_responses ? ` / ${data.target_responses}` : ""}</div>
          {data.weekly_velocity != null && (
            <div className={cn("text-xs mt-1 font-medium",
              data.weekly_velocity > 0 ? "text-emerald-500" : data.weekly_velocity < 0 ? "text-destructive" : "text-muted-foreground"
            )}>
              {data.weekly_velocity > 0 ? "↑" : data.weekly_velocity < 0 ? "↓" : "→"} {Math.abs(data.weekly_velocity)} this week
            </div>
          )}
          {proj && <div className="text-xs text-muted-foreground mt-0.5">~{proj.projected} projected</div>}
        </Card>

        {/* Completion rate */}
        <Card className="p-5 border-border/50 bg-card/50 backdrop-blur-sm text-center">
          <TrendingUp className="mx-auto h-5 w-5 text-success mb-2" />
          <div className="text-2xl font-bold text-success">
            {data.completion_rate !== null ? `${Math.round(data.completion_rate * 100)}%` : "—"}
          </div>
          <div className="text-xs text-muted-foreground">Completion Rate</div>
          {data.platform_benchmark?.avg_response_count != null && (
            <div className={cn("text-xs mt-1", data.response_count >= data.platform_benchmark.avg_response_count ? "text-emerald-500" : "text-muted-foreground")}>
              {data.response_count >= data.platform_benchmark.avg_response_count ? "↑" : "↓"} avg: {Math.round(data.platform_benchmark.avg_response_count)}
            </div>
          )}
        </Card>

        {/* Avg time */}
        <Card className="p-5 border-border/50 bg-card/50 backdrop-blur-sm text-center">
          <Clock className="mx-auto h-5 w-5 text-accent mb-2" />
          <div className="text-2xl font-bold text-accent">
            {data.avg_completion_seconds !== null ? fmtSeconds(data.avg_completion_seconds) : "—"}
          </div>
          <div className="text-xs text-muted-foreground">Avg Time</div>
          {data.median_completion_seconds != null && (
            <div className="text-xs text-muted-foreground mt-0.5">Med: {fmtSeconds(data.median_completion_seconds)}</div>
          )}
        </Card>

        {/* Rating (conditional) */}
        {data.avg_rating != null ? (
          <Card className="p-5 border-border/50 bg-card/50 backdrop-blur-sm text-center">
            <Star className="mx-auto h-5 w-5 text-amber-400 mb-2" />
            <div className="text-2xl font-bold text-amber-400">{data.avg_rating.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">Avg Rating ({data.rating_count})</div>
          </Card>
        ) : (
          <Card className="p-5 border-border/50 bg-card/50 backdrop-blur-sm text-center">
            <HelpCircle className="mx-auto h-5 w-5 text-muted-foreground mb-2" />
            <div className="text-2xl font-bold">{data.question_breakdowns.length}</div>
            <div className="text-xs text-muted-foreground">Questions</div>
          </Card>
        )}

        {/* Data quality / margin of error */}
        {data.verified_percentage != null ? (
          <Card className="p-5 border-border/50 bg-card/50 backdrop-blur-sm text-center">
            <ShieldCheck className="mx-auto h-5 w-5 text-emerald-500 mb-2" />
            <div className="text-2xl font-bold text-emerald-500">{data.verified_percentage}%</div>
            <div className="text-xs text-muted-foreground">Verified</div>
            {data.speeder_count > 0 && <div className="text-xs text-amber-500 mt-0.5">{data.speeder_count} speeders</div>}
            {data.straight_line_count > 0 && <div className="text-xs text-amber-500">{data.straight_line_count} straight-line</div>}
          </Card>
        ) : moe != null ? (
          <Card className="p-5 border-border/50 bg-card/50 backdrop-blur-sm text-center">
            <FlaskConical className="mx-auto h-5 w-5 text-indigo-500 mb-2" />
            <div className="text-2xl font-bold text-indigo-500">±{moe}%</div>
            <div className="text-xs text-muted-foreground">Margin of Error (95%)</div>
          </Card>
        ) : (
          <Card className="p-5 border-border/50 bg-card/50 backdrop-blur-sm text-center">
            <HelpCircle className="mx-auto h-5 w-5 text-muted-foreground mb-2" />
            <div className="text-2xl font-bold">{data.question_breakdowns.length}</div>
            <div className="text-xs text-muted-foreground">Questions</div>
          </Card>
        )}
      </div>

      {/* Margin of error standalone (if verified card is shown) */}
      {data.verified_percentage != null && moe != null && (
        <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground px-1">
          <FlaskConical className="h-3.5 w-3.5 text-indigo-400" />
          Statistical confidence: ±{moe}% margin of error at 95% confidence level ({data.response_count} responses)
        </div>
      )}

      {/* Response progress */}
      {data.target_responses && (
        <Card className="p-6 mb-8 border-border/50 bg-card/50 backdrop-blur-sm" data-print-section>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Response Progress</span>
            <span className="text-muted-foreground">{data.response_count} / {data.target_responses}</span>
          </div>
          <Progress value={data.completion_rate ? data.completion_rate * 100 : 0} className="h-3" />
        </Card>
      )}

      {/* Survey Health */}
      <SurveyHealthDashboard data={data} />

      {/* Respondent Clusters */}
      <RespondentClusters clusters={data.clusters} total={data.response_count} />

      {/* Key Insights */}
      <KeyInsightsPanel data={data} />

      {/* Filter toolbar */}
      {(professions.length > 1 || categories.length > 0 || data.responses_by_day.length > 1) && (
        <div className="flex flex-wrap items-center gap-3 mb-6 p-4 rounded-xl border border-border/40 bg-muted/20" data-print-hide>
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />
          {professions.length > 1 && (
            <select value={activeProfession ?? ""} onChange={e => setActiveProfession(e.target.value || null)}
              className="text-sm border border-border rounded-md px-3 py-1.5 bg-background text-foreground">
              <option value="">All Professions</option>
              {professions.map(p => <option key={p} value={p}>{p.replace(/_/g, " ")}</option>)}
            </select>
          )}
          {categories.length > 0 && (
            <select value={activeCategory ?? ""} onChange={e => setActiveCategory(e.target.value || null)}
              className="text-sm border border-border rounded-md px-3 py-1.5 bg-background text-foreground">
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground text-xs">From</span>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="border border-border rounded-md px-2 py-1.5 bg-background text-foreground text-xs" />
            <span className="text-muted-foreground text-xs">to</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="border border-border rounded-md px-2 py-1.5 bg-background text-foreground text-xs" />
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-destructive hover:text-destructive gap-1.5">
              <X className="h-3.5 w-3.5" /> Clear
            </Button>
          )}
        </div>
      )}

      {/* Time charts */}
      {data.responses_by_day.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6 mb-8" data-print-section>
          <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="font-semibold">Responses Over Time</h2>
              {accel.trend !== "insufficient" && (
                <span className={cn("text-xs font-medium",
                  accel.trend === "accelerating" ? "text-emerald-500" : accel.trend === "decelerating" ? "text-destructive" : "text-muted-foreground"
                )}>
                  {accel.trend === "accelerating" ? "↗ Accelerating" : accel.trend === "decelerating" ? "↘ Decelerating" : "→ Stable"}
                </span>
              )}
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <ComposedChart data={cumulativeData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 10 }} allowDecimals={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {spikes.map(s => (
                  <ReferenceLine key={s.date} yAxisId="left" x={s.date}
                    stroke="#f59e0b" strokeDasharray="4 4"
                    label={{ value: `↑${s.count}`, position: "top", fontSize: 9, fill: "#f59e0b" }} />
                ))}
                <Bar yAxisId="left" dataKey="daily" name="Daily" fill="hsl(var(--primary))" opacity={0.7} radius={[3, 3, 0, 0]} />
                <Area yAxisId="right" dataKey="cumulative" name="Cumulative" type="monotone"
                  stroke="#6366f1" fill="#6366f1" fillOpacity={0.12} strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
            <h2 className="font-semibold mb-4">Activity by Day of Week</h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={dayOfWeek}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" name="Responses" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* Completion time histogram + Scale Radar side by side */}
      {(data.completion_time_buckets.length > 0 || data.question_breakdowns.some(q => q.question_type === "linear-scale" && q.mean != null)) && (
        <div className="grid md:grid-cols-2 gap-6 mb-8" data-print-section>
          {data.completion_time_buckets.length > 1 && (
            <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />Completion Time Distribution
              </h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={data.completion_time_buckets as Array<{ label: string; count: number }>}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" name="Responses" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}
          <div className={data.completion_time_buckets.length > 1 ? "" : "md:col-span-2"}>
            <LinearScaleRadar breakdowns={data.question_breakdowns} />
          </div>
        </div>
      )}

      {/* Drop-off funnel */}
      <DropoffFunnel breakdowns={data.question_breakdowns} />

      {/* Correlation matrix */}
      <CorrelationMatrix correlations={data.correlations} breakdowns={data.question_breakdowns} />

      {/* Question section controls */}
      <div className="mb-4" data-print-hide>
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span className="text-sm font-medium text-muted-foreground">Sort:</span>
          <div className="flex rounded-lg border border-border overflow-hidden text-xs">
            {([["order", "Original"], ["most-answers", "Most Answers"], ["completion-asc", "Lowest Completion"], ["completion-desc", "Highest Completion"]] as const).map(([v, l]) => (
              <button key={v} onClick={() => setQuestionSort(v)}
                className={cn("px-3 py-1.5 transition-colors", questionSort === v ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>
                {l}
              </button>
            ))}
          </div>
        </div>
        {availableTypes.length > 1 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Type:</span>
            <div className="flex rounded-lg border border-border overflow-hidden text-xs">
              {["all", ...availableTypes].map(type => (
                <button key={type} onClick={() => setQuestionTypeFilter(type)}
                  className={cn("px-3 py-1.5 transition-colors capitalize", questionTypeFilter === type ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>
                  {type === "all" ? "All" : type.replace(/-/g, " ")}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Featured question */}
      {featuredQuestion && (
        <div className="mb-4 rounded-xl border-2 border-primary/30 bg-primary/5 p-1" data-print-section>
          <div className="flex items-center gap-2 px-4 pt-3 pb-1 text-xs text-primary font-medium">
            <Sparkles className="h-3.5 w-3.5" /> Most Interesting Question
          </div>
          <Card className="p-6 border-0 bg-transparent shadow-none">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs">{QUESTION_TYPE_LABELS[featuredQuestion.question_type] ?? featuredQuestion.question_type}</Badge>
              {featuredQuestion.question_completion_rate != null && (
                <div className="ml-auto flex items-center gap-1.5">
                  <Progress value={featuredQuestion.question_completion_rate * 100} className="h-1.5 w-16" />
                  <span className="text-xs text-muted-foreground">{Math.round(featuredQuestion.question_completion_rate * 100)}%</span>
                </div>
              )}
            </div>
            <h3 className="font-medium text-base mb-1">{featuredQuestion.question_text}</h3>
            <p className="text-xs text-muted-foreground mb-4">{featuredQuestion.total_answers} response{featuredQuestion.total_answers !== 1 ? "s" : ""}</p>
            <QuestionVisualization q={featuredQuestion} distSort={distSort} activeProfession={activeProfession} />
          </Card>
        </div>
      )}

      {/* Per-question breakdowns */}
      <div className="space-y-6 mb-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Questions</h2>
          <div className="flex rounded-lg border border-border overflow-hidden text-xs" data-print-hide>
            {(["count", "alpha"] as const).map(s => (
              <button key={s} onClick={() => setDistSort(s)}
                className={cn("px-3 py-1.5 transition-colors", distSort === s ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>
                {s === "count" ? "By Count" : "A–Z"}
              </button>
            ))}
          </div>
        </div>
        {sortedFilteredQuestions.map((q, i) => {
          const difficulty = calcDifficultyIndex(q);
          const pol = q.distribution && q.total_answers >= 10 ? detectPolarization(q.distribution) : null;
          const outliers = q.question_type === "linear-scale" && q.distribution ? detectOutliers(q.distribution) : null;
          const distShape = q.question_type === "linear-scale" && q.distribution ? classifyDistribution(q.distribution) : "";
          return (
            <Card key={q.question_id} className="p-6 border-border/50 bg-card/50 backdrop-blur-sm" data-print-section>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-sm font-medium text-muted-foreground">Q{i + 1}</span>
                <Badge variant="outline" className="text-xs">{QUESTION_TYPE_LABELS[q.question_type] ?? q.question_type}</Badge>
                {difficulty && (
                  <Badge variant="outline" className={cn("text-xs",
                    difficulty === "Easy" ? "text-emerald-500 border-emerald-500/30"
                    : difficulty === "Hard" ? "text-destructive border-destructive/30"
                    : "text-amber-500 border-amber-500/30"
                  )}>{difficulty}</Badge>
                )}
                {q.question_completion_rate != null && (
                  <div className="ml-auto flex items-center gap-1.5">
                    <Progress value={q.question_completion_rate * 100} className="h-1.5 w-16" />
                    <span className="text-xs text-muted-foreground tabular-nums">{Math.round(q.question_completion_rate * 100)}%</span>
                  </div>
                )}
              </div>
              <h3 className="font-medium text-base mb-1">{q.question_text}</h3>
              <p className="text-xs text-muted-foreground mb-4">{q.total_answers} response{q.total_answers !== 1 ? "s" : ""}</p>

              <QuestionVisualization q={q} distSort={distSort} activeProfession={activeProfession} />

              {/* Scale extras */}
              {q.mean !== null && (
                <div className="mt-3 flex gap-4 text-sm text-muted-foreground">
                  <span>Mean: <span className="font-semibold text-foreground">{q.mean}</span></span>
                  {q.median !== null && <span>Median: <span className="font-semibold text-foreground">{q.median}</span></span>}
                </div>
              )}
              {distShape && <p className="text-xs text-muted-foreground italic mt-1">{distShape}</p>}
              {outliers && outliers.count > 0 && (
                <p className="text-xs text-amber-500 mt-1 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {outliers.count} outlier{outliers.count !== 1 ? "s" : ""} detected (values: {outliers.values.join(", ")})
                </p>
              )}

              {/* Polarization warning */}
              {pol && (
                <div className="mt-2 text-xs text-amber-600 flex items-center gap-1.5 rounded-md border border-amber-500/20 bg-amber-500/5 px-3 py-2">
                  <Zap className="h-3.5 w-3.5 shrink-0" />
                  Polarized: "{pol.optionA}" ({pol.pctA}%) vs "{pol.optionB}" ({pol.pctB}%)
                </div>
              )}

              {/* Sentiment (text questions) */}
              {q.sentiment && <SentimentBar sentiment={q.sentiment} />}

              {/* Cross-profession breakdown (choice questions) */}
              {q.profession_distribution && Object.keys(q.profession_distribution).length > 1 && (
                <details className="mt-4" data-print-hide>
                  <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground select-none">
                    View by profession
                  </summary>
                  <ProfessionBreakdownChart distribution={q.profession_distribution} />
                </details>
              )}

              {/* Completion-time vs pattern (choice questions) */}
              {q.completion_time_distribution && Object.keys(q.completion_time_distribution).length > 1 && (
                <details className="mt-2" data-print-hide>
                  <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground select-none">
                    View by completion speed
                  </summary>
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    {(["fast", "medium", "slow"] as const).filter(b => q.completion_time_distribution![b]).map(bucket => (
                      <div key={bucket}>
                        <p className="text-xs font-medium capitalize mb-1">{bucket}</p>
                        <div className="space-y-1">
                          {Object.entries(q.completion_time_distribution![bucket])
                            .sort(([, a], [, b]) => b - a).slice(0, 4)
                            .map(([opt, cnt]) => (
                              <div key={opt} className="flex justify-between text-xs text-muted-foreground">
                                <span className="truncate">{opt.slice(0, 16)}</span>
                                <span>{cnt}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </Card>
          );
        })}
      </div>

      {/* Demographics */}
      {(professionData.length > 0 || categoryData.length > 0) && (
        <div className="mb-8" data-print-section>
          <h2 className="text-xl font-semibold mb-4">Respondent Demographics</h2>

          {demographicWarning && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-amber-600">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              {demographicWarning}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {professionData.length > 0 && (
              <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
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
              <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
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
            {institutionData.length > 0 && (
              <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
                <h3 className="font-semibold mb-4 text-sm">By Institution</h3>
                <ResponsiveContainer width="100%" height={Math.max(160, institutionData.length * 40)}>
                  <BarChart data={institutionData} layout="vertical" margin={{ left: 8, right: 24 }}>
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={130} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            )}
            {subCatData.length > 0 && (
              <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
                <h3 className="font-semibold mb-4 text-sm">By Sub-Category</h3>
                <ResponsiveContainer width="100%" height={Math.max(160, subCatData.length * 40)}>
                  <BarChart data={subCatData} layout="vertical" margin={{ left: 8, right: 24 }}>
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={130} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            )}
          </div>

          {/* Profession × Category cross chart */}
          {data.cross_demographics.length >= 4 && (
            <div className="mt-6">
              <CrossSegmentChart crosses={data.cross_demographics} />
            </div>
          )}
        </div>
      )}

      {/* Auto Research Summary */}
      <AutoResearchSummary data={data} />

      {/* Recommendations */}
      <RecommendationsPanel data={data} />
    </AppShell>
  );
};

export default SurveyAnalytics;
