import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { AIChatbotClient } from "@/components/ai-chatbot/ai-chatbot-client";
import { AppShell } from "@/components/layout/app-shell";
import { authOptions } from "@/lib/auth";

export default async function AIChatbotPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login?callbackUrl=/ai-chatbot");

  return (
    <AppShell userName={session.user.name}>
      <AIChatbotClient />
    </AppShell>
  );
}
