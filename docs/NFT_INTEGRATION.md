# BEL Asset NFT Integration — NFT-Based Asset Ownership

> **Status:** Implemented on branch `Development2` · **Testnet only:** Polygon Amoy (chain `80002`)
> **Blockchain = source of truth for NFT ownership.** Firestore stores metadata + blockchain references only. No private keys are stored in Firebase, frontend code, or the contract.

---

## 1. Files Created

**Smart contract workspace (`contracts/` — isolated, own `package.json`)**
- `contracts/contracts/BELAssetNFT.sol` — ERC-721 asset custody contract (OpenZeppelin 5.0.2, Solidity 0.8.24)
- `contracts/hardhat.config.ts` — Hardhat config, Amoy + Sepolia testnets only (no mainnet config exists)
- `contracts/package.json`, `contracts/tsconfig.json` — isolated tooling
- `contracts/scripts/deploy.ts` — testnet deployment script (prints address + env lines)
- `contracts/.env.example`, `contracts/.gitignore` — deployer-key template (real `.env` gitignored)

**Frontend — blockchain layer (clean, isolated structure)**
- `src/config/blockchain.ts` — all NFT env config (RPC, chain id, contract address, explorer links)
- `src/services/blockchain/artifact.ts` — GENERATED Hardhat artifact (ABI + bytecode) via `npm run sync:artifact`
- `src/services/blockchain/nftContract.ts` — ethers v6 wrapper: reads via public RPC, writes via admin MetaMask
- `src/services/blockchain/assetRegistry.ts` — Firestore `assets/{assetId}` CRUD + **live `ownerOf()` verification**
- `src/services/blockchain/nftVerification.ts` — post-RBAC session verification + cached results + session wallet resolver
- `src/hooks/blockchain/useNftAssets.ts` — React hook: load assigned assets + verify each on-chain (progressive)

**Frontend — admin & employee UI**
- `src/pages/AssetManagement.tsx` — admin section: create / mint / assign / transfer / revoke / verify
- `src/components/assets/nft/AssetCreateModal.tsx` — create asset record (pre-mint)
- `src/components/assets/nft/MintModal.tsx` — mint NFT (admin custody or direct-to-employee)
- `src/components/assets/nft/TransferModal.tsx` — assign / transfer token to an employee
- `src/components/assets/nft/BurnModal.tsx` — revoke (burn) token with type-to-confirm
- `src/components/assets/nft/EmployeePicker.tsx` — employee dropdown from the EXISTING Firestore `employees` collection
- `src/components/assets/nft/MyNftAssetsPanel.tsx` — employee "My Assets" panel with live ownership badges

**Other**
- `scripts/sync-nft-artifact.mjs` — copies compiled ABI/bytecode into `src/services/blockchain/artifact.ts`
- `scripts/verify-nft.mjs` — read-only on-chain checker (`npm run check:nft -- BEL-LAP-001 1023`); verifies ownership straight from the RPC without the UI
- `docs/NFT_INTEGRATION.md` — this document

## 2. Files Modified (additive — no existing feature removed)

| File | Change |
|---|---|
| `src/components/AuthCard.tsx` | **One new login step** `NFT Ownership` (index 8) inserted between RBAC and Dashboard (Dashboard now index 9). `completeDidAuth` awaits a live `ownerOf()` verification of the session wallet's assets, then continues to the dashboard regardless of the result (auth is never re-checked or revoked). Result cached to `sessionStorage['bel_nft_verification']`. |
| `src/components/Sidebar.tsx` | Added nav item **Asset Management** → `/bel/asset-management` (icon `Boxes`). |
| `src/App.tsx` | Added import + route `asset-management` under the existing `/bel` admin guard. |
| `src/pages/user/MyAssets.tsx` | Renders `<MyNftAssetsPanel variant="full" />` above the existing registry table. |
| `src/pages/user/UserDashboard.tsx` | Renders `<MyNftAssetsPanel variant="compact" />` between the KPI cards and Recent Activity. |
| `.env.example` / `.env.local` | Added `VITE_NFT_*` variables (see §5). |
| `firestore.rules` | Added `match /assets/{assetId}`: read public, write authenticated + no-private-key + status enum, delete forbidden. |
| `package.json` | Added scripts: `compile:contract`, `deploy:contract:amoy`, `sync:artifact`. |

