-- CreateEnum
CREATE TYPE "MaterialType" AS ENUM ('NOTES', 'PDF', 'IMAGE', 'DOCUMENT', 'LINK');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'MATERIAL_ADDED';
ALTER TYPE "NotificationType" ADD VALUE 'MATERIAL_UPDATED';
ALTER TYPE "NotificationType" ADD VALUE 'MATERIAL_RESTORED';

-- CreateTable
CREATE TABLE "StudyMaterial" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "materialName" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "type" "MaterialType" NOT NULL,
    "description" TEXT,
    "notesContent" TEXT,
    "fileUrl" TEXT,
    "resourceUrl" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isImportant" BOOLEAN NOT NULL DEFAULT false,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "lastViewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudyMaterial_userId_idx" ON "StudyMaterial"("userId");

-- CreateIndex
CREATE INDEX "StudyMaterial_subject_idx" ON "StudyMaterial"("subject");

-- CreateIndex
CREATE INDEX "StudyMaterial_unit_idx" ON "StudyMaterial"("unit");

-- CreateIndex
CREATE INDEX "StudyMaterial_type_idx" ON "StudyMaterial"("type");

-- CreateIndex
CREATE INDEX "StudyMaterial_isDeleted_idx" ON "StudyMaterial"("isDeleted");

-- AddForeignKey
ALTER TABLE "StudyMaterial" ADD CONSTRAINT "StudyMaterial_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
