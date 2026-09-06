/**
 * BEL Asset NFT — testnet deployment script.
 *
 * Usage:
 *   cd contracts
 *   cp .env.example .env      # add your throwaway TESTNET deployer key
 *   npm install
 *   npm run compile
 *   npm run deploy:amoy       # Polygon Amoy (chain 80002)
 *
 * The script prints the deployed contract address — copy it into the frontend
 * .env.local as VITE_NFT_CONTRACT_ADDRESS.
 */
import { ethers, network } from 'hardhat';

const START_TOKEN_ID = Number(process.env.START_TOKEN_ID ?? '1023');
const CONTRACT_NAME = process.env.NFT_CONTRACT_NAME ?? 'BEL Asset Ownership';
const CONTRACT_SYMBOL = process.env.NFT_CONTRACT_SYMBOL ?? 'BELA';

async function main() {
  const net = await ethers.provider.getNetwork();
  console.log(`\nNetwork : ${network.name} (chainId ${net.chainId})`);
  console.log('Symbol  :', CONTRACT_SYMBOL);
  console.log('Start token id:', START_TOKEN_ID);

  const [deployer] = await ethers.getSigners();
  console.log('Deployer:', deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log('Balance :', ethers.formatEther(balance), net.chainId === 80002n ? 'POL' : 'ETH');

  if (balance === 0n) {
    console.warn('\nWARNING: deployer has zero balance — get testnet funds from a faucet first:');
    console.warn('  Amoy faucet:    https://faucet.polygon.technology/  (choose Amoy)');
    console.warn('  Alchemy faucet: https://alchemy.com/faucets/polygon-amoy');
  }

  console.log('\nDeploying BELAssetNFT…');
  const factory = await ethers.getContractFactory('BELAssetNFT');
  const contract = await factory.deploy(CONTRACT_NAME, CONTRACT_SYMBOL, START_TOKEN_ID);
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  const owner = await contract.owner();

  console.log('\n──────────────────────────────────────────────────────');
  console.log('BELAssetNFT deployed at:', address);
  console.log('Contract owner (admin) :', owner);
  console.log('──────────────────────────────────────────────────────');
  console.log('\nCopy these into the FRONTEND .env.local:\n');
  console.log(`VITE_NFT_CONTRACT_ADDRESS="${address}"`);
  console.log(`VITE_NFT_CHAIN_ID="${net.chainId.toString()}"`);
  console.log(
    net.chainId === 80002n
      ? 'VITE_NFT_NETWORK_NAME="Polygon Amoy"\nVITE_NFT_EXPLORER_TX="https://amoy.polygonscan.com/tx/"\nVITE_NFT_EXPLORER_ADDRESS="https://amoy.polygonscan.com/address/"'
      : 'VITE_NFT_NETWORK_NAME="Sepolia"\nVITE_NFT_EXPLORER_TX="https://sepolia.etherscan.io/tx/"\nVITE_NFT_EXPLORER_ADDRESS="https://sepolia.etherscan.io/address/"'
  );
  console.log(
    '\nIMPORTANT: the deployer wallet is the contract OWNER — use the SAME\n' +
      'wallet in MetaMask for admin mint/assign/transfer/burn actions.'
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
