import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import DashboardPreview from "@/components/DashboardPreview";
import Pricing from "@/components/Pricing";

export default function Home() {
  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <DashboardPreview />
      <Pricing />

      {/* Sections à venir : Features, CRM Preview, Inventory, AI Assistant,
          Testimonials, FAQ, Footer. */}
    </main>
  );
}
