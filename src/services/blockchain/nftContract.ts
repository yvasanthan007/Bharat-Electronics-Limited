import { BrowserProvider, Contract, JsonRpcProvider, ethers } from 'ethers';
import {
  NFT_CHAIN_ID,
  NFT_CONTRACT_ADDRESS,
  NFT_CONTRACT_NAME,
  NFT_CONTRACT_SYMBOL,
  NFT_EXPLORER_TX,
  NFT_NETWORK_NAME,
  NFT_RPC_URL,
  NFT_START_TOKEN_ID,
  chainIdHex,
  isNftContractConfigured,
} from '../../config/blockchain';
import { BEL_ASSET_NFT_ABI, BEL_ASSET_NFT_BYTECODE } from './artifact';

/**
 * BEL Asset NFT — on-chain contract service (ethers v6).
 *
 * READS  : public JSON-RPC provider (no wallet needed) — used for ownership
 *          verification. ownerOf() IS THE SOURCE OF TRUTH.
 * WRITES : the admin's connected browser wallet (MetaMask) signs mint /
 *          transfer / burn transactions. NO private key is ever read, stored
 *          or transmitted by this module.
 *
 * The current "blockchain" audit layer (src/lib/did/blockchainLayer.ts) is a
 * local demo ledger; THIS module talks to the real testnet and must not mock
 * anything.
 */

export class BlockchainConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BlockchainConfigError';
  }
}

export interface ChainTxResult {
  txHash: string;
  blockNumber?: number;
  tokenId?: number;
}

/* ------------------------------- read side -------------------------------- */

let _readProvider: JsonRpcProvider | null = null;

/** Shared read-only provider for ownership verification (no wallet needed). */
export function getReadProvider(): JsonRpcProvider {
  if (!_readProvider) {
    _readProvider = new JsonRpcProvider(NFT_RPC_URL, NFT_CHAIN_ID, {
      staticNetwork: true,
    });
  }
  return _readProvider;
}

export function getReadContract(): Contract {
  if (!isNftContractConfigured()) {
    throw new BlockchainConfigError(
      'NFT contract address is not configured. Set VITE_NFT_CONTRACT_ADDRESS in .env.local.'
    );
  }
  return new Contract(NFT_CONTRACT_ADDRESS, BEL_ASSET_NFT_ABI, getReadProvider());
}

/** ownerOf(tokenId) — THE authoritative ownership answer. */
export async function ownerOfTokenId(tokenId: number | string): Promise<string> {
  const contract = getReadContract();
  return (await contract.ownerOf(tokenId)) as string;
}

export interface OnChainAssetInfo {
  assetId: string;
  assetType: string;
  metadataURI: string;
}

export async function getAssetInfoOnChain(
  tokenId: number | string
): Promise<OnChainAssetInfo | null> {
  try {
    const info = await getReadContract().getAssetInfo(tokenId);
    return {
      assetId: info[0] as string,
      assetType: info[1] as string,
      metadataURI: info[2] as string,
    };
  } catch {
    return null;
  }
}

/** tokenId registered for an assetId on-chain (null when un-minted). */
export async function tokenIdForAssetId(assetId: string): Promise<number | null> {
  try {
    const id = (await getReadContract().tokenIdByAssetId(assetId)) as bigint;
    const n = Number(id);
    return n === 0 ? null : n;
  } catch {
    return null;
  }
}

/** owner + tokenId for an assetId (null when un-minted / RPC failure). */
export async function ownerOfAssetId(
  assetId: string
): Promise<{ owner: string; tokenId: number } | null> {
  try {
    const [currentOwner, tokenId] = (await getReadContract().ownerOfAsset(assetId)) as [
      string,
      bigint,
    ];
    return { owner: currentOwner as string, tokenId: Number(tokenId) };
  } catch {
    return null;
  }
}

/** Latest block number of the configured network (connectivity probe). */
export async function getLatestBlockNumber(): Promise<number> {
  return getReadProvider().getBlockNumber();
}

/* ------------------------------- write side ------------------------------- */

interface Eip1193Provider {
  request(args: { method: string; params?: unknown[] | object }): Promise<unknown>;
}

