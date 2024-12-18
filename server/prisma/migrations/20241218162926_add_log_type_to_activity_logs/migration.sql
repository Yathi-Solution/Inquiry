/*
  Warnings:

  - Added the required column `log_type` to the `activity_logs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "activity_logs" ADD COLUMN     "log_type" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "activity_logs_log_type_idx" ON "activity_logs"("log_type");
