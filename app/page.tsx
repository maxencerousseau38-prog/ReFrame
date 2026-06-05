import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import DashboardPreview from "@/components/DashboardPreview";
import Features from "@/components/Features";
import Pricing from "@/components/Pricing";

export default function Home() {
  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <DashboardPreview />
      <Features />
      <Pricing />

      {/* Sections à venir : CRM Preview, Inventory, AI Assistant,
          Testimonials, FAQ, Footer. */}
    </main>
  );
}
