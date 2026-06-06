import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import SurveyBuilderFeatures from "@/components/SurveyBuilderFeatures";
import PlatformDifferentiators from "@/components/PlatformDifferentiators";
import HowItWorks from "@/components/HowItWorks";
import UseCases from "@/components/UseCases";
import Communities from "@/components/Communities";
import Testimonials from "@/components/Testimonials";
import CtaBanner from "@/components/CtaBanner";
import Footer from "@/components/Footer";
import { LANDING_SECTION_IDS } from "@/lib/routes";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <Hero />
        <SurveyBuilderFeatures />
        <PlatformDifferentiators />
        <div id={LANDING_SECTION_IDS.howItWorks}>
          <HowItWorks />
        </div>
        <UseCases />
        <div id={LANDING_SECTION_IDS.communities}>
          <Communities />
        </div>
        <Testimonials />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
