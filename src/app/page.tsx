import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Compare } from "@/components/landing/compare";
import { EngineViz } from "@/components/landing/engine-viz";
import { Templates } from "@/components/landing/templates";
import { Results } from "@/components/landing/results";
import { FinalCta } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";

export default function HomePage() {
  return (
    <main className="relative w-full max-w-full overflow-x-hidden">
      <Navbar />
      <Hero />
      <Compare />
      <EngineViz />
      <Templates />
      <Results />
      <FinalCta />
      <Footer />
    </main>
  );
}
