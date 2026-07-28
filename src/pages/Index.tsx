import { lazy, Suspense } from "react";
import Navigation from "@/components/Navigation";
import { JsonLd } from "@/shared/components/seo/JsonLd";
import Hero from "@/components/Hero";
import ProductShowcase from "@/components/ProductShowcase";
import CursorParticles from "@/components/CursorParticles";
import SurveyBuilderFeatures from "@/components/SurveyBuilderFeatures";
import PlatformDifferentiators from "@/components/PlatformDifferentiators";
import HowItWorks from "@/components/HowItWorks";
import UseCases from "@/components/UseCases";
import Communities from "@/components/Communities";
import Testimonials from "@/components/Testimonials";
import CtaBanner from "@/components/CtaBanner";
import Footer from "@/components/Footer";
import { LANDING_SECTION_IDS } from "@/lib/routes";

// Lazy: keep three/R3F off the initial bundle.
const PerspectiveScene = lazy(() => import("@/three/PerspectiveScene"));

const Index = () => {
  return (
    <>
      <JsonLd schema={{
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Perspectiva",
        "url": "https://perspectiva.vercel.app",
        "description": "Gamified survey exchange platform for students and researchers",
        "sameAs": [],
      }} />
      <JsonLd schema={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Perspectiva",
        "url": "https://perspectiva.vercel.app",
        "description": "Join Perspectiva, the gamified survey exchange platform for students and researchers.",
      }} />
    <div className="min-h-screen">
      {/* Persistent WebGL backdrop (or CSS/SVG poster) fixed behind everything. */}
      <Suspense fallback={null}>
        <PerspectiveScene />
      </Suspense>
      <CursorParticles />
      <Navigation />
      <main className="relative z-10">
        <Hero />
        {/* Transparent zone — canvas continues behind these glass sections. */}
        <ProductShowcase />
        <SurveyBuilderFeatures />
        {/* Below stays opaque over the canvas until P2c makes each section
            glass; the wrapper shrinks from the top as sections graduate. */}
        <div className="relative bg-background">
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
        </div>
      </main>
      <Footer />
    </div>
    </>
  );
};

export default Index;
