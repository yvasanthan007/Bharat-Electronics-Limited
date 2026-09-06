#!/usr/bin/env node
/**
 * sync-nft-artifact.mjs
 *
 * Copies the compiled BELAssetNFT artifact (ABI + bytecode) from the Hardhat
 * output into src/services/blockchain/artifact.ts so the frontend can talk to
 * the deployed contract and (optionally) deploy it via the admin's MetaMask.
 *
 * Usage:
 *   npm run compile:contract   (first: cd contracts && npm install)
 *   npm run sync:artifact
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const ARTIFACT = join(
  ROOT,
  'contracts',
  'artifacts',
  'contracts',
  'BELAssetNFT.sol',
  'BELAssetNFT.json'
);
const OUT = join(ROOT, 'src', 'services', 'blockchain', 'artifact.ts');

if (!existsSync(ARTIFACT)) {
  console.error(
    '✗ Compiled artifact not found.\n  Run:  npm run compile:contract\n  (and "cd contracts && npm install" first if node_modules is missing)'
  );
  process.exit(1);
}

const artifact = JSON.parse(readFileSync(ARTIFACT, 'utf8'));
if (!artifact.abi || !artifact.bytecode) {
  console.error('✗ Artifact is missing abi/bytecode fields.');
  process.exit(1);
}

const header = `/**
 * GENERATED FILE — do not edit by hand.
 * Regenerate with: npm run sync:artifact (after npm run compile:contract)
 *
 * ABI + bytecode of contracts/contracts/BELAssetNFT.sol (Hardhat artifact).
 * The bytecode enables the OPTIONAL in-app deployment via the admin's
 * MetaMask; the CLI deploy script remains the canonical deployment path.
 */
import type { InterfaceAbi } from 'ethers';

export const BEL_ASSET_NFT_ABI: InterfaceAbi = ${JSON.stringify(artifact.abi, null, 2)};

export const BEL_ASSET_NFT_BYTECODE = '${artifact.bytecode}';
`;

writeFileSync(OUT, header);
console.log('✓ Wrote', OUT);
console.log('  ABI entries :', artifact.abi.length);
console.log('  Bytecode    :', artifact.bytecode.slice(0, 18) + '… (' + artifact.bytecode.length + ' chars)');
