/*
  Warnings:

  - The `status` column on the `PlacementApplication` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `isSuspended` on the `User` table. All the data in the column will be lost.
  - Added the required column `testId` to the `AptitudeResult` table without a default value. This is not possible if the table is not empty.
  - Made the column `password` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "PlacementApplicationStatus" AS ENUM ('APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'APTITUDE', 'INTERVIEW', 'SELECTED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "AptitudeDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD', 'EXPERT');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'NUMERIC', 'TRUE_FALSE', 'ASSERTION_REASON', 'PASSAGE_BASED');

-- CreateEnum
CREATE TYPE "TestSessionStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'EXPIRED', 'ABANDONED');

-- DropIndex
DROP INDEX "CopilotConversation_userId_updatedAt_idx";

-- DropIndex
DROP INDEX "CopilotMessage_conversationId_createdAt_idx";

-- AlterTable
ALTER TABLE "AptitudeResult" ADD COLUMN     "testId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CopilotConversation" ALTER COLUMN "title" DROP DEFAULT;

-- AlterTable
ALTER TABLE "PlacementApplication" DROP COLUMN "status",
ADD COLUMN     "status" "PlacementApplicationStatus" NOT NULL DEFAULT 'APPLIED';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isSuspended",
ALTER COLUMN "password" SET NOT NULL;

-- CreateTable
CREATE TABLE "AptitudeCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AptitudeCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AptitudeTest" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "difficulty" "AptitudeDifficulty" NOT NULL DEFAULT 'MEDIUM',
    "questionCount" INTEGER NOT NULL DEFAULT 20,
    "durationMinutes" INTEGER NOT NULL DEFAULT 30,
    "correctMarkPerQ" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "negativeMarkPerQ" DOUBLE PRECISION NOT NULL DEFAULT 0.25,
    "shuffleQuestions" BOOLEAN NOT NULL DEFAULT true,
    "shuffleOptions" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AptitudeTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AptitudeQuestion" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL DEFAULT 'SINGLE_CHOICE',
    "difficulty" "AptitudeDifficulty" NOT NULL DEFAULT 'MEDIUM',
    "marks" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "negativeMarks" DOUBLE PRECISION NOT NULL DEFAULT 0.25,
    "explanation" TEXT,
    "solutionText" TEXT,
    "imageUrl" TEXT,
    "displayOrder" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AptitudeQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AptitudeOption" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "optionText" TEXT NOT NULL,
    "optionLabel" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AptitudeOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AptitudeTestSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "status" "TestSessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "currentQuestionNo" INTEGER NOT NULL DEFAULT 1,
    "totalQuestions" INTEGER NOT NULL,
    "correctAnswers" INTEGER NOT NULL DEFAULT 0,
    "wrongAnswers" INTEGER NOT NULL DEFAULT 0,
    "unansweredCount" INTEGER NOT NULL DEFAULT 0,
    "score" DOUBLE PRECISION,
    "accuracy" DOUBLE PRECISION,
    "timeTakenSeconds" INTEGER,
    "isFullscreen" BOOLEAN NOT NULL DEFAULT false,
    "tabSwitchCount" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AptitudeTestSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AptitudeAnswer" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedOption" TEXT,
    "numericAnswer" DOUBLE PRECISION,
    "isCorrect" BOOLEAN,
    "timespentSeconds" INTEGER NOT NULL DEFAULT 0,
    "markedForReview" BOOLEAN NOT NULL DEFAULT false,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AptitudeAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AptitudeStats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalTests" INTEGER NOT NULL DEFAULT 0,
    "completedTests" INTEGER NOT NULL DEFAULT 0,
    "bestScore" DOUBLE PRECISION,
    "averageScore" DOUBLE PRECISION,
    "averageAccuracy" DOUBLE PRECISION,
    "totalQuestionsAttempted" INTEGER NOT NULL DEFAULT 0,
    "totalCorrect" INTEGER NOT NULL DEFAULT 0,
    "totalWrong" INTEGER NOT NULL DEFAULT 0,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "totalTimeSeconds" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AptitudeStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AptitudeCategory_name_key" ON "AptitudeCategory"("name");

-- CreateIndex
CREATE INDEX "AptitudeCategory_isActive_idx" ON "AptitudeCategory"("isActive");

-- CreateIndex
CREATE INDEX "AptitudeTest_categoryId_idx" ON "AptitudeTest"("categoryId");

-- CreateIndex
CREATE INDEX "AptitudeTest_isActive_isPublished_idx" ON "AptitudeTest"("isActive", "isPublished");

-- CreateIndex
CREATE INDEX "AptitudeTest_difficulty_idx" ON "AptitudeTest"("difficulty");

-- CreateIndex
CREATE INDEX "AptitudeQuestion_testId_idx" ON "AptitudeQuestion"("testId");

-- CreateIndex
CREATE INDEX "AptitudeQuestion_categoryId_idx" ON "AptitudeQuestion"("categoryId");

-- CreateIndex
CREATE INDEX "AptitudeQuestion_difficulty_idx" ON "AptitudeQuestion"("difficulty");

-- CreateIndex
CREATE INDEX "AptitudeQuestion_displayOrder_idx" ON "AptitudeQuestion"("displayOrder");

-- CreateIndex
CREATE INDEX "AptitudeOption_questionId_idx" ON "AptitudeOption"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "AptitudeOption_questionId_optionLabel_key" ON "AptitudeOption"("questionId", "optionLabel");

-- CreateIndex
CREATE INDEX "AptitudeTestSession_userId_idx" ON "AptitudeTestSession"("userId");

-- CreateIndex
CREATE INDEX "AptitudeTestSession_testId_idx" ON "AptitudeTestSession"("testId");

-- CreateIndex
CREATE INDEX "AptitudeTestSession_status_idx" ON "AptitudeTestSession"("status");

-- CreateIndex
CREATE INDEX "AptitudeTestSession_startedAt_idx" ON "AptitudeTestSession"("startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "AptitudeTestSession_userId_testId_key" ON "AptitudeTestSession"("userId", "testId");

-- CreateIndex
CREATE INDEX "AptitudeAnswer_sessionId_idx" ON "AptitudeAnswer"("sessionId");

-- CreateIndex
CREATE INDEX "AptitudeAnswer_questionId_idx" ON "AptitudeAnswer"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "AptitudeAnswer_sessionId_questionId_key" ON "AptitudeAnswer"("sessionId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "AptitudeStats_userId_key" ON "AptitudeStats"("userId");

-- CreateIndex
CREATE INDEX "AptitudeStats_userId_idx" ON "AptitudeStats"("userId");

-- CreateIndex
CREATE INDEX "AptitudeResult_testId_idx" ON "AptitudeResult"("testId");

-- CreateIndex
CREATE INDEX "CopilotConversation_userId_idx" ON "CopilotConversation"("userId");

-- CreateIndex
CREATE INDEX "CopilotConversation_updatedAt_idx" ON "CopilotConversation"("updatedAt");

-- CreateIndex
CREATE INDEX "CopilotMessage_conversationId_idx" ON "CopilotMessage"("conversationId");

-- CreateIndex
CREATE INDEX "PlacementApplication_studentId_status_idx" ON "PlacementApplication"("studentId", "status");

-- AddForeignKey
ALTER TABLE "AptitudeResult" ADD CONSTRAINT "AptitudeResult_testId_fkey" FOREIGN KEY ("testId") REFERENCES "AptitudeTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AptitudeTest" ADD CONSTRAINT "AptitudeTest_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "AptitudeCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AptitudeQuestion" ADD CONSTRAINT "AptitudeQuestion_testId_fkey" FOREIGN KEY ("testId") REFERENCES "AptitudeTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AptitudeQuestion" ADD CONSTRAINT "AptitudeQuestion_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "AptitudeCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AptitudeOption" ADD CONSTRAINT "AptitudeOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "AptitudeQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AptitudeTestSession" ADD CONSTRAINT "AptitudeTestSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AptitudeTestSession" ADD CONSTRAINT "AptitudeTestSession_testId_fkey" FOREIGN KEY ("testId") REFERENCES "AptitudeTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AptitudeAnswer" ADD CONSTRAINT "AptitudeAnswer_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AptitudeTestSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AptitudeAnswer" ADD CONSTRAINT "AptitudeAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "AptitudeQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AptitudeStats" ADD CONSTRAINT "AptitudeStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
