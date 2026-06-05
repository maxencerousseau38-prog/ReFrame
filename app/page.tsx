import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TrustBar from "@/components/TrustBar";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import DashboardPreview from "@/components/DashboardPreview";
import CRMPreview from "@/components/CRMPreview";
import Inventory from "@/components/Inventory";
import AIAssistant from "@/components/AIAssistant";
import Testimonials from "@/components/Testimonials";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <TrustBar />
      <HowItWorks />
      <Features />
      <DashboardPreview />
      <CRMPreview />
      <Inventory />
      <AIAssistant />
      <Testimonials />
      <Pricing />
      <FAQ />
      <Footer />
    </main>
  );
}
