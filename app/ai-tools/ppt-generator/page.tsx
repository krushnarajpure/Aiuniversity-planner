import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell";
import { PptGenerator } from "@/components/ppt/ppt-generator";

export default async function PptGeneratorPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login?callbackUrl=/ai-tools/ppt-generator");
  return <AppShell userName={session.user.name}><PptGenerator /></AppShell>;
}
