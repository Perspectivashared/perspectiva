/** Community summary returned by list endpoints (/communities, /users/me/favourite-communities, etc.). */
export interface ApiCommunitySummary {
  id: string;
  name: string;
  description: string;
  category: string;
  icon_name: string;
  member_count: number;
  survey_count: number;
  active_survey_count: number;
}
