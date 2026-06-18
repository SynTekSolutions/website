/*
  Warnings:

  - Added the required column `operation` to the `audit_logs` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AuditOperation" AS ENUM ('CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'EXPORT', 'OTHER');

-- AlterTable
ALTER TABLE "audit_logs" ADD COLUMN     "duration_ms" DOUBLE PRECISION,
ADD COLUMN     "operation" "AuditOperation" NOT NULL,
ADD COLUMN     "trace_id" TEXT;
