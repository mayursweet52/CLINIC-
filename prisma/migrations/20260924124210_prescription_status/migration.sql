-- AlterTable
ALTER TABLE "Prescription" ADD COLUMN     "dispensedAt" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING';
