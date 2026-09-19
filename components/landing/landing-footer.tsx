import Link from "next/link";
import { Github, ExternalLink } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-t border-[#dbe7f7] bg-[#f8fbff]">
      <div className="mx-auto max-w-6xl px-6 py-14 sm:px-8">
        <div className="mb-10 grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <span className="font-semibold text-[#10234b]">AI Study Planner</span>
            <p className="mt-2 text-small leading-relaxed text-[#657493]">
              Plan smarter. Study better. Achieve more.
            </p>
          </div>

          <div>
            <p className="mb-3 text-small font-medium text-[#20365f]">Project</p>
            <ul className="space-y-2 text-small text-[#657493]">
              <li>
                <a
                  href="https://github.com/RaminSajjad/ai-university-planner"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 transition hover:text-[#1672f5]"
                >
                  <Github className="w-3.5 h-3.5" /> GitHub
                </a>
              </li>
              <li>
                <a href="https://aiuniversity-planner.vercel.app/register" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 transition hover:text-[#1672f5]">
                  <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-small font-medium text-[#20365f]">Technologies</p>
            <ul className="space-y-2 text-small text-[#657493]">
              <li>Next.js 15 · React · TypeScript</li>
              <li>Tailwind CSS · Prisma · PostgreSQL</li>
              <li>Gemini AI · Groq fallback</li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-small font-medium text-[#20365f]">Contact</p>
            <ul className="space-y-2 text-small text-[#657493]">
              <li>
                <Link href="/login" className="transition hover:text-[#1672f5]">
                  Log in
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#dbe7f7] pt-8 text-center text-small text-[#7b8aa5]">
          © {new Date().getFullYear()} AI University Planner. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
