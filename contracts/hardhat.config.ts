import { config as loadEnv } from 'dotenv';
import { join } from 'path';
import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-ethers';

// contracts/.env is gitignored and never leaves this folder.
loadEnv({ path: join(__dirname, '.env') });

import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-ethers';

/**
 * BEL Asset NFT — Hardhat configuration.
 *
 * TESTNET-ONLY. There is deliberately NO mainnet configuration in this file.
 * The deployer private key is read from contracts/.env (gitignored) and is
 * used ONLY by deployment scripts — it is never shipped to the frontend and
 * never stored in Firebase.
 */

const DEPLOYER_KEY = process.env.CONTRACT_DEPLOYER_KEY || '';

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.24',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {},
    amoy: {
      url: process.env.AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology',
      chainId: 80002,
      accounts: DEPLOYER_KEY ? [DEPLOYER_KEY] : [],
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com',
      chainId: 11155111,
      accounts: DEPLOYER_KEY ? [DEPLOYER_KEY] : [],
    },
  },
};

export default config;
