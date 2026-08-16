-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('LECTURE', 'REVISION', 'PRACTICE', 'ASSIGNMENT', 'PRACTICAL', 'PROJECT', 'READING', 'EXAM_PREPARATION', 'MOCK_TEST', 'BREAK');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- AlterEnum
ALTER TYPE "TimetableStatus" ADD VALUE 'MISSED';

-- AlterTable
ALTER TABLE "Timetable" ADD COLUMN     "isBreak" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "sessionType" "SessionType" NOT NULL DEFAULT 'LECTURE';

-- CreateTable
CREATE TABLE "StudyGoal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "goalType" TEXT NOT NULL DEFAULT 'DAILY',
    "targetHours" DOUBLE PRECISION NOT NULL DEFAULT 6,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyGoal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudyGoal_userId_idx" ON "StudyGoal"("userId");

-- CreateIndex
CREATE INDEX "StudyGoal_goalType_idx" ON "StudyGoal"("goalType");

-- CreateIndex
CREATE INDEX "Timetable_status_idx" ON "Timetable"("status");

-- AddForeignKey
ALTER TABLE "StudyGoal" ADD CONSTRAINT "StudyGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
