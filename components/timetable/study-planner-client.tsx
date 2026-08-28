"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Plus,
  Filter,
  Search,
  Calendar,
  Clock,
  ChevronDown,
  Trash2,
  Edit2,
  AlertCircle,
  TrendingUp,
  Zap,
  Brain,
  Download,
  Printer,
  Target,
} from "lucide-react";
import type { Timetable } from "@prisma/client";
import { format, startOfWeek } from "date-fns";
import { TimetableSessionModal } from "./timetable-session-modal";
import { DailyTimeline } from "./daily-timeline";
import { StudyStatistics } from "./study-statistics";
import { WeeklyOverview } from "./weekly-overview";
import { GoalsAndInsights } from "./goals-and-insights";
import {
  getTodaySchedule,
  getTodaysSummary,
  getWeeklyStats,
  getProgressTowardGoal,
  getStudyStreak,
  getUpcomingSessions,
  getMissedSessions,
  getSubjectProgress,
  markSessionComplete,
} from "@/actions/timetable-enhanced";
import {
  getTimetables,
  deleteTimetable,
} from "@/actions/timetable";

type ViewType = "today" | "week" | "all";
type FilterType = "all" | "pending" | "in-progress" | "completed" | "missed";

interface FilterState {
  view: ViewType;
  status: FilterType;
  subject: string;
  sessionType: string;
  searchQuery: string;
}

