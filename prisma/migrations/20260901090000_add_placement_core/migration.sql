ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'ORGANIZATION';

CREATE TABLE "PlacementProfile" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "branch" TEXT,
  "skills" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "projects" INTEGER NOT NULL DEFAULT 0,
  "internships" INTEGER NOT NULL DEFAULT 0,
  "aptitudeScore" DOUBLE PRECISION,
  "interviewScore" DOUBLE PRECISION,
  "resumeScore" DOUBLE PRECISION,
  "atsScore" DOUBLE PRECISION,
  "githubUrl" TEXT,
  "linkedinUrl" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PlacementProfile_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PlacementProfile_userId_key" UNIQUE ("userId"),
  CONSTRAINT "PlacementProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "Organization" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "companyName" TEXT NOT NULL,
  "description" TEXT,
  "website" TEXT,
  "industry" TEXT,
  "verified" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Organization_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Organization_userId_key" UNIQUE ("userId"),
  CONSTRAINT "Organization_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "PlacementJob" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "requiredSkills" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "location" TEXT,
  "jobType" TEXT,
  "salaryRange" TEXT,
  "minCgpa" DOUBLE PRECISION,
  "experienceLevel" TEXT NOT NULL DEFAULT 'Entry',
  "applicationDeadline" TIMESTAMP(3),
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PlacementJob_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PlacementJob_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "PlacementJob_organizationId_idx" ON "PlacementJob"("organizationId");
CREATE INDEX "PlacementJob_isActive_idx" ON "PlacementJob"("isActive");

CREATE TABLE "PlacementApplication" (
  "id" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "jobId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'APPLIED',
  "nextStep" TEXT,
  "interviewAt" TIMESTAMP(3),
  "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PlacementApplication_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PlacementApplication_studentId_jobId_key" UNIQUE ("studentId", "jobId"),
  CONSTRAINT "PlacementApplication_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "PlacementApplication_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "PlacementJob"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "PlacementApplication_studentId_status_idx" ON "PlacementApplication"("studentId", "status");

CREATE TABLE "AptitudeResult" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "category" TEXT,
  "score" DOUBLE PRECISION NOT NULL,
  "totalQuestions" INTEGER,
  "takenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AptitudeResult_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AptitudeResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "AptitudeResult_userId_takenAt_idx" ON "AptitudeResult"("userId", "takenAt");

CREATE TABLE "PlacementStreak" (
  "userId" TEXT NOT NULL,
  "currentStreak" INTEGER NOT NULL DEFAULT 0,
  "longestStreak" INTEGER NOT NULL DEFAULT 0,
  "totalXp" INTEGER NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PlacementStreak_pkey" PRIMARY KEY ("userId"),
  CONSTRAINT "PlacementStreak_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
