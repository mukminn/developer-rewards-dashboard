// SPDX-License-Identifier: MIT
pragma solidity ^0.8.31;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./FeeCollector.sol";

/**
 * @title FeeNFT
 * @dev NFT contract dengan fee system untuk minting
 */
contract FeeNFT is ERC721URIStorage, Ownable, ReentrancyGuard {
    FeeCollector public feeCollector;
    
    uint256 private _tokenIdCounter;
    uint256 public mintPriceEth; // Harga mint dalam wei (ETH)
    uint256 public mintPriceUsdc; // Harga mint dalam USDC (6 decimals)
    
    uint256 public maxSupply;
    bool public mintingEnabled;
    
    // Mapping untuk track minted tokens
    mapping(uint256 => string) private _tokenURIs;
    
    // Events
    event NFTMinted(address indexed to, uint256 indexed tokenId, uint256 ethPaid, uint256 usdcPaid, bool paidWithEth);
    event MintPriceUpdated(uint256 newEthPrice, uint256 newUsdcPrice);
    
    constructor(
        string memory name,
        string memory symbol,
        address _feeCollector,
        uint256 _mintPriceEth,
        uint256 _mintPriceUsdc,
        uint256 _maxSupply
    ) ERC721(name, symbol) Ownable(msg.sender) {
        feeCollector = FeeCollector(_feeCollector);
        mintPriceEth = _mintPriceEth;
        mintPriceUsdc = _mintPriceUsdc;
        maxSupply = _maxSupply;
        mintingEnabled = true;
        _tokenIdCounter = 0;
    }
    
    /**
     * @dev Mint NFT dengan membayar fees dalam ETH
     * @param to Address yang akan menerima NFT
     * @param tokenURI URI metadata untuk NFT
     */
    function mint(address to, string memory tokenURI) external payable nonReentrant {
        require(mintingEnabled, "Minting is disabled");
        require(_tokenIdCounter < maxSupply, "Max supply reached");
        require(msg.value >= mintPriceEth, "Insufficient payment");
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        // Transfer fees ke FeeCollector
        (bool success, ) = address(feeCollector).call{value: mintPriceEth}("");
        require(success, "Fee transfer failed");
        
        // Record fees di FeeCollector
        feeCollector.collectFees(mintPriceEth, mintPriceUsdc);
        
        // Refund excess payment
        if (msg.value > mintPriceEth) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - mintPriceEth}("");
            require(refundSuccess, "Refund failed");
        }
        
        emit NFTMinted(to, tokenId, mintPriceEth, mintPriceUsdc, true);
    }
    
    /**
     * @dev Mint NFT dengan membayar fees dalam USDC
     * @param to Address yang akan menerima NFT
     * @param tokenURI URI metadata untuk NFT
     */
    function mintWithUsdc(address to, string memory tokenURI) external nonReentrant {
        require(mintingEnabled, "Minting is disabled");
        require(_tokenIdCounter < maxSupply, "Max supply reached");
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        // Transfer USDC fees ke FeeCollector
        feeCollector.collectFeesUsdc(mintPriceUsdc);
        
        emit NFTMinted(to, tokenId, 0, mintPriceUsdc, false);
    }
    
    /**
     * @dev Batch mint multiple NFTs dengan ETH
     * @param to Address yang akan menerima NFT
     * @param tokenURIs Array of URIs untuk setiap NFT
     * @param quantity Jumlah NFT yang akan di-mint
     */
    function batchMint(
        address to,
        string[] memory tokenURIs,
        uint256 quantity
    ) external payable nonReentrant {
        require(mintingEnabled, "Minting is disabled");
        require(tokenURIs.length == quantity, "URIs length mismatch");
        require(_tokenIdCounter + quantity <= maxSupply, "Exceeds max supply");
        require(msg.value >= mintPriceEth * quantity, "Insufficient payment");
        
        uint256 totalFee = mintPriceEth * quantity;
        
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _tokenIdCounter;
            _tokenIdCounter++;
            
            _safeMint(to, tokenId);
            _setTokenURI(tokenId, tokenURIs[i]);
            
            emit NFTMinted(to, tokenId, mintPriceEth, mintPriceUsdc, true);
        }
        
        // Transfer fees ke FeeCollector
        (bool success, ) = address(feeCollector).call{value: totalFee}("");
        require(success, "Fee transfer failed");
        
        // Record fees
        feeCollector.collectFees(totalFee, mintPriceUsdc * quantity);
        
        // Refund excess
        if (msg.value > totalFee) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - totalFee}("");
            require(refundSuccess, "Refund failed");
        }
    }
    
    /**
     * @dev Batch mint multiple NFTs dengan USDC
     * @param to Address yang akan menerima NFT
     * @param tokenURIs Array of URIs untuk setiap NFT
     * @param quantity Jumlah NFT yang akan di-mint
     */
    function batchMintWithUsdc(
        address to,
        string[] memory tokenURIs,
        uint256 quantity
    ) external nonReentrant {
        require(mintingEnabled, "Minting is disabled");
        require(tokenURIs.length == quantity, "URIs length mismatch");
        require(_tokenIdCounter + quantity <= maxSupply, "Exceeds max supply");
        
        uint256 totalUsdcFee = mintPriceUsdc * quantity;
        
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _tokenIdCounter;
            _tokenIdCounter++;
            
            _safeMint(to, tokenId);
            _setTokenURI(tokenId, tokenURIs[i]);
            
            emit NFTMinted(to, tokenId, 0, mintPriceUsdc, false);
        }
        
        // Transfer USDC fees ke FeeCollector
        feeCollector.collectFeesUsdc(totalUsdcFee);
    }
    
    /**
     * @dev Update mint price (hanya owner)
     */
    function setMintPrice(uint256 _mintPriceEth, uint256 _mintPriceUsdc) external onlyOwner {
        mintPriceEth = _mintPriceEth;
        mintPriceUsdc = _mintPriceUsdc;
        emit MintPriceUpdated(_mintPriceEth, _mintPriceUsdc);
    }
    
    /**
     * @dev Toggle minting (hanya owner)
     */
    function toggleMinting() external onlyOwner {
        mintingEnabled = !mintingEnabled;
    }
    
    /**
     * @dev Get total minted
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }
    
    /**
     * @dev Get current token ID
     */
    function currentTokenId() external view returns (uint256) {
        return _tokenIdCounter;
    }
}