export function StudyPlannerClient({ courses }: { courses: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Timetable | null>(null);
  const [allSessions, setAllSessions] = useState<Timetable[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<Timetable[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<Timetable[]>([]);
  const [missedSessions, setMissedSessions] = useState<Timetable[]>([]);
  const [todaysSummary, setTodaysSummary] = useState<any>(null);
  const [weeklyStats, setWeeklyStats] = useState<any>(null);
  const [goalProgress, setGoalProgress] = useState<any>(null);
  const [streak, setStreak] = useState(0);
  const [subjectProgress, setSubjectProgress] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    view: "all",
    status: "all",
    subject: "all",
    sessionType: "all",
    searchQuery: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showCommandOptions, setShowCommandOptions] = useState(false);

  // Load data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [
        sessions,
        today,
        upcoming,
        missed,
        todaySum,
        weekStats,
        goalProg,
        studyStreak,
        subjProg,
      ] = await Promise.all([
        getTimetables(),
        getTodaySchedule(),
        getUpcomingSessions(),
        getMissedSessions(),
        getTodaysSummary(),
        getWeeklyStats(),
        getProgressTowardGoal("DAILY"),
        getStudyStreak(),
        getSubjectProgress(),
      ]);

      setAllSessions(sessions);
      setTodaySchedule(today);
      setUpcomingSessions(upcoming);
      setMissedSessions(missed);
      setTodaysSummary(todaySum);
      setWeeklyStats(weekStats);
      setGoalProgress(goalProg);
      setStreak(studyStreak);
      setSubjectProgress(subjProg);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load study data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Get unique subjects and session types
  const subjects = useMemo(() => {
    const set = new Set(allSessions.map((s) => s.subjectName));
    return Array.from(set).sort();
  }, [allSessions]);

  const sessionTypes = useMemo(() => {
    const set = new Set(allSessions.map((s) => s.sessionType));
    return Array.from(set).sort();
  }, [allSessions]);

  // Filter sessions
  const filteredSessions = useMemo(() => {
    let sessions = allSessions;

    if (filters.view === "today") {
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);
      sessions = sessions.filter(
        (s) => s.date >= startOfDay && s.date <= endOfDay
      );
    }

    if (filters.view === "week") {
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      sessions = sessions.filter(
        (s) => s.date >= weekStart && s.date <= weekEnd
      );
    }

    // Apply status filter
    if (filters.status !== "all") {
      sessions = sessions.filter((s) => s.status.toLowerCase() === filters.status);
    }

    // Apply subject filter
    if (filters.subject !== "all") {
      sessions = sessions.filter((s) => s.subjectName === filters.subject);
    }

    // Apply session type filter
    if (filters.sessionType !== "all") {
      sessions = sessions.filter((s) => s.sessionType === filters.sessionType);
    }

    // Apply search
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      sessions = sessions.filter(
        (s) =>
          s.subjectName.toLowerCase().includes(query) ||
          s.notes?.toLowerCase().includes(query) ||
          s.pendingWork?.toLowerCase().includes(query)
      );
    }

    // Sort by date and time
    return sessions.sort((a, b) => {
      if (a.date.getTime() !== b.date.getTime()) {
        return a.date.getTime() - b.date.getTime();
      }
      return a.startTime.localeCompare(b.startTime);
    });
  }, [allSessions, filters]);

  // Handle session operations
  const handleAddSession = () => {
    setSelectedSession(null);
    setIsModalOpen(true);
  };

  const handleEditSession = (session: Timetable) => {
    setSelectedSession(session);
    setIsModalOpen(true);
  };

  const handleDeleteSession = async (session: Timetable) => {
    if (!confirm(`Delete "${session.subjectName}" session?`)) return;
    try {
      await deleteTimetable(session.id);
      toast.success("Session deleted");
      loadData();
    } catch (error) {
      toast.error("Failed to delete session");
    }
  };

  const handleMarkComplete = async (session: Timetable) => {
    try {
      await markSessionComplete(session.id, true);
      toast.success("Session marked as completed");
      loadData();
    } catch (error) {
      toast.error("Failed to update session");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSession(null);
  };

  const handleModalSuccess = () => {
    loadData();
    handleCloseModal();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading your study schedule...</p>
        </div>
      </div>
    );
  }

  const completedCount = allSessions.filter((session) => session.status === "COMPLETED").length;
  const completionRate = allSessions.length > 0 ? Math.round((completedCount / allSessions.length) * 100) : 0;
  const totalHours = weeklyStats?.totalStudyHours ?? 0;
  const nextSession = upcomingSessions[0];

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="mb-2 flex items-center gap-2 text-small font-medium uppercase tracking-wide text-primary"><Brain className="h-4 w-4" /> Study Command Center</p>
          <h1 className="text-subheading font-semibold">Study Timetable</h1>
          <p className="mt-1 text-small text-slate-600 dark:text-slate-400">Plan, organize, optimize and track your academic schedule.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/planner" className="flex items-center gap-2 rounded-lg border border-primary px-3 py-2 text-small font-medium text-primary hover:bg-primary/5"><Brain className="h-4 w-4" /> AI Schedule Generator</Link>
          <button onClick={handleAddSession} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-small font-medium text-primary-foreground hover:bg-primary/90"><Plus className="h-4 w-4" /> New Session</button>
        </div>
      </div>

      <div className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900 sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setFilters((prev) => ({ ...prev, view: "today" }))} className={`rounded-lg px-3 py-2 text-small font-medium ${filters.view === "today" ? "bg-primary text-primary-foreground" : "bg-slate-100 dark:bg-slate-700"}`}>Today</button>
          <button type="button" onClick={() => setFilters((prev) => ({ ...prev, view: "week" }))} className={`rounded-lg px-3 py-2 text-small font-medium ${filters.view === "week" ? "bg-primary text-primary-foreground" : "bg-slate-100 dark:bg-slate-700"}`}>This week</button>
          <button type="button" onClick={() => setFilters((prev) => ({ ...prev, view: "all" }))} className={`rounded-lg px-3 py-2 text-small font-medium ${filters.view === "all" ? "bg-primary text-primary-foreground" : "bg-slate-100 dark:bg-slate-700"}`}>All sessions</button>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setShowFilters((value) => !value)} className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-small dark:border-slate-600"><Filter className="h-4 w-4" /> Filters</button>
          <button type="button" onClick={() => window.print()} className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-small dark:border-slate-600"><Printer className="h-4 w-4" /> Print</button>
          <button type="button" onClick={() => setShowCommandOptions((value) => !value)} className="rounded-lg border border-slate-300 px-3 py-2 text-small dark:border-slate-600">More</button>
        </div>
      </div>
      {showCommandOptions && <div className="flex flex-wrap gap-3 rounded-lg bg-primary/5 p-3 text-small dark:bg-primary/10"><button type="button" onClick={() => window.print()} className="flex items-center gap-2 text-primary"><Download className="h-4 w-4" /> Export / print timetable</button><Link href="/exams" className="text-primary">Open exam preparation</Link><Link href="/assignments" className="text-primary">Review assignments</Link></div>}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="card"><p className="text-small text-slate-500 dark:text-slate-400">Today&apos;s hours</p><p className="mt-1 text-2xl font-semibold">{todaysSummary?.plannedHours?.toFixed(1) ?? "0.0"}<span className="ml-1 text-small font-normal text-slate-500">hrs</span></p><p className="mt-1 text-xs text-slate-400">{todaysSummary?.completedHours?.toFixed(1) ?? "0.0"} completed</p></div>
        <div className="card"><p className="text-small text-slate-500 dark:text-slate-400">Weekly study</p><p className="mt-1 text-2xl font-semibold">{totalHours.toFixed(1)}<span className="ml-1 text-small font-normal text-slate-500">hrs</span></p><p className="mt-1 text-xs text-slate-400">Across saved sessions</p></div>
        <div className="card"><p className="text-small text-slate-500 dark:text-slate-400">Completion rate</p><p className="mt-1 text-2xl font-semibold text-success">{completionRate}%</p><div className="mt-2 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700"><div className="h-1.5 rounded-full bg-success" style={{ width: `${completionRate}%` }} /></div></div>
        <div className="card"><p className="text-small text-slate-500 dark:text-slate-400">Study streak</p><p className="mt-1 text-2xl font-semibold text-primary">{streak}<span className="ml-1 text-small font-normal text-slate-500">days</span></p><p className="mt-1 text-xs text-slate-400">Keep your momentum</p></div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="card border-l-4 border-l-primary bg-primary/5 dark:bg-primary/10"><div className="flex items-start justify-between gap-3"><div><p className="text-small text-slate-600 dark:text-slate-400">Next study session</p><h2 className="mt-1 text-card-title font-semibold">{nextSession?.subjectName || "No upcoming session"}</h2></div><Clock className="h-5 w-5 text-primary" /></div>{nextSession ? <div className="mt-3 flex flex-wrap gap-4 text-small"><span className="font-medium text-primary">{nextSession.startTime} - {nextSession.endTime}</span><span className="text-slate-500">{nextSession.sessionType.replace(/_/g, " ")}</span><span className="text-slate-500">{nextSession.priority.toLowerCase()} priority</span></div> : <p className="mt-3 text-small text-slate-500">Add a session or generate a plan to see what comes next.</p>}<div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={handleAddSession} className="rounded-lg bg-primary px-3 py-2 text-small font-medium text-primary-foreground">Schedule session</button><Link href="/planner" className="rounded-lg border border-primary px-3 py-2 text-small font-medium text-primary">Plan my week</Link></div></div>
        <div className="card"><div className="flex items-center justify-between"><h2 className="text-card-title font-semibold">Today&apos;s target</h2><Target className="h-5 w-5 text-primary" /></div><p className="mt-3 text-small text-slate-500 dark:text-slate-400">{todaysSummary?.completedHours?.toFixed(1) ?? "0.0"} of {todaysSummary?.plannedHours?.toFixed(1) ?? "0.0"} planned hours completed.</p><div className="mt-3 h-2 rounded-full bg-slate-200 dark:bg-slate-700"><div className="h-2 rounded-full bg-primary" style={{ width: `${todaysSummary?.plannedHours ? Math.min((todaysSummary.completedHours / todaysSummary.plannedHours) * 100, 100) : 0}%` }} /></div><p className="mt-2 text-xs text-slate-400">{todaysSummary?.totalSessions ?? 0} sessions scheduled today</p></div>
      </div>

      {/* Current & Next Session Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {todaySchedule.length > 0 && (
          <>
            {/* Next Session */}
            {upcomingSessions.length > 0 && (
              <div className="card p-4 border-l-4 border-l-primary bg-primary/5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-small text-slate-600 dark:text-slate-400 mb-1">Next Session</p>
                    <h3 className="text-body font-semibold">{upcomingSessions[0].subjectName}</h3>
                  </div>
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-2 text-small">
                  <p>
                    <span className="text-slate-600 dark:text-slate-400">Time:</span>{" "}
                    <span className="font-medium">
                      {upcomingSessions[0].startTime} – {upcomingSessions[0].endTime}
                    </span>
                  </p>
                  <p>
                    <span className="text-slate-600 dark:text-slate-400">Type:</span>{" "}
                    <span className="font-medium">
                      {upcomingSessions[0].sessionType.replace(/_/g, " ")}
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Missed Sessions Alert */}
            {missedSessions.length > 0 && (
              <div className="card p-4 border-l-4 border-l-danger bg-danger/5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-small text-slate-600 dark:text-slate-400 mb-1">
                      Missed Sessions
                    </p>
                    <h3 className="text-body font-semibold">{missedSessions.length} pending</h3>
                  </div>
                  <AlertCircle className="w-5 h-5 text-danger" />
                </div>
                <p className="text-small text-slate-600 dark:text-slate-400">
                  {missedSessions[0].subjectName} ({missedSessions[0].startTime})
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sessions Area (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filters and Search */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search sessions..."
                  value={filters.searchQuery}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))
                  }
                  className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-body"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="card p-4 space-y-4">
                {/* View Type */}
                <div>
                  <label className="text-small font-medium mb-2 block">View</label>
                  <div className="flex gap-2">
                    {(["today", "week", "all"] as const).map((view) => (
                      <button
                        key={view}
                        onClick={() => setFilters((prev) => ({ ...prev, view }))}
                        className={`px-3 py-1 rounded-lg text-small font-medium transition ${
                          filters.view === view
                            ? "bg-primary text-primary-foreground"
                            : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                      >
                        {view.charAt(0).toUpperCase() + view.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="text-small font-medium mb-2 block">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, status: e.target.value as FilterType }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-body"
                  >
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="missed">Missed</option>
                  </select>
                </div>

                {/* Subject Filter */}
                {subjects.length > 0 && (
                  <div>
                    <label className="text-small font-medium mb-2 block">Subject</label>
                    <select
                      value={filters.subject}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, subject: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-body"
                    >
                      <option value="all">All Subjects</option>
                      {subjects.map((subj) => (
                        <option key={subj} value={subj}>
                          {subj}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Session Type Filter */}
                {sessionTypes.length > 0 && (
                  <div>
                    <label className="text-small font-medium mb-2 block">Session Type</label>
                    <select
                      value={filters.sessionType}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, sessionType: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-body"
                    >
                      <option value="all">All Types</option>
                      {sessionTypes.map((type) => (
                        <option key={type} value={type}>
                          {type.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sessions List */}
          {filteredSessions.length > 0 ? (
            <div className="card p-6">
              <h2 className="text-body font-semibold mb-4">
                {filters.view === "today"
                  ? "📅 Today's Study Schedule"
                  : filters.view === "week"
                  ? "📅 This Week's Sessions"
                  : "📅 All Study Sessions"}
              </h2>
              <DailyTimeline
                sessions={filteredSessions}
                onEdit={handleEditSession}
                onDelete={handleDeleteSession}
                onMarkComplete={handleMarkComplete}
              />
            </div>
          ) : (
            <div className="card text-center py-12 text-slate-500 dark:text-slate-400">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No sessions found</p>
              <p className="text-small mt-1">Create a new study session to get started</p>
            </div>
          )}

          {/* Weekly Overview - Show for all views */}
          {allSessions.length > 0 && (
            <WeeklyOverview 
              sessions={allSessions}
              onSelectDay={(date) => {
                setFilters((prev) => ({ ...prev, view: "today" }));
              }}
            />
          )}

          {allSessions.length > 0 && (
            <div className="card">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-body font-semibold">Today at a Glance</h3>
                  <p className="mt-1 text-small text-slate-500 dark:text-slate-400">
                    Your next confirmed study blocks
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddSession}
                  className="flex items-center gap-1 rounded-lg border border-primary px-3 py-2 text-small font-medium text-primary hover:bg-primary/5"
                >
                  <Plus className="h-3.5 w-3.5" /> Add session
                </button>
              </div>
              {upcomingSessions.length > 0 ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {upcomingSessions.slice(0, 4).map((session) => (
                    <button
                      type="button"
                      key={session.id}
                      onClick={() => handleEditSession(session)}
                      className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-left transition hover:border-primary/50 dark:border-slate-700"
                    >
                      <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="mt-0.5 text-[10px] font-semibold">{session.startTime}</span>
                      </div>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-small font-medium">{session.subjectName}</span>
                        <span className="mt-1 block truncate text-xs text-slate-500 dark:text-slate-400">
                          {session.sessionType.replace(/_/g, " ")} · {session.priority.toLowerCase()} priority
                        </span>
                      </span>
                      <Edit2 className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-slate-300 p-5 text-center dark:border-slate-600">
                  <p className="text-small font-medium">No upcoming sessions</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Schedule your next study block to keep the week moving.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Goals & Insights */}
          {allSessions.length > 0 && (
            <GoalsAndInsights 
              sessions={allSessions}
              dailyGoal={6}
              weeklyGoal={30}
            />
          )}

          {/* Statistics */}
          {todaysSummary && (
            <StudyStatistics
              sessions={allSessions}
              todaySummary={todaysSummary}
              weeklyStats={weeklyStats}
              goalProgress={goalProgress}
              streak={streak}
            />
          )}
        </div>
      </div>

      {/* Modal */}
      <TimetableSessionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        session={selectedSession}
        onSuccess={handleModalSuccess}
        courses={courses}
      />
    </div>
  );
}
