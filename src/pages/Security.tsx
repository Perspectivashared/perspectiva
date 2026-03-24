import { StaticPage } from "@/pages/StaticPage";

const Security = () => (
  <StaticPage
    title="Security"
    description="Find out how we keep your data safe and secure."
  >
    <h2>Data Protection</h2>
    <p>
      We use best-practice security measures to protect your information. All
      data is encrypted in transit and stored using industry-standard
      safeguards.
    </p>
    <h2>Account Security</h2>
    <p>
      Keep your account secure by choosing a strong password, enabling
      two-factor authentication where available, and avoiding sharing
      credentials.
    </p>
    <h2>Reporting Issues</h2>
    <p>
      If you believe there is a security issue, please contact our team
      immediately at{" "}
      <a className="text-primary" href="mailto:security@perspectiva.com">
        security@perspectiva.com
      </a>
      .
    </p>
  </StaticPage>
);

export default Security;
