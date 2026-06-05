import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import DashboardPreview from "@/components/DashboardPreview";

export default function Home() {
  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <DashboardPreview />

      {/* Sections à venir (Tier A → C) : Features, CRM Preview, Inventory,
          AI Assistant, Testimonials, Pricing, FAQ, Footer. */}
      <div className="px-6 py-24 text-center text-sm text-muted">
        Benchmark Tier S — les sections suivantes arrivent après validation.
      </div>
    </main>
  );
}
