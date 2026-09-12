import Link from "next/link";

import { HeroSection } from "@/components/landing/hero-section";
import { StatsSection } from "@/components/landing/stats-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { DocumentWorkspaceSection } from "@/components/landing/document-workspace-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { AIPlanPreviewSection } from "@/components/landing/ai-plan-preview-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { FAQSection } from "@/components/landing/faq-section";
import { LandingFooter } from "@/components/landing/landing-footer";

export default function PlacementPage() {
  return (
    <main>
      <HeroSection />

      <StatsSection />

      {/* Placement Tools */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Placement Preparation
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              Prepare Smarter for Your Placement
            </h2>

            <p className="mt-2 max-w-2xl text-muted-foreground">
              Practice coding, improve your problem-solving skills and get
              placement-ready with powerful preparation tools.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Coding Practice Lab */}
            <Link
              href="/placement/coding-practice"
              className="group rounded-2xl border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-3xl transition-transform duration-300 group-hover:scale-110">
                💻
              </div>

              <h3 className="text-xl font-bold">
                Coding Practice Lab
              </h3>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Solve coding problems, write and run code, practice multiple
                programming languages and improve your coding skills.
              </p>

              <div className="mt-5 flex items-center text-sm font-semibold text-primary">
                Start Coding Practice
                <span className="ml-2 transition-transform group-hover:translate-x-1">
                  →
                </span>
              </div>
            </Link>

            {/* Aptitude */}
            <Link
              href="/placement/aptitude"
              className="group rounded-2xl border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-3xl transition-transform duration-300 group-hover:scale-110">
                🧠
              </div>

              <h3 className="text-xl font-bold">
                Aptitude Practice
              </h3>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Practice quantitative aptitude, logical reasoning and
                placement-focused questions.
              </p>

              <div className="mt-5 flex items-center text-sm font-semibold text-primary">
                Start Aptitude
                <span className="ml-2 transition-transform group-hover:translate-x-1">
                  →
                </span>
              </div>
            </Link>

            {/* Jobs */}
            <Link
              href="/placement/jobs"
              className="group rounded-2xl border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-3xl transition-transform duration-300 group-hover:scale-110">
                💼
              </div>

              <h3 className="text-xl font-bold">
                Jobs & Opportunities
              </h3>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Explore placement opportunities, jobs and career options
                available for students.
              </p>

              <div className="mt-5 flex items-center text-sm font-semibold text-primary">
                Explore Jobs
                <span className="ml-2 transition-transform group-hover:translate-x-1">
                  →
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

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