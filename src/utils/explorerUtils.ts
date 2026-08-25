/**
 * Multi-network blockchain explorer utilities for BEL Trust Platform
 */

export type SupportedNetwork = 'Ethereum' | 'Polygon' | 'BNB Chain' | 'BEL Testnet' | 'Internal';

interface NetworkExplorerConfig {
  name: string;
  baseUrl: string;
  addressPath: string;
  txPath: string;
  isPublicExplorer: boolean;
}

const EXPLORER_CONFIGS: Record<string, NetworkExplorerConfig> = {
  Ethereum: {
    name: 'Etherscan',
    baseUrl: 'https://etherscan.io',
    addressPath: '/address/',
    txPath: '/tx/',
    isPublicExplorer: true,
  },
  Polygon: {
    name: 'Polygonscan',
    baseUrl: 'https://polygonscan.com',
    addressPath: '/address/',
    txPath: '/tx/',
    isPublicExplorer: true,
  },
  'BNB Chain': {
    name: 'BscScan',
    baseUrl: 'https://bscscan.com',
    addressPath: '/address/',
    txPath: '/tx/',
    isPublicExplorer: true,
  },
  'BEL Testnet': {
    name: 'BEL Explorer',
    baseUrl: 'https://explorer.testnet.bel.gov.in',
    addressPath: '/address/',
    txPath: '/tx/',
    isPublicExplorer: true,
  },
  Internal: {
    name: 'BEL Internal Ledger',
    baseUrl: '#',
    addressPath: '',
    txPath: '',
    isPublicExplorer: false,
  },
};

/**
 * Returns explorer URL for a given address and network
 */
export function getExplorerAddressUrl(network: string, address: string): string {
  if (!address) return '#';
  const config = EXPLORER_CONFIGS[network] || EXPLORER_CONFIGS.Ethereum;
  if (!config.isPublicExplorer || config.baseUrl === '#') {
    return '#';
  }
  return `${config.baseUrl}${config.addressPath}${address.trim()}`;
}

/**
 * Returns explorer URL for a given transaction hash and network
 */
export function getExplorerTxUrl(network: string, txHash: string): string {
  if (!txHash || txHash === 'N/A') return '#';
  const config = EXPLORER_CONFIGS[network] || EXPLORER_CONFIGS.Ethereum;
  if (!config.isPublicExplorer || config.baseUrl === '#') {
    return '#';
  }
  return `${config.baseUrl}${config.txPath}${txHash.trim()}`;
}

/**
 * Returns explorer brand name for a network
 */
export function getExplorerName(network: string): string {
  return EXPLORER_CONFIGS[network]?.name || 'Block Explorer';
}
