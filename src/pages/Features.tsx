import { StaticPage } from "@/pages/StaticPage";

const Features = () => (
  <StaticPage
    title="Features"
    description="Explore the tools and capabilities available in Perspectiva."
  >
    <h2>Survey Builder</h2>
    <p>
      Create surveys with an intuitive builder that supports multiple question
      types, response goals, deadlines, and draft saving.
    </p>
    <h2>Progress & Drafts</h2>
    <p>
      Save and resume surveys anytime. Drafts are stored locally so you can pick
      up where you left off.
    </p>
    <h2>Results & Analytics</h2>
    <p>
      View detailed analytics for each survey, including response distributions,
      completion rates, and engagement trends.
    </p>
    <h2>Community Sharing</h2>
    <p>
      Share surveys with communities, collaborate with peers, and discover
      datasets collected by other members.
    </p>
  </StaticPage>
);

export default Features;
