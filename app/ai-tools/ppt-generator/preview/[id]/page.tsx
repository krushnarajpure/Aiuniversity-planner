import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PptPreview } from "@/components/ppt/ppt-preview";

export default async function PptPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  const presentation = await prisma.presentation.findFirst({ where: { id: (await params).id, userId: session.user.id } });
  if (!presentation) notFound();
  return <PptPreview initial={presentation.slides} />;
}