**Nothing else was changed.** Login, DID verification, wallet connection, challenge generation, signature verification, RBAC, dashboards, the mock `blockchainLayer` audit events, and the Digital Assets portfolio page are untouched.

## 3. Smart Contract (`contracts/contracts/BELAssetNFT.sol`)

ERC-721 (`@openzeppelin/contracts@5.0.2`) + `Ownable`. **One token = one BEL asset.**

- `mintAsset(assetId, assetType, metadataURI, to) → tokenId` — onlyOwner; unique `assetId`; ids auto-increment from `START_TOKEN_ID` (default **1023** per the spec example)
- `transferAsset(tokenId, to)` — onlyOwner admin custody transfer (`_safeTransfer`)
- `burnAsset(tokenId)` — onlyOwner revoke/burn; clears `assetId → tokenId` mapping; ids never recycled
- `ownerOf(tokenId)` — inherited ERC-721 (**the authoritative ownership check**)
- `getAssetInfo(tokenId)` / `ownerOfAsset(assetId)` / `tokenIdByAssetId(assetId)` / `tokenURI(tokenId)`
- Events: `AssetMinted`, `AssetAssigned`, `AssetRevoked` + standard ERC-721 `Transfer` (mint, assignment, transfer, revocation all covered)

On-chain storage holds **only public asset identifiers** (`assetId`, `assetType`, `metadataURI`). No names, DIDs, credentials, or keys ever touch the chain.

## 4. Testnet Deployment (Polygon Amoy)

```powershell
cd contracts
npm install
copy .env.example .env        # then edit .env — see below
npm run compile               # or from repo root: npm run compile:contract
npm run deploy:amoy           # or from repo root: npm run deploy:contract:amoy
```

`contracts/.env` needs a **throwaway, faucet-funded TESTNET key** (used only by this deploy script — never shipped to the frontend, never stored in Firebase):

```
CONTRACT_DEPLOYER_KEY=0x…      # testnet wallet ONLY
AMOY_RPC_URL=https://rpc-amoy.polygon.technology
START_TOKEN_ID=1023
```

Faucets: <https://faucet.polygon.technology> (choose **Amoy**) or <https://alchemy.com/faucets/polygon-amoy>.

The deploy script prints the contract address and the exact env lines. Then:

```powershell
npm run sync:artifact         # refresh ABI/bytecode in src/services/blockchain/artifact.ts
npm run dev                   # restart Vite so new env vars load
```

**The deployer wallet = contract owner = the admin wallet.** Import that same wallet into MetaMask and use it on the Asset Management page. (Optional: with bytecode synced, the admin can also deploy from the browser via MetaMask — keys never leave MetaMask either way.)

## 5. Environment Variables (frontend `.env.local`)

| Variable | Value / Purpose |
|---|---|
| `VITE_NFT_NETWORK_NAME` | `"Polygon Amoy"` (display) |
| `VITE_NFT_RPC_URL` | `https://rpc-amoy.polygon.technology` (public read RPC, no key needed) |
| `VITE_NFT_CHAIN_ID` | `80002` |
| `VITE_NFT_CONTRACT_ADDRESS` | Deployed `0x…` address (empty until deployed) |
| `VITE_NFT_START_TOKEN_ID` | `1023` |
| `VITE_NFT_EXPLORER_TX` | `https://amoy.polygonscan.com/tx/` |
| `VITE_NFT_EXPLORER_ADDRESS` | `https://amoy.polygonscan.com/address/` |

`contracts/.env` (gitignored, deploy-script only): `CONTRACT_DEPLOYER_KEY`, `AMOY_RPC_URL`, `SEPOLIA_RPC_URL`, `START_TOKEN_ID`, `NFT_CONTRACT_NAME`, `NFT_CONTRACT_SYMBOL`.

## 6. Firestore Schema

