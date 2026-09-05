import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { presentationSchema } from "@/lib/ppt";

async function owned(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { session: null, presentation: null };
  const presentation = await prisma.presentation.findFirst({ where: { id, userId: session.user.id } });
  return { session, presentation };
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, presentation } = await owned((await params).id);
  if (!session) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  if (!presentation) return NextResponse.json({ error: "Presentation not found." }, { status: 404 });
  return NextResponse.json({ presentation });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, presentation } = await owned((await params).id);
  if (!session) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  if (!presentation) return NextResponse.json({ error: "Presentation not found." }, { status: 404 });
  const body = await request.json().catch(() => null) as { document?: unknown; title?: string } | null;
  const document = presentationSchema.safeParse(body?.document);
  if (!document.success) return NextResponse.json({ error: "Invalid presentation document." }, { status: 400 });
  const updated = await prisma.presentation.update({ where: { id: presentation.id }, data: { title: body?.title?.trim() || document.data.title, theme: document.data.theme, slides: document.data } });
  return NextResponse.json({ presentation: updated });
}
