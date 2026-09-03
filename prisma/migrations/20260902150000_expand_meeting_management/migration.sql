ALTER TABLE "Meeting" RENAME COLUMN "waitingRoom" TO "waitingRoomEnabled";
ALTER TABLE "Meeting" ADD COLUMN "screenShareEnabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Meeting" ADD COLUMN "chatEnabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Meeting" ADD COLUMN "recordingEnabled" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "MeetingAttendance" RENAME COLUMN "durationSeconds" TO "duration";
ALTER TABLE "MeetingAttendance" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'PRESENT';

CREATE TABLE "MeetingRecording" (
  "id" TEXT NOT NULL,
  "meetingId" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "storageKey" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PROCESSING',
  "duration" INTEGER,
  "startedAt" TIMESTAMP(3),
  "endedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MeetingRecording_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MeetingRecording_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "MeetingRecording_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "MeetingRecording_meetingId_createdAt_idx" ON "MeetingRecording"("meetingId", "createdAt");

CREATE TABLE "MeetingTranscript" (
  "id" TEXT NOT NULL,
  "meetingId" TEXT NOT NULL,
  "speakerId" TEXT,
  "content" TEXT NOT NULL,
  "startedAt" TIMESTAMP(3),
  "endedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MeetingTranscript_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MeetingTranscript_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "MeetingTranscript_speakerId_fkey" FOREIGN KEY ("speakerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "MeetingTranscript_meetingId_createdAt_idx" ON "MeetingTranscript"("meetingId", "createdAt");

CREATE TABLE "MeetingNote" (
  "id" TEXT NOT NULL,
  "meetingId" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MeetingNote_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MeetingNote_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "MeetingNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "MeetingNote_meetingId_updatedAt_idx" ON "MeetingNote"("meetingId", "updatedAt");

CREATE TABLE "MeetingActionItem" (
  "id" TEXT NOT NULL,
  "meetingId" TEXT NOT NULL,
  "assigneeId" TEXT,
  "createdById" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "dueAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MeetingActionItem_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MeetingActionItem_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "MeetingActionItem_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "MeetingActionItem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "MeetingActionItem_meetingId_status_idx" ON "MeetingActionItem"("meetingId", "status");

CREATE TABLE "MeetingReaction" (
  "id" TEXT NOT NULL,
  "meetingId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "participantIdentity" TEXT NOT NULL,
  "reaction" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MeetingReaction_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MeetingReaction_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "MeetingReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "MeetingReaction_meetingId_createdAt_idx" ON "MeetingReaction"("meetingId", "createdAt");

CREATE TABLE "MeetingRaisedHand" (
  "id" TEXT NOT NULL,
  "meetingId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "participantIdentity" TEXT NOT NULL,
  "isRaised" BOOLEAN NOT NULL DEFAULT true,
  "raisedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "loweredAt" TIMESTAMP(3),
  CONSTRAINT "MeetingRaisedHand_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MeetingRaisedHand_meetingId_userId_key" UNIQUE ("meetingId", "userId"),
  CONSTRAINT "MeetingRaisedHand_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "MeetingRaisedHand_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "MeetingRaisedHand_meetingId_isRaised_raisedAt_idx" ON "MeetingRaisedHand"("meetingId", "isRaised", "raisedAt");

ALTER TABLE "Meeting" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MeetingParticipant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MeetingSession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MeetingMessage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MeetingAttendance" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MeetingRecording" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MeetingTranscript" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MeetingNote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MeetingActionItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MeetingReaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MeetingRaisedHand" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "meeting_deny_direct_access" ON "Meeting" FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "meeting_participant_deny_direct_access" ON "MeetingParticipant" FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "meeting_session_deny_direct_access" ON "MeetingSession" FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "meeting_message_deny_direct_access" ON "MeetingMessage" FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "meeting_attendance_deny_direct_access" ON "MeetingAttendance" FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "meeting_recording_deny_direct_access" ON "MeetingRecording" FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "meeting_transcript_deny_direct_access" ON "MeetingTranscript" FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "meeting_note_deny_direct_access" ON "MeetingNote" FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "meeting_action_item_deny_direct_access" ON "MeetingActionItem" FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "meeting_reaction_deny_direct_access" ON "MeetingReaction" FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "meeting_raised_hand_deny_direct_access" ON "MeetingRaisedHand" FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
