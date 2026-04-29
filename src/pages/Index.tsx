import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Communities from "@/components/Communities";
import Footer from "@/components/Footer";
import { LANDING_SECTION_IDS } from "@/lib/routes";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <Hero />
        <div id={LANDING_SECTION_IDS.howItWorks}>
          <HowItWorks />
        </div>
        <div id={LANDING_SECTION_IDS.communities}>
          <Communities />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
