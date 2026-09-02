CREATE TYPE "MeetingStatus" AS ENUM ('SCHEDULED', 'ACTIVE', 'ENDED', 'CANCELLED');
CREATE TYPE "MeetingType" AS ENUM ('PLACEMENT', 'MOCK_INTERVIEW', 'GROUP_DISCUSSION', 'MENTORSHIP');
CREATE TYPE "MeetingParticipantRole" AS ENUM ('HOST', 'CO_HOST', 'STUDENT', 'GUEST');

CREATE TABLE "Meeting" (
  "id" TEXT NOT NULL,
  "meetingCode" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "roomName" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "type" "MeetingType" NOT NULL DEFAULT 'PLACEMENT',
  "hostId" TEXT NOT NULL,
  "status" "MeetingStatus" NOT NULL DEFAULT 'SCHEDULED',
  "maxParticipants" INTEGER NOT NULL DEFAULT 25,
  "waitingRoom" BOOLEAN NOT NULL DEFAULT true,
  "scheduledAt" TIMESTAMP(3),
  "startedAt" TIMESTAMP(3),
  "endedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Meeting_meetingCode_key" UNIQUE ("meetingCode"),
  CONSTRAINT "Meeting_roomName_key" UNIQUE ("roomName"),
  CONSTRAINT "Meeting_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "Meeting_hostId_status_idx" ON "Meeting"("hostId", "status");
CREATE INDEX "Meeting_status_scheduledAt_idx" ON "Meeting"("status", "scheduledAt");

CREATE TABLE "MeetingParticipant" (
  "id" TEXT NOT NULL,
  "meetingId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "participantIdentity" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "role" "MeetingParticipantRole" NOT NULL DEFAULT 'STUDENT',
  "joinedAt" TIMESTAMP(3),
  "leftAt" TIMESTAMP(3),
  "cameraEnabled" BOOLEAN NOT NULL DEFAULT false,
  "microphoneEnabled" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MeetingParticipant_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MeetingParticipant_participantIdentity_key" UNIQUE ("participantIdentity"),
  CONSTRAINT "MeetingParticipant_meetingId_userId_key" UNIQUE ("meetingId", "userId"),
  CONSTRAINT "MeetingParticipant_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "MeetingParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "MeetingParticipant_meetingId_joinedAt_idx" ON "MeetingParticipant"("meetingId", "joinedAt");

CREATE TABLE "MeetingSession" (
  "id" TEXT NOT NULL,
  "meetingId" TEXT NOT NULL,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "endedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MeetingSession_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MeetingSession_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "MeetingSession_meetingId_startedAt_idx" ON "MeetingSession"("meetingId", "startedAt");

CREATE TABLE "MeetingMessage" (
  "id" TEXT NOT NULL,
  "meetingId" TEXT NOT NULL,
  "senderId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MeetingMessage_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MeetingMessage_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "MeetingMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "MeetingMessage_meetingId_createdAt_idx" ON "MeetingMessage"("meetingId", "createdAt");

CREATE TABLE "MeetingAttendance" (
  "id" TEXT NOT NULL,
  "meetingId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "participantIdentity" TEXT NOT NULL,
  "joinedAt" TIMESTAMP(3) NOT NULL,
  "leftAt" TIMESTAMP(3),
  "durationSeconds" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MeetingAttendance_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MeetingAttendance_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "MeetingAttendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "MeetingAttendance_meetingId_joinedAt_idx" ON "MeetingAttendance"("meetingId", "joinedAt");
CREATE INDEX "MeetingAttendance_userId_joinedAt_idx" ON "MeetingAttendance"("userId", "joinedAt");