function requireBrowserWallet(): Eip1193Provider {
  const eth = (window as { ethereum?: Eip1193Provider }).ethereum;
  if (!eth) {
    throw new BlockchainConfigError(
      'MetaMask (or another EVM browser wallet) is required for admin blockchain actions.'
    );
  }
  return eth;
}

/**
 * Ensures the connected wallet is on the configured testnet; asks the user to
 * switch/add the network when it is not.
 */
export async function ensureWalletChain(): Promise<void> {
  const eth = requireBrowserWallet();
  try {
    await eth.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex() }],
    });
  } catch (err: unknown) {
    const code = (err as { code?: number })?.code;
    if (code === 4902 || code === -32603) {
      // Unrecognized chain — add it, then retry the switch.
      const addParams = [
        {
          chainId: chainIdHex(),
          chainName: NFT_NETWORK_NAME,
          nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
          rpcUrls: [NFT_RPC_URL],
          blockExplorerUrls: [NFT_EXPLORER_TX.replace(/tx\/?$/, '')],
        },
      ];
      await eth.request({ method: 'wallet_addEthereumChain', params: addParams });
      await eth.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex() }],
      });
      return;
    }
    if (code === 4001) {
      throw new Error('Network switch was rejected in the wallet.');
    }
    throw err;
  }
}

/** Connects the ADMIN wallet (MetaMask only — no demo fallback for writes). */
export async function connectAdminWallet(): Promise<string> {
  const eth = requireBrowserWallet();
  const accounts = (await eth.request({
    method: 'eth_requestAccounts',
  })) as string[];
  if (!accounts || accounts.length === 0) {
    throw new Error('No accounts returned by the wallet.');
  }
  await ensureWalletChain();
  return ethers.getAddress(accounts[0] as string);
}

/** Currently connected admin wallet (no prompt) or null. */
export async function getConnectedAdminWallet(): Promise<string | null> {
  const eth = (window as { ethereum?: Eip1193Provider }).ethereum;
  if (!eth) return null;
  try {
    const accounts = (await eth.request({ method: 'eth_accounts' })) as string[];
    return accounts && accounts.length > 0 ? ethers.getAddress(accounts[0] as string) : null;
  } catch {
    return null;
  }
}

async function getWriteContract(): Promise<{ contract: Contract; adminAddress: string }> {
  if (!isNftContractConfigured()) {
    throw new BlockchainConfigError(
      'NFT contract address is not configured. Set VITE_NFT_CONTRACT_ADDRESS in .env.local.'
    );
  }
  const eth = requireBrowserWallet();
  const provider = new BrowserProvider(eth, 'any');
  const signer = await provider.getSigner();
  const adminAddress = ethers.getAddress(await signer.getAddress());
  const contract = new Contract(NFT_CONTRACT_ADDRESS, BEL_ASSET_NFT_ABI, signer);
  return { contract, adminAddress };
}

/** True when the connected wallet owns the contract (admin custody rights). */
export async function isAdminContractOwner(): Promise<boolean> {
  const { contract, adminAddress } = await getWriteContract();
  const owner = (await contract.owner()) as string;
  return owner.toLowerCase() === adminAddress.toLowerCase();
}

/** Extracts a readable message from a contract/wallet error. */
export function toTxErrorMessage(err: unknown): string {
  const e = err as {
    code?: number | string;
    reason?: string;
    shortMessage?: string;
    message?: string;
  };
  if (e?.code === 'ACTION_REJECTED' || e?.code === 4001) {
    return 'Transaction was rejected in the wallet — nothing was changed on-chain.';
  }
  if (e?.reason === 'AssetAlreadyMinted' || e?.message?.includes('AssetAlreadyMinted')) {
    return 'This assetId already has an NFT on-chain.';
  }
  if (e?.reason === 'OwnableUnauthorizedAccount') {
    return 'Connected wallet is not the contract owner — mint/transfer/burn requires the admin (deployer) wallet.';
  }
  return e?.shortMessage || e?.reason || e?.message || 'Blockchain transaction failed.';
}

function extractEventArg(
  contract: Contract,
  receipt: { logs: Array<{ topics: string[]; data: string }> },
  eventName: string,
  argName: string
): unknown {
  for (const log of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog({
        topics: [...log.topics],
        data: log.data,
      });
      if (parsed && parsed.name === eventName) {
        return parsed.args[argName];
      }
    } catch {
      /* log from another contract — ignore */
    }
  }
  return undefined;
}

