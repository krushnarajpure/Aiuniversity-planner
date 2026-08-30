import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getProfile } from "@/actions/profile";
import { ProfileForm } from "@/components/profile/profile-form";
import { AppShell } from "@/components/layout/app-shell";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = await getProfile();
  if (!user) redirect("/login");

  return (
    <AppShell userName={session.user?.name}>
      <div className="p-4 sm:p-6">
        <div className="mb-6">
          <p className="text-sm font-medium text-primary">Profile</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">Profile</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Manage your personal information and preferences.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <ProfileForm user={user} />
        </div>
      </div>
    </AppShell>
  );
}
