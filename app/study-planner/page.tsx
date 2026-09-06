import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getCourses } from "@/actions/courses";
import { AppShell } from "@/components/layout/app-shell";
import { StudyPlannerClient } from "@/components/timetable/study-planner-client";
import Link from "next/link";
import { Building2 } from "lucide-react";

export default async function StudyTimetablePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const courses = await getCourses();

  return (
    <AppShell userName={session.user?.name}>
      <div className="p-6">
        <Link href="/college-timetable" className="mb-5 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-small font-medium text-primary hover:bg-primary/5 dark:border-slate-700">
          <Building2 className="h-4 w-4" /> College Timetable
        </Link>
        <StudyPlannerClient courses={courses} />
      </div>
    </AppShell>
  );
}
