import crypto from 'crypto';

export interface OnChainDIDRecord {
  did: string;
  publicKey: string;
  ownerAddress: string;
  role: string;
  status: 'ACTIVE' | 'DEACTIVATED' | 'REVOKED';
  registeredAt: string;
  updatedAt: string;
  txHash: string;
  blockNumber: number;
}

/**
 * On-Chain DID Registry Smart Contract Simulation
 *
 * Implements the decentralized registry interface:
 * - registerDID(did, publicKey, ownerAddress, role)
 * - getDID(did)
 * - updateStatus(did, status)
 * - deactivateDID(did)
 *
 * SECURITY:
 * Never stores private keys, passwords, personal documents, or PII on-chain.
 */
class DIDRegistryContract {
  private registry: Map<string, OnChainDIDRecord> = new Map();
  private currentBlock: number = 3450100;

  private generateTxHash(): string {
    return `0x${crypto.randomBytes(32).toString('hex')}`;
  }

  async registerDID(params: {
    did: string;
    publicKey: string;
    ownerAddress: string;
    role?: string;
  }): Promise<{ txHash: string; blockNumber: number; record: OnChainDIDRecord }> {
    this.currentBlock += 1;
    const now = new Date().toISOString();
    const txHash = this.generateTxHash();

    const record: OnChainDIDRecord = {
      did: params.did,
      publicKey: params.publicKey,
      ownerAddress: params.ownerAddress.toLowerCase(),
      role: params.role || 'USER',
      status: 'ACTIVE',
      registeredAt: now,
      updatedAt: now,
      txHash,
      blockNumber: this.currentBlock,
    };

    this.registry.set(params.did, record);
    return { txHash, blockNumber: this.currentBlock, record };
  }

  async getDID(did: string): Promise<OnChainDIDRecord | null> {
    return this.registry.get(did) || null;
  }

  async updateStatus(
    did: string,
    status: 'ACTIVE' | 'DEACTIVATED' | 'REVOKED'
  ): Promise<{ txHash: string; success: boolean }> {
    const record = this.registry.get(did);
    if (!record) {
      throw new Error(`DID ${did} not found on DID Registry contract`);
    }

    this.currentBlock += 1;
    const txHash = this.generateTxHash();
    record.status = status;
    record.updatedAt = new Date().toISOString();
    record.txHash = txHash;
    record.blockNumber = this.currentBlock;

    return { txHash, success: true };
  }

  async deactivateDID(did: string): Promise<{ txHash: string; success: boolean }> {
    return this.updateStatus(did, 'DEACTIVATED');
  }

  async getAllOnChainDIDs(): Promise<OnChainDIDRecord[]> {
    return Array.from(this.registry.values());
  }
}

export const didRegistryContract = new DIDRegistryContract();
