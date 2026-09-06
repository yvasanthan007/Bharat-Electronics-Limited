#!/usr/bin/env node
/**
 * verify-nft.mjs — READ-ONLY on-chain checker for the BEL Asset NFT contract.
 *
 * Verifies the implementation WITHOUT trusting the UI or Firestore:
 *   • connects to the configured public RPC (no wallet, no private key),
 *   • prints contract-level info (owner, nextTokenId),
 *   • resolves each argument:
 *       BEL-LAP-001  → tokenIdByAssetId → ownerOf(tokenId)   (asset id lookup)
 *       1023         → ownerOf(1023) + getAssetInfo(1023)    (token id lookup)
 *
 * Usage:
 *   npm run check:nft
 *   npm run check:nft -- BEL-LAP-001
 *   npm run check:nft -- BEL-LAP-001 1023
 *
 * Configuration is read from .env.local (VITE_NFT_* values) — the same values
 * the frontend uses. There are NO secrets here: reads are free public calls.
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ethers } from 'ethers';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

/* ------------------------- minimal .env.local parser ------------------------ */
function loadEnvFile(file) {
  const vars = {};
  if (!existsSync(file)) return vars;
  for (const rawLine of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    vars[key] = value; // later occurrences override earlier ones
  }
  return vars;
}

const env = {
  ...loadEnvFile(join(ROOT, '.env.local')),
  ...process.env, // CLI environment wins
};

const RPC_URL = env.VITE_NFT_RPC_URL || 'https://rpc-amoy.polygon.technology';
const CHAIN_ID = Number(env.VITE_NFT_CHAIN_ID || 80002);
const CONTRACT = (env.VITE_NFT_CONTRACT_ADDRESS || '').trim();

/* ------------------------------- ABI (read-only) ---------------------------- */
const READ_ABI = [
  'function owner() view returns (address)',
  'function nextTokenId() view returns (uint256)',
  'function tokenIdByAssetId(string assetId) view returns (uint256)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function getAssetInfo(uint256 tokenId) view returns (tuple(string assetId, string assetType, string metadataURI, bool exists) info)',
  'function ownerOfAsset(string assetId) view returns (address currentOwner, uint256 tokenId)',
];

function short(address) {
  if (!address) return '—';
  return `${address.slice(0, 8)}…${address.slice(-6)}`;
}

async function main() {
  console.log('\nBEL Asset NFT — read-only on-chain check');
  console.log('─'.repeat(58));

  if (!/^0x[0-9a-fA-F]{40}$/.test(CONTRACT)) {
    console.error('✗ VITE_NFT_CONTRACT_ADDRESS is not set in .env.local.');
    console.error('  Deploy first:  cd contracts && npm run deploy:amoy');
    console.error('  Then paste the printed address into .env.local and re-run:');
    console.error('    npm run check:nft -- BEL-LAP-001');
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL, CHAIN_ID, { staticNetwork: true });
  const contract = new ethers.Contract(CONTRACT, READ_ABI, provider);

  try {
    const net = await provider.getNetwork();
    const block = await provider.getBlockNumber();
    console.log(`Network      : ${net.name} (chainId ${net.chainId})`);
    console.log(`Contract     : ${CONTRACT}`);
    console.log(`Latest block : ${block}`);
    console.log(`Contract owner (admin): ${await contract.owner()}`);
    console.log(`nextTokenId  : ${Number(await contract.nextTokenId())}`);
  } catch (err) {
    console.error('✗ RPC call failed — is the public endpoint reachable?');
    console.error(' ', err?.shortMessage || err?.message || err);
    process.exit(1);
  }

  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('\nTip: pass asset ids or token ids to verify, e.g.');
    console.log('  npm run check:nft -- BEL-LAP-001 1023');
    console.log('─'.repeat(58));
    return;
  }

  console.log('─'.repeat(58));
  for (const arg of args) {
    try {
      if (/^\d+$/.test(arg)) {
        const tokenId = BigInt(arg);
        const owner = await contract.ownerOf(tokenId);
        let info = '';
        try {
          const a = await contract.getAssetInfo(tokenId);
          info = ` · assetId=${a[0]} · type=${a[1]}`;
        } catch {
          /* token exists but has no asset record (foreign mint) */
        }
        console.log(`Token #${arg}     → owner ${owner}${info}`);
      } else {
        const tokenId = Number(await contract.tokenIdByAssetId(arg));
        if (!tokenId) {
          console.log(`Asset "${arg}" → ✗ not minted on-chain (tokenIdByAssetId = 0)`);
          continue;
        }
        const owner = await contract.ownerOf(tokenId);
        console.log(`Asset "${arg}" → token #${tokenId} → owner ${owner} (${short(owner)})`);
      }
    } catch (err) {
      const msg = err?.shortMessage || err?.revert?.args?.[0] || err?.message || String(err);
      if (/ERC721NonexistentToken|nonexistent token/i.test(String(msg))) {
        console.log(`Token #${arg}     → ✗ does not exist on-chain`);
      } else {
        console.log(`✗ "${arg}" lookup failed: ${msg}`);
      }
    }
  }
  console.log('─'.repeat(58));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
