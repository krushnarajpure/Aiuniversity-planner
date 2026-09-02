import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Brain, BookOpen, Zap, Clock, Trophy, Flame, AlertCircle } from "lucide-react";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell";
import { AptitudeDashboard } from "@/components/placement/aptitude-dashboard";

export default async function AptitudeTestPage() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        redirect("/login");
    }

    return (
        <AppShell userName={session.user?.name}>
            <div className="p-6 space-y-6">
                <div>
                    <p className="text-small text-primary font-medium">Placement preparation</p>
                    <h1 className="text-subheading font-semibold">Aptitude Test</h1>
                    <p className="text-small text-slate-500 dark:text-slate-400 mt-1">
                        Test your placement readiness with advanced aptitude challenges across multiple topics.
                    </p>
                </div>

                <AptitudeDashboard userEmail={session.user.email} />
            </div>
        </AppShell>
    );
}
