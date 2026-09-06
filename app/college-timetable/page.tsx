import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getCollegeTimetable } from "@/actions/college-timetable";
import { AppShell } from "@/components/layout/app-shell";
import { CollegeTimetableClient } from "@/components/timetable/college-timetable-client";

export default async function CollegeTimetablePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  const entries = await getCollegeTimetable();
  return <AppShell userName={session.user.name}><CollegeTimetableClient initialEntries={entries} /></AppShell>;
}
