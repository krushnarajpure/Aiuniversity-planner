-- Add a dedicated notification type for administrator broadcasts.
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'ADMIN_ANNOUNCEMENT';
