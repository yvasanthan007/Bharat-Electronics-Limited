// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title  BELAssetNFT
 * @notice ERC-721 custody registry for Bharat Electronics Limited (BEL)
 *         digital/physical assets, deployed to an EVM TESTNET (Polygon Amoy).
 *         One token == one BEL asset (e.g. assetId "BEL-LAP-001" -> token 1023).
 *
 * ON-CHAIN DATA POLICY
 *  - ONLY public asset identifiers are stored on-chain: assetId, assetType and
 *    an optional metadataURI pointer. NO personal data, no employee names,
 *    no DIDs, no credentials and no keys are ever written to this contract.
 *  - Firestore (collection `assets/{assetId}`) keeps application metadata and
 *    blockchain references. THIS CONTRACT IS THE AUTHORITATIVE RECORD OF
 *    CUSTODY — the app must always re-verify with ownerOf().
 *
 * CUSTODY MODEL
 *  - Only the contract owner (the BEL asset admin wallet = deployer) may mint,
 *    transfer custody or revoke (burn) asset tokens via the admin functions.
 *  - Standard ERC-721 behaviour is preserved for the holding wallet, so the
 *    NFT remains fully MetaMask-compatible.
 *
 * EVENTS
 *  - AssetMinted   (mint)           + ERC-721 Transfer(0x0 -> to)
 *  - AssetAssigned (admin transfer) + ERC-721 Transfer(from -> to)
 *  - AssetRevoked  (burn)           + ERC-721 Transfer(owner -> 0x0)
 */
contract BELAssetNFT is ERC721, Ownable {
    struct AssetInfo {
        string assetId;     // e.g. "BEL-LAP-001"
        string assetType;   // e.g. "Laptop"
        string metadataURI; // optional off-chain metadata pointer (no PII)
        bool exists;
    }

    /// @dev Next token id to be minted. Token ids never decrease (burns do not
    ///      recycle ids) and start at a configurable value (default 1023).
    uint256 public nextTokenId;

    mapping(uint256 tokenId => AssetInfo) private _assets;
    mapping(string assetId => uint256 tokenId) public tokenIdByAssetId;

    event AssetMinted(
        uint256 indexed tokenId,
        string assetId,
        string assetType,
        address indexed to,
        string metadataURI
    );
    event AssetAssigned(
        uint256 indexed tokenId,
        string assetId,
        address indexed from,
        address indexed to
    );
    event AssetRevoked(
        uint256 indexed tokenId,
        string assetId,
        address indexed previousOwner
    );

    error AssetAlreadyMinted(string assetId);
    error UnknownTokenId(uint256 tokenId);
    error UnknownAssetId(string assetId);

    /**
     * @param name_         ERC-721 collection name  ("BEL Asset Ownership").
     * @param symbol_       ERC-721 collection symbol ("BELA").
     * @param startTokenId_ First token id to mint (e.g. 1023). Must be > 0 so
     *                      that tokenIdByAssetId can use 0 as "unmapped".
     */
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 startTokenId_
    ) ERC721(name_, symbol_) Ownable(msg.sender) {
        require(startTokenId_ != 0, "start token id must be non-zero");
        nextTokenId = startTokenId_;
    }

    /**
     * @notice Mint a unique NFT for a BEL asset and assign it to `to`.
     * @param assetId      Public asset identifier, e.g. "BEL-LAP-001" (unique).
     * @param assetType    Public asset type, e.g. "Laptop".
     * @param metadataURI  Optional metadata URI (IPFS/HTTPS). Keep it free of PII.
     * @param to           Recipient wallet (employee wallet or admin custody).
     */
    function mintAsset(
        string calldata assetId,
        string calldata assetType,
        string calldata metadataURI,
        address to
    ) external onlyOwner returns (uint256 tokenId) {
        if (tokenIdByAssetId[assetId] != 0) revert AssetAlreadyMinted(assetId);

        tokenId = nextTokenId;
        nextTokenId = tokenId + 1;

        _assets[tokenId] = AssetInfo({
            assetId: assetId,
            assetType: assetType,
            metadataURI: metadataURI,
            exists: true
        });
        tokenIdByAssetId[assetId] = tokenId;

        _safeMint(to, tokenId);
        emit AssetMinted(tokenId, assetId, assetType, to, metadataURI);
    }

    /**
     * @notice Admin-driven custody transfer of an asset NFT to another wallet.
     *         (Company assets move by admin decision; the holding wallet can
     *         also use the standard ERC-721 transferFrom.)
     */
    function transferAsset(uint256 tokenId, address to) external onlyOwner {
        if (!_assets[tokenId].exists) revert UnknownTokenId(tokenId);
        address from = ownerOf(tokenId);
        _safeTransfer(from, to, tokenId, "");
        emit AssetAssigned(tokenId, _assets[tokenId].assetId, from, to);
    }

    /**
     * @notice Revoke an asset NFT (e.g. asset decommissioned, employee exited).
     *         Burns the token and clears the assetId -> tokenId mapping.
     */
    function burnAsset(uint256 tokenId) external onlyOwner {
        if (!_assets[tokenId].exists) revert UnknownTokenId(tokenId);
        string memory assetId = _assets[tokenId].assetId;
        address previousOwner = ownerOf(tokenId);

        delete tokenIdByAssetId[assetId];
        delete _assets[tokenId];

        _burn(tokenId);
        emit AssetRevoked(tokenId, assetId, previousOwner);
    }

    /// @notice On-chain asset information for a token.
    function getAssetInfo(uint256 tokenId) external view returns (AssetInfo memory info) {
        if (!_assets[tokenId].exists) revert UnknownTokenId(tokenId);
        info = _assets[tokenId];
    }

    /// @notice Resolve an assetId (e.g. "BEL-LAP-001") to its on-chain owner + token id.
    function ownerOfAsset(string calldata assetId)
        external
        view
        returns (address owner, uint256 tokenId)
    {
        tokenId = tokenIdByAssetId[assetId];
        if (tokenId == 0) revert UnknownAssetId(assetId);
        owner = ownerOf(tokenId);
    }

    /// @notice Metadata URI registered at mint time (empty when not provided).
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return _assets[tokenId].metadataURI;
    }
}
