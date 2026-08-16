import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getTimetables } from "@/actions/timetable";
import { AppShell } from "@/components/layout/app-shell";
import { Calendar, Clock, BookOpen } from "lucide-react";
import { format } from "date-fns";

export default async function StudyTimetablePage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");

    const timetables = await getTimetables();

    return (
        <AppShell userName={session.user?.name}>
            <div className="p-6">
                <h1 className="text-subheading font-semibold mb-2">Study Timetable</h1>
                <p className="text-slate-600 dark:text-slate-400 mb-8">
                    Plan and organize your study schedule
                </p>

                {timetables.length === 0 ? (
                    <div className="card text-center py-12">
                        <div className="flex justify-center mb-4">
                            <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                        </div>
                        <h2 className="text-card-title font-semibold mb-2">No timetable yet</h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">
                            Create a study timetable to organize your study sessions
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {timetables.map((timetable) => (
                            <div key={timetable.id} className="card">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-card-title font-semibold mb-2">
                                            {timetable.subjectName}
                                        </h3>
                                        <div className="space-y-1 text-small text-slate-600 dark:text-slate-400">
                                            <p className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                {format(timetable.date, "MMM dd, yyyy")}
                                            </p>
                                            <p className="flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                {timetable.startTime} - {timetable.endTime}
                                            </p>
                                            {timetable.notes && (
                                                <p className="flex items-center gap-2">
                                                    <BookOpen className="w-4 h-4" />
                                                    {timetable.notes}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <span
                                        className={`px-3 py-1 rounded-full text-small font-medium ${
                                            timetable.status === "COMPLETED"
                                                ? "bg-success/10 text-success"
                                                : timetable.status === "IN_PROGRESS"
                                                ? "bg-primary/10 text-primary"
                                                : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                                        }`}
                                    >
                                        {timetable.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppShell>
    );
}
