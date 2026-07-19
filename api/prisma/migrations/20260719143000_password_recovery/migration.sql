ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetTokenHash" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetTokenExpiresAt" TIMESTAMP(3);
CREATE INDEX IF NOT EXISTS "User_resetTokenHash_idx" ON "User"("resetTokenHash");
