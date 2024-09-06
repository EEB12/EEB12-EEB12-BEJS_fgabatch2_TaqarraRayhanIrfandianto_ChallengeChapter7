-- AlterTable
ALTER TABLE "User" ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "socket_id" TEXT,
ADD COLUMN     "user_agent" TEXT;
