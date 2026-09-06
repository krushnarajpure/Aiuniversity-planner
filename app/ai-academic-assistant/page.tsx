import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell";
import { AcademicAssistantClient } from "@/components/ai-academic-assistant/academic-assistant-client";

export default async function AIAcademicAssistantPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  return <AppShell userName={session.user.name}><AcademicAssistantClient userName={session.user.name || "there"} /></AppShell>;
}
