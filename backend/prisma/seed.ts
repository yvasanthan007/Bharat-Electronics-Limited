import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting BEL Trust Platform Database Seeding...');

  // 1. Roles & Permissions
  const adminRole = await prisma.role.upsert({
    where: { name: 'Administrator' },
    update: {},
    create: {
      name: 'Administrator',
      description: 'Full root access to defense trust ledger & node configuration',
    },
  });

  const engineerRole = await prisma.role.upsert({
    where: { name: 'Engineer' },
    update: {},
    create: {
      name: 'Engineer',
      description: 'Smart contract deployment and identity operations',
    },
  });

  const auditorRole = await prisma.role.upsert({
    where: { name: 'Auditor' },
    update: {},
    create: {
      name: 'Auditor',
      description: 'Read-only compliance and Merkle proof verification',
    },
  });

  // 2. Users
  const passwordHash = await bcrypt.hash('Admin@123', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'rahul.verma@bel.co.in' },
    update: {},
    create: {
      email: 'rahul.verma@bel.co.in',
      passwordHash,
      firstName: 'Rahul',
      lastName: 'Verma',
      did: 'did:bel:7f82e391a3b909f1',
      roleId: adminRole.id,
      isEmailVerified: true,
      status: 'ACTIVE',
    },
  });

  // 3. Wallets
  const masterWallet = await prisma.wallet.upsert({
    where: { address: '0x7f82c4412f9e110b77c5d41a99b21a8d76e0a3b9' },
    update: {},
    create: {
      userId: adminUser.id,
      address: '0x7f82c4412f9e110b77c5d41a99b21a8d76e0a3b9',
      label: 'BEL Defense Master Cold Vault',
      network: 'BEL Sovereign Testnet',
      chainId: 98234,
      isVerified: true,
      balanceEth: 4850.5,
    },
  });

  // 4. Digital Assets
  const asset1 = await prisma.asset.upsert({
    where: { tokenId: '#1024' },
    update: {},
    create: {
      name: 'BEL Radar Sensor Mk-IV Certificate',
      symbol: 'BEL-RS-04',
      category: 'TOKENIZED_DEFENSE_HARDWARE',
      tokenId: '#1024',
      contractAddress: '0x8f3c4e9b21a8d76e053a992bc4412f9e110b77c5',
      ownerId: adminUser.id,
      walletId: masterWallet.id,
      quantity: 1,
      buyPriceUsd: 120000,
      currentPriceUsd: 145000,
      marketValueUsd: 145000,
      allocationPercentage: 38.5,
      pnlPercentage: 20.83,
      isFavorite: true,
    },
  });

  // 5. Transactions
  await prisma.transaction.upsert({
    where: { hash: '0x8f3c4e9b21a8d76e053a992bc4412f9e110b77c5d41a9923' },
    update: {},
    create: {
      hash: '0x8f3c4e9b21a8d76e053a992bc4412f9e110b77c5d41a9923',
      blockNumber: BigInt(2345678),
      fromAddress: '0x0000000000000000000000000000000000000000',
      toAddress: masterWallet.address,
      assetId: asset1.id,
      walletId: masterWallet.id,
      amount: 1,
      usdValue: 145000,
      feeEth: 0.00042,
      type: 'MINT',
      status: 'SUCCESS',
      network: 'BEL Sovereign Testnet',
      memo: 'Minted Defense Radar NFT #1024 for Bharat Electronics Limited',
    },
  });

  // 6. Portfolio
  await prisma.portfolio.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      totalValueUsd: 377000,
      totalHoldingsCount: 536,
      bestPerformer: 'BEL Radar Sensor (+20.8%)',
      worstPerformer: 'bUSD Stablecoin (0.0%)',
      dayChangePercentage: 4.82,
      weekChangePercentage: 12.4,
      monthChangePercentage: 24.8,
    },
  });

  console.log('✅ Database seeded successfully with defense platform records.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
