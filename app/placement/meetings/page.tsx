import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell";
import { MeetingsClient } from "@/components/placement/meetings-client";

export default async function MeetingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "STUDENT") redirect("/dashboard");

  return (
    <AppShell userName={session.user.name}>
      <MeetingsClient userName={session.user.name ?? "Student"} />
    </AppShell>
  );
}
