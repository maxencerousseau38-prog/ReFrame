import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Transformation } from "@/components/landing/transformation";
import { HowItWorks } from "@/components/landing/how-it-works";
import { TransformScroll } from "@/components/landing/transform-scroll";
import { Examples } from "@/components/landing/examples";
import { Trust } from "@/components/landing/trust";
import { Pricing } from "@/components/landing/pricing";
import { FAQ } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";

export default function HomePage() {
  return (
    <main className="relative w-full max-w-full overflow-x-clip">
      <Navbar />
      <Hero />
      <Transformation />
      <HowItWorks />
      <TransformScroll />
      <Examples />
      <Trust />
      <Pricing />
      <FAQ />
      <FinalCta />
      <Footer />
    </main>
  );
}
