/*
  Warnings:

  - You are about to drop the column `assetId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `fee` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `assetName` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `assetSymbol` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fromAddress` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `network` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timestamp` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toAddress` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transactionFee` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transactionHash` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transactionType` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usdValue` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_assetId_fkey";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "assetId",
DROP COLUMN "fee",
DROP COLUMN "type",
ADD COLUMN     "assetName" TEXT NOT NULL,
ADD COLUMN     "assetSymbol" TEXT NOT NULL,
ADD COLUMN     "blockNumber" INTEGER,
ADD COLUMN     "confirmations" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "fromAddress" TEXT NOT NULL,
ADD COLUMN     "gasPrice" DOUBLE PRECISION,
ADD COLUMN     "gasUsed" DOUBLE PRECISION,
ADD COLUMN     "memo" TEXT,
ADD COLUMN     "network" TEXT NOT NULL,
ADD COLUMN     "timestamp" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "toAddress" TEXT NOT NULL,
ADD COLUMN     "transactionFee" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "transactionHash" TEXT NOT NULL,
ADD COLUMN     "transactionType" TEXT NOT NULL,
ADD COLUMN     "usdValue" DOUBLE PRECISION NOT NULL;

-- CreateIndex
CREATE INDEX "Transaction_transactionHash_idx" ON "Transaction"("transactionHash");

-- CreateIndex
CREATE INDEX "Transaction_walletId_idx" ON "Transaction"("walletId");

-- CreateIndex
CREATE INDEX "Transaction_status_idx" ON "Transaction"("status");

-- CreateIndex
CREATE INDEX "Transaction_timestamp_idx" ON "Transaction"("timestamp");

-- CreateIndex
CREATE INDEX "Transaction_network_idx" ON "Transaction"("network");
