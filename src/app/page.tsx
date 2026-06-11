import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Compare } from "@/components/landing/compare";
import { HowItWorks } from "@/components/landing/how-it-works";
import { TransformScroll } from "@/components/landing/transform-scroll";
import { Examples } from "@/components/landing/examples";
import { Results } from "@/components/landing/results";
import { Pricing } from "@/components/landing/pricing";
import { FinalCta } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";

export default function HomePage() {
  return (
    <main className="relative w-full max-w-full overflow-x-clip">
      <Navbar />
      <Hero />
      <Compare />
      <HowItWorks />
      <TransformScroll />
      <Examples />
      <Results />
      <Pricing />
      <FinalCta />
      <Footer />
    </main>
  );
}
