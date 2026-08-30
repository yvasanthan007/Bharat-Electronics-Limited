-- CreateTable
CREATE TABLE "DIDIdentity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "did" TEXT NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'ethr',
    "walletAddress" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "documentJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DIDIdentity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DIDIdentity_userId_key" ON "DIDIdentity"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DIDIdentity_did_key" ON "DIDIdentity"("did");

-- CreateIndex
CREATE UNIQUE INDEX "DIDIdentity_walletAddress_key" ON "DIDIdentity"("walletAddress");

-- CreateIndex
CREATE INDEX "DIDIdentity_did_idx" ON "DIDIdentity"("did");

-- CreateIndex
CREATE INDEX "DIDIdentity_walletAddress_idx" ON "DIDIdentity"("walletAddress");

-- AddForeignKey
ALTER TABLE "DIDIdentity" ADD CONSTRAINT "DIDIdentity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
