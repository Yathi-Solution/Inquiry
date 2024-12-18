/*
  Warnings:

  - The primary key for the `activity_logs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `log_id` on the `activity_logs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "activity_logs" DROP CONSTRAINT "activity_logs_pkey",
DROP COLUMN "log_id",
ADD COLUMN     "activity_id" SERIAL NOT NULL,
ADD CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("activity_id");

-- CreateIndex
CREATE INDEX "activity_logs_user_id_idx" ON "activity_logs"("user_id");
