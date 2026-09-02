import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { AccessToken } from "livekit-server-sdk";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const tokenSchema = z.object({ meetingId: z.string().trim().min(3).max(32), password: z.string().min(1).max(128), participantName: z.string().trim().min(2).max(80) });

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "STUDENT") return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!process.env.LIVEKIT_URL || !process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET) return NextResponse.json({ error: "Meeting service is not configured." }, { status: 503 });

  const parsed = tokenSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid meeting credentials." }, { status: 400 });

  const meeting = await prisma.meeting.findUnique({ where: { meetingCode: parsed.data.meetingId }, include: { _count: { select: { participants: { where: { leftAt: null } } } } } });
  if (!meeting || !(await bcrypt.compare(parsed.data.password, meeting.passwordHash))) return NextResponse.json({ error: "Invalid meeting ID or password." }, { status: 403 });
  if (meeting.status === "ENDED" || meeting.status === "CANCELLED") return NextResponse.json({ error: "This meeting has ended." }, { status: 410 });
  if (meeting.scheduledAt && meeting.scheduledAt > new Date()) return NextResponse.json({ error: "This meeting has not started yet." }, { status: 409 });

  const existing = await prisma.meetingParticipant.findUnique({ where: { meetingId_userId: { meetingId: meeting.id, userId: session.user.id } } });
  if (!existing && meeting._count.participants >= meeting.maxParticipants) return NextResponse.json({ error: "This meeting is full." }, { status: 409 });

  const identity = existing?.participantIdentity ?? `p-${randomBytes(12).toString("hex")}`;
  await prisma.meetingParticipant.upsert({
    where: { meetingId_userId: { meetingId: meeting.id, userId: session.user.id } },
    update: { participantIdentity: identity, displayName: parsed.data.participantName, joinedAt: new Date(), leftAt: null },
    create: { meetingId: meeting.id, userId: session.user.id, participantIdentity: identity, displayName: parsed.data.participantName, role: "STUDENT", joinedAt: new Date() },
  });

  const token = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, { identity, name: parsed.data.participantName, ttl: "1h" });
  token.addGrant({ room: meeting.roomName, roomJoin: true, canPublish: true, canSubscribe: true });
  return NextResponse.json({ serverUrl: process.env.LIVEKIT_URL, participantToken: await token.toJwt(), meetingId: meeting.meetingCode });
}