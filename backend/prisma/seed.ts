import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN' },
  });
  const userRole = await prisma.role.upsert({
    where: { name: 'USER' },
    update: {},
    create: { name: 'USER' },
  });

  // Permissions
  const perms = ['manage_users', 'view_dashboard', 'manage_assets', 'view_analytics'];
  for (const perm of perms) {
    await prisma.permission.upsert({
      where: { name: perm },
      update: {},
      create: { name: perm, roles: { connect: [{ id: adminRole.id }] } },
    });
  }

  // Admin user
  const adminHash = await bcrypt.hash('Admin@1234', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bel.com' },
    update: {},
    create: {
      email: 'admin@bel.com',
      passwordHash: adminHash,
      firstName: 'Admin',
      lastName: 'User',
      roleId: adminRole.id,
    },
  });

  // BEL001 employee user
  const mockEmployeeHash = await bcrypt.hash('bel123', 10);
  const employeeUser = await prisma.user.upsert({
    where: { email: 'BEL001' },
    update: { passwordHash: mockEmployeeHash },
    create: {
      email: 'BEL001',
      passwordHash: mockEmployeeHash,
      firstName: 'Rahul',
      lastName: 'Verma',
      roleId: adminRole.id,
    },
  });

  // Regular user
  const userHash = await bcrypt.hash('User@1234', 10);
  const user = await prisma.user.upsert({
    where: { email: 'satheesh@bel.com' },
    update: {},
    create: {
      email: 'satheesh@bel.com',
      passwordHash: userHash,
      firstName: 'Satheesh',
      lastName: 'Kumar',
      roleId: userRole.id,
    },
  });

  // Assets
  const assetData = [
    { symbol: 'BTC', name: 'Bitcoin',  price: 65000, marketCap: 1_280_000_000_000, change24h: 2.4 },
    { symbol: 'ETH', name: 'Ethereum', price: 3500,  marketCap: 420_000_000_000,   change24h: 1.8 },
    { symbol: 'SOL', name: 'Solana',   price: 180,   marketCap: 82_000_000_000,    change24h: -0.5 },
    { symbol: 'ADA', name: 'Cardano',  price: 0.48,  marketCap: 17_000_000_000,    change24h: 3.1 },
    { symbol: 'DOT', name: 'Polkadot', price: 7.50,  marketCap: 10_000_000_000,    change24h: -1.2 },
  ];

  const assets = [];
  for (const a of assetData) {
    const asset = await prisma.asset.upsert({
      where: { symbol: a.symbol },
      update: { price: a.price },
      create: a,
    });
    assets.push(asset);
  }

  // Wallet for user
  let wallet = await prisma.wallet.findFirst({ where: { userId: user.id } });
  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: {
        userId: user.id,
        address: '0x' + Math.random().toString(16).slice(2, 42),
        balance: 24500.75,
        currency: 'USD',
      },
    });
  }

  // Portfolio
  let portfolio = await prisma.portfolio.findFirst({ where: { walletId: wallet.id } });
  if (!portfolio) {
    portfolio = await prisma.portfolio.create({
      data: {
        walletId: wallet.id,
        items: {
          create: [
            { assetId: assets[0].id, quantity: 0.5,  averageCost: 60000 },
            { assetId: assets[1].id, quantity: 3.2,  averageCost: 3200  },
            { assetId: assets[2].id, quantity: 50,   averageCost: 150   },
          ],
        },
      },
    });
  }

  // Transactions
  const txTypes = ['Send', 'Receive', 'Swap', 'Stake', 'Unstake', 'Bridge', 'Mint', 'Burn', 'Deposit', 'Withdraw'];
  const txStatuses = ['Pending', 'Processing', 'Confirmed', 'Failed', 'Cancelled'];
  const networks = ['Ethereum', 'Solana', 'Polygon', 'Arbitrum', 'Binance Smart Chain'];
  for (let i = 0; i < 15; i++) {
    const asset = assets[i % assets.length];
    await prisma.transaction.create({
      data: {
        walletId: wallet.id,
        transactionHash: '0x' + crypto.randomBytes(32).toString('hex'),
        transactionType: txTypes[i % txTypes.length],
        assetSymbol: asset.symbol,
        assetName: asset.name,
        network: networks[i % networks.length],
        fromAddress: '0x' + crypto.randomBytes(20).toString('hex'),
        toAddress: '0x' + crypto.randomBytes(20).toString('hex'),
        amount: parseFloat((Math.random() * 5000).toFixed(2)),
        usdValue: parseFloat((Math.random() * 10000).toFixed(2)),
        transactionFee: parseFloat((Math.random() * 10).toFixed(2)),
        gasUsed: Math.floor(Math.random() * 100000),
        gasPrice: Math.floor(Math.random() * 50),
        status: i < 12 ? 'Confirmed' : txStatuses[i % txStatuses.length],
        confirmations: i < 12 ? 12 + Math.floor(Math.random() * 100) : 0,
        blockNumber: 15300000 + i,
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 10000000000)),
        memo: `Test transaction ${i}`,
      },
    });
  }

  // Notifications
  await prisma.notification.createMany({
    data: [
      { userId: user.id, type: 'TRADE',  message: 'BTC purchase of 0.1 BTC completed successfully.' },
      { userId: user.id, type: 'ALERT',  message: 'ETH price crossed $3500 threshold.' },
      { userId: user.id, type: 'SYSTEM', message: 'Your account was accessed from a new device.' },
    ],
  });

  console.log(`✅ Seed complete. Admin: admin@bel.com / Admin@1234 | User: satheesh@bel.com / User@1234`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
