import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Brain,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FileText,
  GraduationCap,
  ListTodo,
  NotebookText,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { authOptions } from "@/lib/auth";
import { getDashboardData } from "@/actions/dashboard";
import { AppShell } from "@/components/layout/app-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { formatDate } from "@/lib/utils";

function getAcademicYearLabel(date: Date) {
  const year = date.getFullYear();
  return `${year}–${String(year + 1).slice(-2)}`;
}

function formatSemester(value?: string | null) {
  if (!value) return "Semester not set";
  if (value.toLowerCase().includes("semester")) return value;
  return `Semester ${value}`;
}

function formatTimeLabel(value: string | null | undefined) {
  if (!value) return "No time set";
  return value;
}

function getPriorityBadgeClasses(status: string) {
  switch (status) {
    case "High":
      return "bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-800";
    case "Medium":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-800";
    default:
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-800";
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  let dashboardData;
  try {
    dashboardData = await getDashboardData();
  } catch (error) {
    console.error("Dashboard data loading failed:", error);
    return (
      <AppShell userName={session.user?.name}>
        <div className="p-6">
          <div className="card mx-auto max-w-xl">
            <div className="flex items-center gap-3 text-primary">
              <CalendarClock className="h-5 w-5" />
              <p className="text-sm font-medium">Unable to load academic data.</p>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">Try again</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              The dashboard could not load the latest academic information.
            </p>
            <Link
              href="/dashboard"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90"
            >
              Retry
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const {
    user,
    stats,
    upcomingAssignments,
    upcomingExams,
    todayTimetable,
    studyMaterials,
    assignments,
    completedAssignments,
    pendingAssignments,
    overdueAssignments,
    placementJobs,
    placementProfile,
    aptitudeResults,
    roadmapTasks,
    thisWeekTimetable,
  } = dashboardData;

  const today = new Date();
  const priorities = [
    ...upcomingAssignments.slice(0, 2).map((assignment) => ({
      type: "Assignment",
      title: assignment.title,
      meta: `${assignment.course?.courseName ?? "Course"} • ${formatDate(assignment.deadline)}`,
      status: assignment.deadline.getTime() < today.getTime() ? "Overdue" : "Due soon",
      action: "/assignments",
      actionLabel: "Open",
      sortValue: assignment.deadline.getTime(),
    })),
    ...upcomingExams.slice(0, 2).map((exam) => ({
      type: "Exam",
      title: `${exam.course?.courseName ?? "Course"} ${exam.examType}`,
      meta: `${formatDate(exam.date)} • ${formatTimeLabel(exam.time)}`,
      status: `${Math.max(0, Math.ceil((new Date(exam.date).getTime() - today.getTime()) / 86400000))} day${Math.ceil((new Date(exam.date).getTime() - today.getTime()) / 86400000) === 1 ? "" : "s"} left`,
      action: "/exams",
      actionLabel: "View",
      sortValue: new Date(exam.date).getTime(),
    })),
    ...todayTimetable.slice(0, 2).map((session) => ({
      type: "Study Task",
      title: session.subjectName,
      meta: `${session.sessionType.replace(/_/g, " ")} • ${session.startTime} - ${session.endTime}`,
      status: session.status === "COMPLETED" ? "Completed" : session.status === "IN_PROGRESS" ? "In progress" : "Scheduled",
      action: "/study-planner",
      actionLabel: "Open",
      sortValue: session.date.getTime(),
    })),
  ].sort((a, b) => a.sortValue - b.sortValue).slice(0, 4);

  const courseCompletionRate = assignments.length > 0 ? Math.round((completedAssignments.length / assignments.length) * 100) : 0;
  const studyHoursThisWeek = thisWeekTimetable
    .filter((session) => !session.isBreak)
    .reduce((sum, session) => sum + Math.max(0, (Number(session.endTime.slice(0, 2)) * 60 + Number(session.endTime.slice(3, 5)) - (Number(session.startTime.slice(0, 2)) * 60 + Number(session.startTime.slice(3, 5)))) / 60), 0);

  const academicPerformanceMetrics = [
    { label: "Current CGPA", value: user?.cgpa ? user.cgpa.toFixed(2) : "Not set" },
    { label: "Assignment completion", value: assignments.length ? `${courseCompletionRate}%` : "No data" },
    { label: "Upcoming exams", value: upcomingExams.length ? `${upcomingExams.length}` : "No exams" },
    { label: "Course count", value: coursesCountText(stats.coursesCount) },
  ];

  const examOverview = upcomingExams.length
    ? upcomingExams.slice(0, 4).map((exam) => ({
      ...exam,
      daysRemaining: Math.max(0, Math.ceil((new Date(exam.date).getTime() - today.getTime()) / 86400000)),
    }))
    : [];

  const recentActivity = [
    ...completedAssignments.slice(0, 2).map((assignment) => ({
      title: `Assignment submitted: ${assignment.title}`,
      time: "Recently",
      url: "/assignments",
    })),
    ...studyMaterials.slice(0, 2).map((material) => ({
      title: `Course material viewed: ${material.materialName}`,
      time: material.updatedAt ? formatDate(material.updatedAt) : "Recently",
      url: "/study-material",
    })),
    ...(aptitudeResults[0]
      ? [{ title: `Aptitude test completed: ${aptitudeResults[0].score}%`, time: formatDate(aptitudeResults[0].takenAt), url: "/placement/aptitude" }]
      : []),
    ...(placementProfile?.updatedAt
      ? [{ title: "Resume updated", time: formatDate(placementProfile.updatedAt), url: "/placement/resume-builder" }]
      : []),
  ].slice(0, 4);

  const placementItems = [
    placementProfile
      ? { label: "Resume", value: placementProfile.resumeScore ? `${placementProfile.resumeScore}%` : "Updated", href: "/placement/resume-builder" }
      : null,
    placementProfile?.atsScore
      ? { label: "Resume Analysis", value: `${placementProfile.atsScore}% match`, href: "/placement/resume-analyzer" }
      : null,
    aptitudeResults[0]?.score
      ? { label: "Aptitude", value: `${aptitudeResults[0].score}%`, href: "/placement/aptitude" }
      : null,
    roadmapTasks.length
      ? { label: "Roadmap", value: `${roadmapTasks.filter((task) => task.status === "COMPLETED").length} / ${roadmapTasks.length} milestones`, href: "/placement/roadmap" }
      : null,
    placementJobs.length
      ? { label: "Job Opportunities", value: `${placementJobs.length} eligible`, href: "/placement/jobs" }
      : null,
  ].filter(Boolean) as Array<{ label: string; value: string; href: string }>;

  const quickActions = [
    { label: "Courses", href: "/courses", icon: BookOpen },
    { label: "Assignments", href: "/assignments", icon: ClipboardList },
    { label: "Study Planner", href: "/study-planner", icon: Brain },
    { label: "Study Material", href: "/study-material", icon: NotebookText },
    { label: "Job Portal", href: "/placement/jobs", icon: BriefcaseBusiness },
    { label: "Resume Builder", href: "/placement/resume-builder", icon: FileText },
    { label: "AI Copilot", href: "/ai-copilot", icon: Sparkles },
  ];

  return (
    <AppShell userName={session.user?.name}>
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <header className="card border border-slate-200 bg-white/90 dark:border-slate-700 dark:bg-slate-900/80">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                Student dashboard
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                Good morning, {session.user?.name?.split(" ")[0] || "Student"}
              </h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Here&apos;s your academic overview for today.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-800">
                {today.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
              </span>
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-800">
                {formatSemester(user?.semester)}
              </span>
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-800">
                Academic Year {getAcademicYearLabel(today)}
              </span>
            </div>
          </div>
        </header>

        <section aria-label="Academic KPI overview" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard icon={TrendingUp} label="CGPA" value={user?.cgpa ? user.cgpa.toFixed(2) : "Not set"} accent="success" />
          <StatCard icon={ClipboardList} label="Pending Assignments" value={stats.pendingAssignmentsCount || "No pending"} accent="warning" />
          <StatCard icon={CalendarClock} label="Upcoming Exams" value={stats.upcomingExamsCount || "No exams"} accent="primary" />
          <StatCard icon={Clock3} label="Study Hours" value={stats.studyHoursThisWeek ? `${stats.studyHoursThisWeek.toFixed(1)} hrs` : "No tracked hours"} accent="secondary" />
          <StatCard icon={BookOpen} label="Courses" value={stats.coursesCount || "No courses"} accent="primary" />
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
          <section className="card">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Focus</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">Today&apos;s Priorities</h2>
              </div>
              <Link href="/assignments" className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {priorities.length === 0 ? (
              <p className="text-sm text-slate-600 dark:text-slate-300">No priorities available right now.</p>
            ) : (
              <div className="space-y-3">
                {priorities.map((item) => (
                  <div key={`${item.type}-${item.title}-${item.meta}`} className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-800/60">
                    <div className="min-w-0">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                          {item.type}
                        </span>
                        <span className={getPriorityBadgeClasses(item.status === "Due soon" ? "High" : item.status === "Scheduled" ? "Medium" : item.status === "Completed" ? "Low" : "Medium")}>
                          {item.status}
                        </span>
                      </div>
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{item.title}</p>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{item.meta}</p>
                    </div>
                    <Link href={item.action} className="shrink-0 text-xs font-medium text-primary">
                      {item.actionLabel}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="card">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Schedule</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">Today&apos;s Schedule</h2>
              </div>
              <Link href="/study-planner" className="text-sm font-medium text-primary">
                View timetable
              </Link>
            </div>

            {todayTimetable.length === 0 ? (
              <p className="text-sm text-slate-600 dark:text-slate-300">No study sessions scheduled for today.</p>
            ) : (
              <div className="space-y-2">
                {todayTimetable.map((session) => (
                  <div key={session.id} className="grid grid-cols-[72px_1fr_auto] items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-300">{session.startTime}</span>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{session.subjectName}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{session.sessionType.replace(/_/g, " ")}</p>
                    </div>
                    <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                      {session.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_1fr]">
          <section className="card">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Performance</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">Academic Performance</h2>
              </div>
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {academicPerformanceMetrics.map((metric) => (
                <div key={metric.label} className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{metric.label}</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{metric.value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="card">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Assignments</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">Assignment Overview</h2>
              </div>
              <Target className="h-5 w-5 text-primary" />
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Total</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{assignments.length}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Completed</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{completedAssignments.length}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Pending</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{pendingAssignments.length}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Overdue</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{overdueAssignments.length}</p>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                  <span>Completion</span>
                  <span>{completedAssignments.length} / {assignments.length || 0}</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    className="h-2.5 rounded-full bg-primary"
                    style={{ width: `${assignments.length ? courseCompletionRate : 0}%` }}
                  />
                </div>
              </div>

              <Link href="/assignments" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                View Assignments
              </Link>
            </div>
          </section>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_1fr]">
          <section className="card">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Exams</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">Upcoming Exams</h2>
              </div>
              <CalendarClock className="h-5 w-5 text-primary" />
            </div>

            {examOverview.length === 0 ? (
              <p className="text-sm text-slate-600 dark:text-slate-300">No upcoming exams.</p>
            ) : (
              <div className="space-y-3">
                {examOverview.map((exam) => (
                  <div key={exam.id} className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{exam.course?.courseName ?? "Course"}</p>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{exam.examType}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{formatDate(exam.date)}</p>
                      <p className="mt-1 text-xs text-primary">{exam.daysRemaining} day{exam.daysRemaining === 1 ? "" : "s"} remaining</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="card">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Progress</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">Study Progress</h2>
              </div>
              <ListTodo className="h-5 w-5 text-primary" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
                <p className="text-xs uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Weekly study hours</p>
                <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{stats.studyHoursThisWeek ? `${stats.studyHoursThisWeek.toFixed(1)} hrs` : "No tracked hours"}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
                <p className="text-xs uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Study sessions</p>
                <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{thisWeekTimetable.filter((session) => !session.isBreak).length} sessions</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
                <p className="text-xs uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Completed tasks</p>
                <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{completedAssignments.length} tasks</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
                <p className="text-xs uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Study goal</p>
                <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{stats.activeGoalHours ? `${stats.activeGoalHours} hrs` : "Not set"}</p>
              </div>
            </div>
          </section>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_1fr]">
          <section className="card">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Placement</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">Placement Snapshot</h2>
              </div>
              <BriefcaseBusiness className="h-5 w-5 text-primary" />
            </div>

            {placementItems.length === 0 ? (
              <p className="text-sm text-slate-600 dark:text-slate-300">Complete your placement profile to see your readiness.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {placementItems.map((item) => (
                  <Link key={item.label} href={item.href} className="rounded-xl border border-slate-200 bg-slate-50 p-3 transition hover:border-primary/40 hover:bg-primary/5 dark:border-slate-700 dark:bg-slate-800/60">
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{item.label}</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{item.value}</p>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="card">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Latest</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">Recent Activity</h2>
              </div>
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>

            {recentActivity.length === 0 ? (
              <p className="text-sm text-slate-600 dark:text-slate-300">No recent activity.</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={`${activity.title}-${index}`} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
                    <div className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{activity.title}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <section className="card">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Quick access</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">Quick Actions</h2>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            {quickActions.map(({ label, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-700 transition hover:border-primary/40 hover:bg-primary/5 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200"
              >
                <Icon className="h-4 w-4 text-primary" />
                {label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function coursesCountText(count: number) {
  if (!count) return "No courses";
  return `${count}`;
}
