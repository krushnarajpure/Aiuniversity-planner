import { HeroSection } from "@/components/landing/hero-section";
import { StatsSection } from "@/components/landing/stats-section";
import { WorkspacePreviewSection } from "@/components/landing/workspace-preview-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { DocumentWorkspaceSection } from "@/components/landing/document-workspace-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { AIPlanPreviewSection } from "@/components/landing/ai-plan-preview-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { FAQSection } from "@/components/landing/faq-section";
import { LandingFooter } from "@/components/landing/landing-footer";

export default function LandingPage() {
  return (
    <main>
      <HeroSection />
      <StatsSection />
      <WorkspacePreviewSection />
      <FeaturesSection />
      <DocumentWorkspaceSection />
      <HowItWorksSection />
      <AIPlanPreviewSection />
      <TestimonialsSection />
      <FAQSection />
      <LandingFooter />
    </main>
  );
}
