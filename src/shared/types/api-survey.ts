/** Survey summary returned by list endpoints (published, my-surveys, completed, etc.). */
export interface ApiSurveySummary {
  id: number;
  title: string;
  description: string;
  category: string | null;
  community_id: string | null;
  status: string;
  target_responses: number | null;
  deadline: string | null;
  scheduled_at: string | null;
  response_count: number;
  published_at: string | null;
  created_at: string;
}
