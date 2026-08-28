-- Add explicit authorization state to the existing User model.
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'ADMIN');
ALTER TABLE "User" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'STUDENT';

-- Promote administrators explicitly after reviewing the account, for example:
-- UPDATE "User" SET "role" = 'ADMIN' WHERE "email" = 'admin@example.com';
