import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Logos } from "@/components/landing/logos";
import { HowItWorks } from "@/components/landing/how-it-works";
import { BeforeAfter } from "@/components/landing/before-after";
import { Features } from "@/components/landing/features";
import { Pricing } from "@/components/landing/pricing";
import { Testimonials } from "@/components/landing/testimonials";
import { FinalCta } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";

export default function HomePage() {
  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <Logos />
      <HowItWorks />
      <BeforeAfter />
      <Features />
      <Pricing />
      <Testimonials />
      <FinalCta />
      <Footer />
    </main>
  );
}
