/**
 * Data validation helpers for BEL Trust Platform
 */

/**
 * Validates whether a string is a valid EVM-compatible hex address (0x followed by 40 hex chars)
 */
export function isValidEthereumAddress(address: string): boolean {
  if (!address) return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address.trim());
}

/**
 * Validates whether a string is a valid 32-byte hex hash (0x followed by 64 hex chars)
 */
export function isValidTxHash(hash: string): boolean {
  if (!hash) return false;
  return /^0x[a-fA-F0-9]{64}$/.test(hash.trim());
}

/**
 * Sanitizes input text to prevent injection or invalid characters
 */
export function sanitizeString(input: string): string {
  if (!input) return '';
  return input.trim().replace(/[<>]/g, '');
}

/**
 * Validates smart contract creation payload
 */
export function validateContractPayload(payload: {
  name?: string;
  type?: string;
  network?: string;
  owner?: string;
}): { isValid: boolean; error?: string } {
  if (!payload.name || payload.name.trim().length === 0) {
    return { isValid: false, error: 'Contract name is required' };
  }
  if (!payload.type) {
    return { isValid: false, error: 'Contract type is required' };
  }
  if (!payload.network) {
    return { isValid: false, error: 'Network is required' };
  }
  if (payload.owner && !isValidEthereumAddress(payload.owner)) {
    return { isValid: false, error: 'Invalid owner address format (must be 0x... 40 hex characters)' };
  }
  return { isValid: true };
}
