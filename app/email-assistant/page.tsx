import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getProfile } from "@/actions/profile";
import { AppShell } from "@/components/layout/app-shell";
import { CommunicationAssistantClient } from "@/components/email-assistant/communication-assistant-client";

export default async function EmailAssistantPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  const profile = await getProfile();
  return <AppShell userName={session.user.name}><CommunicationAssistantClient profile={{ name: profile?.name || session.user.name || "", email: profile?.email || session.user.email || "", department: profile?.department || "", semester: profile?.semester || "", university: profile?.university || "" }} /></AppShell>;
}