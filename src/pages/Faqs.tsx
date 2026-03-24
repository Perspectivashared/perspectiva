import { StaticPage } from "@/pages/StaticPage";

const Faqs = () => (
  <StaticPage
    title="Frequently Asked Questions"
    description="Answers to common questions about using Perspectiva."
  >
    <h2>How do I create a survey?</h2>
    <p>
      You can create a new survey from the "Create Survey" page. Add your
      questions, set a target response count, and publish when you're ready.
    </p>
    <h2>Can I save a survey draft and come back later?</h2>
    <p>
      Yes! Drafts are automatically stored locally. Visit the "Drafts" page to
      continue editing an incomplete survey.
    </p>
    <h2>How do I view survey results?</h2>
    <p>
      Once your survey is published and receives responses, you can view the
      analytics dashboard from your profile or the survey results page.
    </p>
  </StaticPage>
);

export default Faqs;
