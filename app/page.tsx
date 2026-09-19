import { HeroSection } from "@/components/landing/hero-section";
import { StatsSection } from "@/components/landing/stats-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { AIPlanPreviewSection } from "@/components/landing/ai-plan-preview-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { FAQSection } from "@/components/landing/faq-section";
import { LandingFooter } from "@/components/landing/landing-footer";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-[#10234b]">
      <HeroSection />

      <StatsSection />

      <FeaturesSection />

      <HowItWorksSection />

      <AIPlanPreviewSection />

      <TestimonialsSection />

      <FAQSection />

      <LandingFooter />
    </main>
  );
}