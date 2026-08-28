CREATE TABLE "CopilotConversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'New chat',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CopilotConversation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CopilotMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CopilotMessage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CopilotConversation_userId_updatedAt_idx" ON "CopilotConversation"("userId", "updatedAt");
CREATE INDEX "CopilotMessage_conversationId_createdAt_idx" ON "CopilotMessage"("conversationId", "createdAt");
ALTER TABLE "CopilotConversation" ADD CONSTRAINT "CopilotConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CopilotMessage" ADD CONSTRAINT "CopilotMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "CopilotConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;