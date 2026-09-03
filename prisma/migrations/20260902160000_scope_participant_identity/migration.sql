ALTER TABLE "MeetingParticipant" DROP CONSTRAINT "MeetingParticipant_participantIdentity_key";
ALTER TABLE "MeetingParticipant" ADD CONSTRAINT "MeetingParticipant_meetingId_participantIdentity_key" UNIQUE ("meetingId", "participantIdentity");
