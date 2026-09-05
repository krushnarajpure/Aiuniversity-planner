import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { RoomServiceClient } from "livekit-server-sdk";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateMeetingSchema = z.object({
  title: z.string().trim().min(2).max(120).optional(),
  description: z.string().trim().max(1000).nullable().optional(),
  maxParticipants: z.number().int().min(2).max(25).optional(),
  waitingRoomEnabled: z.boolean().optional(),
  screenShareEnabled: z.boolean().optional(),
  chatEnabled: z.boolean().optional(),
  recordingEnabled: z.boolean().optional(),
  status: z.enum(["SCHEDULED", "ACTIVE", "ENDED", "CANCELLED"]).optional(),
});

async function getAuthorizedMeeting(meetingCode: string, userId: string) {
  const meeting = await prisma.meeting.findUnique({ where: { meetingCode } });
  if (!meeting) return { meeting: null, authorized: false };
  const authorized = meeting.hostId === userId || Boolean(await prisma.meetingParticipant.findUnique({ where: { meetingId_userId: { meetingId: meeting.id, userId } }, select: { id: true } }));
  return { meeting, authorized };
}

export async function GET(_request: Request, { params }: { params: Promise<{ meetingCode: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !["STUDENT", "ORGANIZATION"].includes(session.user.role)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { meetingCode } = await params;
  const { meeting, authorized } = await getAuthorizedMeeting(meetingCode, session.user.id);
  if (!meeting || !authorized) return NextResponse.json({ error: "Meeting not found." }, { status: 404 });
  return NextResponse.json({ meeting: { ...meeting, passwordHash: undefined } });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ meetingCode: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !["STUDENT", "ORGANIZATION"].includes(session.user.role)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { meetingCode } = await params;
  const meeting = await prisma.meeting.findUnique({ where: { meetingCode }, select: { id: true, hostId: true } });
  if (!meeting || meeting.hostId !== session.user.id) return NextResponse.json({ error: "Only the meeting host can manage this meeting." }, { status: 403 });
  const parsed = updateMeetingSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid meeting update.", issues: parsed.error.flatten() }, { status: 400 });
  const updated = await prisma.meeting.update({ where: { id: meeting.id }, data: parsed.data });
  return NextResponse.json({ meeting: { ...updated, passwordHash: undefined } });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ meetingCode: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !["STUDENT", "ORGANIZATION"].includes(session.user.role)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { meetingCode } = await params;
  const meeting = await prisma.meeting.findUnique({ where: { meetingCode }, select: { id: true, hostId: true, roomName: true } });
  if (!meeting || meeting.hostId !== session.user.id) return NextResponse.json({ error: "Only the meeting host can end this meeting." }, { status: 403 });
  const ended = await prisma.meeting.update({ where: { id: meeting.id }, data: { status: "ENDED", endedAt: new Date() } });
  if (process.env.LIVEKIT_URL && process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_API_SECRET) {
    try {
      const roomService = new RoomServiceClient(process.env.LIVEKIT_URL.replace(/^ws/, "http"), process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET);
      await roomService.deleteRoom(meeting.roomName);
    } catch (error) {
      console.error("LiveKit room cleanup failed", error);
    }
  }
  return NextResponse.json({ meeting: { ...ended, passwordHash: undefined } });
}