**New collection `assets/{assetId}`** (doc id = Asset ID):

```jsonc
{
  "assetId":            "BEL-LAP-001",
  "assetType":          "Laptop",
  "description":        "Engineering laptop — R&D Bay 2",  // optional
  "tokenId":            1023,                              // set at mint
  "contractAddress":    "0x…",                             // set at mint
  "blockchainNetwork":  "Polygon Amoy",
  "ownerWallet":        "0xabc…",  // ⚠ DISPLAY CACHE ONLY — ownerOf() is authoritative
  "ownerDID":           "did:ethr:0x…",
  "ownerEmployeeId":    "BEL1015",
  "ownerName":          "Aditya",
  "status":             "Created" | "Active" | "Revoked",
  "mintTxHash":         "0x…",
  "lastTransferTxHash": "0x…",
  "burnTxHash":         "0x…",
  "createdBy":          "BEL Admin",
  "createdAt":          "2026-…ISO…",
  "updatedAt":          "2026-…ISO…",
  "history": [ { "action": "NFT Minted (token #1023)", "txHash": "0x…", "at": "…", "by": "…" } ]
}
```

The existing `employees/{employeeId}` collection is **reused as-is** for assignment targets (no duplicate employee DB) — the DID-linked `walletAddress` there is the assignment wallet. Audit entries go to the existing `auditLogs` collection via `createAuditLog`.

## 7. Exact Flows

**Admin asset management** (`/bel/asset-management`):
1. Login as Admin → **Asset Management** (new sidebar item).
2. **Connect Admin Wallet** (MetaMask; auto-switches/asks to add Polygon Amoy; badge shows *Contract Owner* when correct).
3. **Create Asset** — e.g. `BEL-LAP-001` / `Laptop` → Firestore `assets/BEL-LAP-001` (`status: Created`).
4. **Mint** → MetaMask signs `mintAsset(...)`; on-chain receipt yields **NFT #1023** + tx hash → *only then* Firestore is updated (`tokenId`, `mintTxHash`, `status: Active`). Mint to admin wallet (custody) or directly to the employee.
5. **Assign** → pick employee (from existing Firestore employees; shows wallet + DID) → MetaMask signs `transferAsset(1023, 0xAditya…)` → on confirmation Firestore stores `ownerWallet/ownerDID/ownerName/lastTransferTxHash`.
6. Row **Verify** → live `ownerOf()` vs cache; **Revoke** → type-to-confirm burn.

**Employee NFT verification** (existing flow + one step):
1. Email/password → 2. DID verification → 3. Connect wallet → 4. Firebase server challenge → 5. Wallet signature → 6. Signature verification → 7. RBAC → **8. NFT Ownership** *(new)*: the system loads assets referenced to the session wallet/DID and calls `ownerOf(tokenId)` on Amoy for each; the step shows `Blockchain confirms ownership of 1/1 asset NFT(s): BEL-LAP-001 #1023` or `Asset ownership could not be verified — NFT-protected assets are denied. Your identity & RBAC session remains active.` → 9. Dashboard. The dashboard + My Assets pages then render live badges (`Verified ✓` / `Unverified`) from the same on-chain check with a **Re-verify** button.

**Wallet/DID linking (G):** assignment uses the employee's DID-linked `walletAddress` from Firestore; verification compares the signature-verified session wallet against `ownerOf()`; mismatches deny the protected asset view.

## 8. How to Test (demo script)

**One-time setup:** deploy (§4), set `VITE_NFT_CONTRACT_ADDRESS`, import the admin (deployer) wallet into MetaMask and fund it from the Amoy faucet. For "Aditya", either use a provisioned employee wallet (`scripts/provision-did.mjs`, keys in `scripts/.did-keys/*.json`) or generate a wallet, and make sure the Firestore `employees/{employeeId}.walletAddress` equals it.

