import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getCourses } from "@/actions/courses";
import { AppShell } from "@/components/layout/app-shell";
import { StudyPlannerClient } from "@/components/timetable/study-planner-client";

export default async function StudyTimetablePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const courses = await getCourses();

  return (
    <AppShell userName={session.user?.name}>
      <div className="p-6">
        <StudyPlannerClient courses={courses} />
      </div>
    </AppShell>
  );
}
