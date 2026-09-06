/**
 * BEL Asset NFT — blockchain configuration.
 *
 * All values come from Vite env variables (non-secret configuration only).
 * PRIVATE KEYS ARE NEVER READ HERE — admin transactions are signed by the
 * admin's connected browser wallet (MetaMask) and ownership reads use the
 * public RPC endpoint.
 */

export const NFT_NETWORK_NAME = String(
  import.meta.env.VITE_NFT_NETWORK_NAME || 'Polygon Amoy'
);

export const NFT_RPC_URL = String(
  import.meta.env.VITE_NFT_RPC_URL || 'https://rpc-amoy.polygon.technology'
);

export const NFT_CHAIN_ID = Number(import.meta.env.VITE_NFT_CHAIN_ID || 80002);

export const NFT_CONTRACT_ADDRESS = String(
  import.meta.env.VITE_NFT_CONTRACT_ADDRESS || ''
).trim();

export const NFT_CONTRACT_NAME = 'BEL Asset Ownership';
export const NFT_CONTRACT_SYMBOL = 'BELA';

/** First token id minted by the contract (spec example: BEL-LAP-001 -> 1023). */
export const NFT_START_TOKEN_ID = Number(
  import.meta.env.VITE_NFT_START_TOKEN_ID || 1023
);

export const NFT_EXPLORER_TX = String(
  import.meta.env.VITE_NFT_EXPLORER_TX || 'https://amoy.polygonscan.com/tx/'
);

export const NFT_EXPLORER_ADDRESS = String(
  import.meta.env.VITE_NFT_EXPLORER_ADDRESS || 'https://amoy.polygonscan.com/address/'
);

/** True when a syntactically valid contract address is configured. */
export function isNftContractConfigured(): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(NFT_CONTRACT_ADDRESS);
}

/** Explorer link for a transaction hash (undefined when unavailable). */
export function txExplorerUrl(txHash?: string | null): string | undefined {
  if (!txHash || txHash === 'N/A') return undefined;
  return `${NFT_EXPLORER_TX}${txHash}`;
}

/** Explorer link for an address (undefined when unavailable). */
export function addressExplorerUrl(address?: string | null): string | undefined {
  if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address)) return undefined;
  return `${NFT_EXPLORER_ADDRESS}${address}`;
}

/** Short display form of an address: 0x1234…abcd */
export function shortAddress(address?: string | null, size = 4): string {
  if (!address) return '—';
  const a = address.trim();
  if (a.length <= size * 2 + 2) return a;
  return `${a.slice(0, size + 2)}…${a.slice(-size)}`;
}

/** hex chain id for wallet_switchEthereumChain / wallet_addEthereumChain. */
export function chainIdHex(): string {
  return `0x${NFT_CHAIN_ID.toString(16)}`;
}