| Test | Steps | Expected |
|---|---|---|
| **Mint** | Admin → Asset Management → Create `BEL-LAP-001` (Laptop) → Mint → confirm in MetaMask | NFT `#1023` created on Amoy; row shows token id, mint tx (Polygonscan link); `assets/BEL-LAP-001.status = Active` only after confirmation |
| **Assign** | Row → Assign → pick Aditya → confirm tx | `transferAsset` event on-chain; Firestore `ownerWallet/ownerDID` updated with `lastTransferTxHash` |
| **Verify (owner)** | Login as Aditya → DID flow → after RBAC the NFT step runs; check `/user` dashboard + `/user/assets` | Step: *Blockchain confirms ownership… BEL-LAP-001 #1023*; dashboard card: `BEL-LAP-001 · Laptop · NFT #1023 · Verified ✓ · Status: Active` |
| **Attacker (signature layer)** | Existing attacker toggle in AuthCard signs with a random key | Signature verification fails — unchanged behavior, now proven on-chain-adjacent |
| **Attacker (NFT layer)** | Different employee (or Aditya's creds + different wallet that passed signature verification) logs in; wallet ≠ NFT owner | DID/RBAC login still succeeds; NFT step shows `Asset ownership could not be verified`; dashboard badge `Unverified` and the NFT-protected asset view is denied — auth is NOT re-issued or revoked |
| **Transfer** | Admin → Transfer → pick Ravi → confirm tx → Aditya logs in again → Ravi logs in | On-chain owner becomes Ravi; Firestore reference updates; Aditya's verification returns false (asset denied); Ravi's returns true |
| **Revoke** | Admin → Revoke → type `BEL-LAP-001` → confirm burn | Token burned on-chain (`AssetRevoked`); `status: Revoked`; verification fails for everyone |
| **Tx failure safety** | Reject any MetaMask prompt | Error shown ("nothing was changed on-chain"); Firestore untouched for mint/transfer/burn |
| **Direct chain check** | `npm run check:nft -- BEL-LAP-001 1023` | Read-only RPC check (no UI, no keys): prints contract owner, `nextTokenId`, and the **live** owner of the asset/token — the authoritative answer the UI must match |

## 9. Security Considerations

1. **Blockchain is the single source of truth** — every badge/check is a live `ownerOf(tokenId)` call via `verifyAssetOwnershipOnChain()`; the Firestore `ownerWallet` field is display-only and is never used for an authorization decision.
2. **No private keys anywhere** — frontend/`assets` collection/Firestore rules all forbid key fields (`hasPrivateKey`); admin actions are signed by MetaMask in-browser; only the gitignored, testnet-only `contracts/.env` deploy key exists, used solely by the CLI deploy script.
3. **Write-after-confirm** — Firestore metadata is updated only after `tx.wait(1)`; rejected/failed transactions change nothing (transfer test proves this).
4. **Admin custody** — `mintAsset/transferAsset/burnAsset` are `onlyOwner`; the UI pre-checks `owner()` and warns when the connected wallet is not the contract owner.
5. **Auth decoupling** — an NFT failure never invalidates the DID/RBAC session; only the NFT-protected asset/resource is denied (spec D), and the denial is visible in the login step trail.
6. **No PII on-chain** — the contract stores `assetId`/`assetType`/`metadataURI` only; names/DIDs stay in Firestore.
7. **Tamper-evidence** — mint/transfer/burn tx hashes are stored per asset and linked to Polygonscan; `assets` documents cannot be deleted (rules), and every action is appended to the immutable `auditLogs` ledger.
8. **Testnet isolation** — the Hardhat config contains no mainnet network; the demo wallet mnemonic / faucet keys must never hold real funds.

## 10. Known Limitations / Notes

- `VITE_NFT_CONTRACT_ADDRESS` empty → the UI shows a setup banner and verification gracefully reports `CONTRACT_NOT_CONFIGURED` (no crashes).
- Ownership reads use the public Amoy RPC; if rate-limited, verification reports `RPC_ERROR` (deny-by-default, never a silent "verified").
- The pre-existing `src/lib/did/blockchainLayer.ts` mock ledger (login audit events) and the Digital Assets portfolio page were intentionally left untouched — this feature adds a REAL chain integration alongside them.
- `npm run lint` (oxlint): 0 errors on all new files. `npm run build` (tsc + vite): passing.



