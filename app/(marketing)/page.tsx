import { Hero } from "@/components/marketing/hero";
import { TrustStrip } from "@/components/marketing/trust-strip";
import { BeforeAfterSection } from "@/components/marketing/before-after-section";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { FeaturesGrid } from "@/components/marketing/features-grid";
import { Testimonials } from "@/components/marketing/testimonials";
import { Faq } from "@/components/marketing/faq";
import { CtaSection } from "@/components/marketing/cta-section";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <BeforeAfterSection />
      <HowItWorks />
      <FeaturesGrid />
      <Testimonials />
      <Faq />
      <CtaSection />
    </>
  );
}
