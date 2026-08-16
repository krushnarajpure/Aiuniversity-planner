"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
} from "lucide-react";
import type { Timetable } from "@prisma/client";
import { format, startOfWeek } from "date-fns";
import { TimetableSessionModal } from "./timetable-session-modal";
import { DailyTimeline } from "./daily-timeline";
import { StudyStatistics } from "./study-statistics";
import {
  getTodaySchedule,
  getTimetables,
  deleteTimetable,
  getTodaysSummary,
  getWeeklyStats,
  getProgressTowardGoal,
  getStudyStreak,
  getUpcomingSessions,
  getMissedSessions,
  getSubjectProgress,
  markSessionComplete,
} from "@/actions/timetable-enhanced";

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
    view: "today",
    status: "all",
    subject: "all",
    sessionType: "all",
    searchQuery: "",
  });
  const [showFilters, setShowFilters] = useState(false);

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

  return (
    <div className="space-y-8">
      {/* Header with Action Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-subheading font-semibold">Study Timetable</h1>
          <p className="text-small text-slate-600 dark:text-slate-400">
            Organize and track your study sessions
          </p>
        </div>
        <button
          onClick={handleAddSession}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          New Session
        </button>
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
                  ? "Today's Schedule"
                  : filters.view === "week"
                  ? "This Week"
                  : "All Sessions"}
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
        </div>

        {/* Statistics Sidebar (1/3 width) */}
        <div className="lg:col-span-1">
          {todaysSummary && (
            <StudyStatistics
              sessions={filteredSessions}
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