async function requireAdminOwner(contract: Contract, adminAddress: string): Promise<void> {
  const owner = (await contract.owner()) as string;
  if (owner.toLowerCase() !== adminAddress.toLowerCase()) {
    throw new BlockchainConfigError(
      `Connected wallet ${adminAddress} is not the contract owner (${owner}). Switch MetaMask to the admin (deployer) account.`
    );
  }
}

/** Mints the asset NFT. Returns the confirmed tx hash + on-chain tokenId. */
export async function mintAssetNft(params: {
  assetId: string;
  assetType: string;
  metadataURI?: string;
  to: string;
}): Promise<ChainTxResult> {
  const { contract, adminAddress } = await getWriteContract();
  await requireAdminOwner(contract, adminAddress);

  const tx = await contract.mintAsset(
    params.assetId,
    params.assetType,
    params.metadataURI || '',
    ethers.getAddress(params.to)
  );
  const receipt = await tx.wait(1);
  if (!receipt) {
    throw new Error('Mint transaction was submitted but not yet mined.');
  }
  const tokenIdRaw = extractEventArg(contract, receipt, 'AssetMinted', 'tokenId');
  if (tokenIdRaw === undefined) {
    throw new Error('Mint confirmed but the AssetMinted event was not found in the receipt.');
  }
  return { txHash: receipt.hash, blockNumber: receipt.blockNumber, tokenId: Number(tokenIdRaw) };
}

/** Admin custody transfer of an asset NFT to another wallet. */
export async function transferAssetNft(
  tokenId: number | string,
  to: string
): Promise<ChainTxResult> {
  const { contract, adminAddress } = await getWriteContract();
  await requireAdminOwner(contract, adminAddress);

  const tx = await contract.transferAsset(tokenId, ethers.getAddress(to));
  const receipt = await tx.wait(1);
  if (!receipt) {
    throw new Error('Transfer transaction was submitted but not yet mined.');
  }
  const tokenIdRaw = extractEventArg(contract, receipt, 'AssetAssigned', 'tokenId');
  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    tokenId: tokenIdRaw !== undefined ? Number(tokenIdRaw) : undefined,
  };
}

/** Revokes (burns) an asset NFT. */
export async function burnAssetNft(tokenId: number | string): Promise<ChainTxResult> {
  const { contract, adminAddress } = await getWriteContract();
  await requireAdminOwner(contract, adminAddress);

  const tx = await contract.burnAsset(tokenId);
  const receipt = await tx.wait(1);
  if (!receipt) {
    throw new Error('Burn transaction was submitted but not yet mined.');
  }
  const tokenIdRaw = extractEventArg(contract, receipt, 'AssetRevoked', 'tokenId');
  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    tokenId: tokenIdRaw !== undefined ? Number(tokenIdRaw) : undefined,
  };
}

/**
 * OPTIONAL in-app deployment via the admin's MetaMask (the CLI deploy script
 * in contracts/ remains the canonical path). Requires the compiled bytecode —
 * see artifact.ts / `npm run sync:artifact`.
 */
export async function deployBelAssetNftContract(): Promise<{ address: string; txHash: string }> {
  if (!BEL_ASSET_NFT_BYTECODE) {
    throw new BlockchainConfigError(
      'Compiled bytecode is not bundled. Deploy via the CLI instead: cd contracts && npm run deploy:amoy'
    );
  }
  await ensureWalletChain();
  const eth = requireBrowserWallet();
  const provider = new BrowserProvider(eth, 'any');
  const signer = await provider.getSigner();
  const factory = new ethers.ContractFactory(
    BEL_ASSET_NFT_ABI as unknown as ethers.InterfaceAbi,
    BEL_ASSET_NFT_BYTECODE,
    signer
  );
  const contract = await factory.deploy(NFT_CONTRACT_NAME, NFT_CONTRACT_SYMBOL, NFT_START_TOKEN_ID);
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  return { address, txHash: contract.deploymentTransaction()?.hash ?? '' };
}

export const NFT_CONFIG = {
  networkName: NFT_NETWORK_NAME,
  chainId: NFT_CHAIN_ID,
  contractAddress: NFT_CONTRACT_ADDRESS,
  configured: isNftContractConfigured(),
};

