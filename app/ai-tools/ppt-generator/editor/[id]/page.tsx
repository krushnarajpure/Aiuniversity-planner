import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PptEditor } from "@/components/ppt/ppt-editor";

export default async function PptEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  const presentation = await prisma.presentation.findFirst({ where: { id: (await params).id, userId: session.user.id } });
  if (!presentation) notFound();
  return <PptEditor presentationId={presentation.id} initial={presentation.slides} title={presentation.title} />;
}
