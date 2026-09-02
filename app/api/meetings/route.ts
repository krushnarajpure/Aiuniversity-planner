import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { randomBytes, randomInt } from "crypto";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createMeetingSchema = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1000).optional(),
  type: z.enum(["PLACEMENT", "MOCK_INTERVIEW", "GROUP_DISCUSSION", "MENTORSHIP"]).default("PLACEMENT"),
  scheduledAt: z.string().datetime().optional(),
  durationMinutes: z.number().int().min(15).max(240).default(60),
  maxParticipants: z.number().int().min(2).max(25).default(25),
  waitingRoom: z.boolean().default(true),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "You must be signed in as a student." }, { status: 401 });
  }

  const parsed = createMeetingSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid meeting details.", issues: parsed.error.flatten() }, { status: 400 });
  }

  const meetingCode = `PL-${randomBytes(4).toString("hex").toUpperCase()}`;
  const meetingPassword = String(randomInt(100000, 1000000));
  const livekitConfigured = Boolean(process.env.LIVEKIT_URL && process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_API_SECRET);
  if (!livekitConfigured) {
    return NextResponse.json({ error: "Meeting service is not configured." }, { status: 503 });
  }

  const meeting = await prisma.meeting.create({
    data: {
      meetingCode,
      passwordHash: await bcrypt.hash(meetingPassword, 12),
      roomName: `aiu-${randomBytes(16).toString("hex")}`,
      title: parsed.data.title,
      description: parsed.data.description,
      type: parsed.data.type,
      hostId: session.user.id,
      status: parsed.data.scheduledAt ? "SCHEDULED" : "ACTIVE",
      maxParticipants: parsed.data.maxParticipants,
      waitingRoom: parsed.data.waitingRoom,
      scheduledAt: parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : null,
      startedAt: parsed.data.scheduledAt ? null : new Date(),
      participants: { create: { userId: session.user.id, participantIdentity: `user-${session.user.id}`, displayName: session.user.name ?? "Student", role: "HOST", joinedAt: new Date() } },
    },
  });

  return NextResponse.json({
    meeting: {
      id: meeting.meetingCode,
      hostId: session.user.id,
      hostName: session.user.name,
      title: meeting.title,
      password: meetingPassword,
      link: `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/placement/ai-student-meeting/join?meeting=${meeting.meetingCode}`,
      status: meeting.status,
    },
  }, { status: 201 });
}
