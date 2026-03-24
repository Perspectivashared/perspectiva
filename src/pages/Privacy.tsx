import { StaticPage } from "@/pages/StaticPage";

const Privacy = () => (
  <StaticPage
    title="Privacy Policy"
    description="Learn how we collect, use, and protect your personal information."
  >
    <p>
      We are committed to protecting your privacy. This page outlines how we
      collect, use, and safeguard your personal information when you use
      Perspectiva.
    </p>
    <h2>Information We Collect</h2>
    <p>
      When you use our services, we may collect information such as your name,
      email address, usage data, and survey responses. We only collect what is
      necessary to provide and improve our platform.
    </p>
    <h2>How We Use Your Data</h2>
    <p>
      We use your data to personalize your experience, provide analytics, and
      improve our product. We never sell your data to third parties.
    </p>
    <h2>Security</h2>
    <p>
      We take reasonable steps to protect your information, but no system can be
      completely secure. Please use a strong password and avoid sharing your
      account details.
    </p>
  </StaticPage>
);

export default Privacy;
