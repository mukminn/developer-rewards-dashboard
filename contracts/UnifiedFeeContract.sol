// SPDX-License-Identifier: MIT
pragma solidity ^0.8.31;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title UnifiedFeeContract
 * @dev Satu kontrak untuk NFT dan Token minting dengan sistem fees (ETH & USDC)
 */
contract UnifiedFeeContract is ERC721URIStorage, ERC20, ERC20Burnable, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    // ============ NFT Variables ============
    uint256 private _nftTokenIdCounter;
    uint256 public nftMintPriceEth;
    uint256 public nftMintPriceUsdc;
    uint256 public nftMaxSupply;
    bool public nftMintingEnabled;
    
    // ============ Token Variables ============
    uint256 public tokenMintPriceEth;
    uint256 public tokenMintPriceUsdc;
    uint256 public tokensPerMint;
    uint256 public tokenMaxSupply;
    bool public tokenMintingEnabled;
    
    // ============ Fee Variables ============
    uint256 public totalEthFees;
    uint256 public totalUsdcFees;
    IERC20 public usdcToken;
    
    mapping(address => uint256) public userEthFees;
    mapping(address => uint256) public userUsdcFees;
    
    // ============ Events ============
    event NFTMinted(address indexed to, uint256 indexed tokenId, uint256 ethPaid, uint256 usdcPaid, bool paidWithEth);
    event TokensMinted(address indexed to, uint256 amount, uint256 ethPaid, uint256 usdcPaid, bool paidWithEth);
    event FeesWithdrawn(address indexed owner, uint256 ethAmount, uint256 usdcAmount);
    event NFTPriceUpdated(uint256 newEthPrice, uint256 newUsdcPrice);
    event TokenPriceUpdated(uint256 newEthPrice, uint256 newUsdcPrice, uint256 newTokensPerMint);
    
    constructor(
        string memory nftName,
        string memory nftSymbol,
        string memory tokenName,
        string memory tokenSymbol,
        address _usdcAddress,
        uint256 _nftMintPriceEth,
        uint256 _nftMintPriceUsdc,
        uint256 _nftMaxSupply,
        uint256 _tokenMintPriceEth,
        uint256 _tokenMintPriceUsdc,
        uint256 _tokensPerMint,
        uint256 _tokenMaxSupply
    ) ERC721(nftName, nftSymbol) ERC20(tokenName, tokenSymbol) Ownable(msg.sender) {
        usdcToken = IERC20(_usdcAddress);
        
        // NFT settings
        nftMintPriceEth = _nftMintPriceEth;
        nftMintPriceUsdc = _nftMintPriceUsdc;
        nftMaxSupply = _nftMaxSupply;
        nftMintingEnabled = true;
        _nftTokenIdCounter = 0;
        
        // Token settings
        tokenMintPriceEth = _tokenMintPriceEth;
        tokenMintPriceUsdc = _tokenMintPriceUsdc;
        tokensPerMint = _tokensPerMint;
        tokenMaxSupply = _tokenMaxSupply;
        tokenMintingEnabled = true;
    }
    
    // ============ NFT Functions ============
    
    /**
     * @dev Mint NFT dengan ETH
     */
    function mintNFT(address to, string memory tokenURI) external payable nonReentrant {
        require(nftMintingEnabled, "NFT minting is disabled");
        require(_nftTokenIdCounter < nftMaxSupply, "NFT max supply reached");
        require(msg.value >= nftMintPriceEth, "Insufficient payment");
        
        uint256 tokenId = _nftTokenIdCounter;
        _nftTokenIdCounter++;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        // Collect fees
        totalEthFees += nftMintPriceEth;
        totalUsdcFees += nftMintPriceUsdc;
        userEthFees[msg.sender] += nftMintPriceEth;
        userUsdcFees[msg.sender] += nftMintPriceUsdc;
        
        // Refund excess
        if (msg.value > nftMintPriceEth) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - nftMintPriceEth}("");
            require(refundSuccess, "Refund failed");
        }
        
        emit NFTMinted(to, tokenId, nftMintPriceEth, nftMintPriceUsdc, true);
    }
    
    /**
     * @dev Mint NFT dengan USDC
     */
    function mintNFTWithUsdc(address to, string memory tokenURI) external nonReentrant {
        require(nftMintingEnabled, "NFT minting is disabled");
        require(_nftTokenIdCounter < nftMaxSupply, "NFT max supply reached");
        
        uint256 tokenId = _nftTokenIdCounter;
        _nftTokenIdCounter++;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        // Collect USDC fees
        usdcToken.safeTransferFrom(msg.sender, address(this), nftMintPriceUsdc);
        totalUsdcFees += nftMintPriceUsdc;
        userUsdcFees[msg.sender] += nftMintPriceUsdc;
        
        emit NFTMinted(to, tokenId, 0, nftMintPriceUsdc, false);
    }
    
    /**
     * @dev Batch mint NFT dengan ETH
     */
    function batchMintNFT(
        address to,
        string[] memory tokenURIs,
        uint256 quantity
    ) external payable nonReentrant {
        require(nftMintingEnabled, "NFT minting is disabled");
        require(tokenURIs.length == quantity, "URIs length mismatch");
        require(_nftTokenIdCounter + quantity <= nftMaxSupply, "Exceeds NFT max supply");
        require(msg.value >= nftMintPriceEth * quantity, "Insufficient payment");
        
        uint256 totalFee = nftMintPriceEth * quantity;
        
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _nftTokenIdCounter;
            _nftTokenIdCounter++;
            
            _safeMint(to, tokenId);
            _setTokenURI(tokenId, tokenURIs[i]);
            
            emit NFTMinted(to, tokenId, nftMintPriceEth, nftMintPriceUsdc, true);
        }
        
        // Collect fees
        totalEthFees += totalFee;
        totalUsdcFees += nftMintPriceUsdc * quantity;
        userEthFees[msg.sender] += totalFee;
        userUsdcFees[msg.sender] += nftMintPriceUsdc * quantity;
        
        // Refund excess
        if (msg.value > totalFee) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - totalFee}("");
            require(refundSuccess, "Refund failed");
        }
    }
    
    /**
     * @dev Batch mint NFT dengan USDC
     */
    function batchMintNFTWithUsdc(
        address to,
        string[] memory tokenURIs,
        uint256 quantity
    ) external nonReentrant {
        require(nftMintingEnabled, "NFT minting is disabled");
        require(tokenURIs.length == quantity, "URIs length mismatch");
        require(_nftTokenIdCounter + quantity <= nftMaxSupply, "Exceeds NFT max supply");
        
        uint256 totalUsdcFee = nftMintPriceUsdc * quantity;
        
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _nftTokenIdCounter;
            _nftTokenIdCounter++;
            
            _safeMint(to, tokenId);
            _setTokenURI(tokenId, tokenURIs[i]);
            
            emit NFTMinted(to, tokenId, 0, nftMintPriceUsdc, false);
        }
        
        // Collect USDC fees
        usdcToken.safeTransferFrom(msg.sender, address(this), totalUsdcFee);
        totalUsdcFees += totalUsdcFee;
        userUsdcFees[msg.sender] += totalUsdcFee;
    }
    
    // ============ Token Functions ============
    
    /**
     * @dev Mint Token dengan ETH
     */
    function mintToken(address to) external payable nonReentrant {
        require(tokenMintingEnabled, "Token minting is disabled");
        require(totalSupply() + tokensPerMint <= tokenMaxSupply, "Token max supply reached");
        require(msg.value >= tokenMintPriceEth, "Insufficient payment");
        
        // Collect fees
        totalEthFees += tokenMintPriceEth;
        totalUsdcFees += tokenMintPriceUsdc;
        userEthFees[msg.sender] += tokenMintPriceEth;
        userUsdcFees[msg.sender] += tokenMintPriceUsdc;
        
        // Mint tokens
        _mint(to, tokensPerMint);
        
        // Refund excess
        if (msg.value > tokenMintPriceEth) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - tokenMintPriceEth}("");
            require(refundSuccess, "Refund failed");
        }
        
        emit TokensMinted(to, tokensPerMint, tokenMintPriceEth, tokenMintPriceUsdc, true);
    }
    
    /**
     * @dev Mint Token dengan USDC
     */
    function mintTokenWithUsdc(address to) external nonReentrant {
        require(tokenMintingEnabled, "Token minting is disabled");
        require(totalSupply() + tokensPerMint <= tokenMaxSupply, "Token max supply reached");
        
        // Collect USDC fees
        usdcToken.safeTransferFrom(msg.sender, address(this), tokenMintPriceUsdc);
        totalUsdcFees += tokenMintPriceUsdc;
        userUsdcFees[msg.sender] += tokenMintPriceUsdc;
        
        // Mint tokens
        _mint(to, tokensPerMint);
        
        emit TokensMinted(to, tokensPerMint, 0, tokenMintPriceUsdc, false);
    }
    
    /**
     * @dev Batch mint Token dengan ETH
     */
    function batchMintToken(address to, uint256 quantity) external payable nonReentrant {
        require(tokenMintingEnabled, "Token minting is disabled");
        require(totalSupply() + (tokensPerMint * quantity) <= tokenMaxSupply, "Exceeds token max supply");
        require(msg.value >= tokenMintPriceEth * quantity, "Insufficient payment");
        
        uint256 totalFee = tokenMintPriceEth * quantity;
        uint256 totalTokens = tokensPerMint * quantity;
        
        // Collect fees
        totalEthFees += totalFee;
        totalUsdcFees += tokenMintPriceUsdc * quantity;
        userEthFees[msg.sender] += totalFee;
        userUsdcFees[msg.sender] += tokenMintPriceUsdc * quantity;
        
        // Mint tokens
        _mint(to, totalTokens);
        
        // Refund excess
        if (msg.value > totalFee) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - totalFee}("");
            require(refundSuccess, "Refund failed");
        }
        
        emit TokensMinted(to, totalTokens, totalFee, tokenMintPriceUsdc * quantity, true);
    }
    
    /**
     * @dev Batch mint Token dengan USDC
     */
    function batchMintTokenWithUsdc(address to, uint256 quantity) external nonReentrant {
        require(tokenMintingEnabled, "Token minting is disabled");
        require(totalSupply() + (tokensPerMint * quantity) <= tokenMaxSupply, "Exceeds token max supply");
        
        uint256 totalUsdcFee = tokenMintPriceUsdc * quantity;
        uint256 totalTokens = tokensPerMint * quantity;
        
        // Collect USDC fees
        usdcToken.safeTransferFrom(msg.sender, address(this), totalUsdcFee);
        totalUsdcFees += totalUsdcFee;
        userUsdcFees[msg.sender] += totalUsdcFee;
        
        // Mint tokens
        _mint(to, totalTokens);
        
        emit TokensMinted(to, totalTokens, 0, totalUsdcFee, false);
    }
    
    // ============ Owner Functions ============
    
    /**
     * @dev Withdraw ETH fees
     */
    function withdrawEth() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "ETH withdrawal failed");
        
        emit FeesWithdrawn(owner(), balance, 0);
    }
    
    /**
     * @dev Withdraw USDC fees
     */
    function withdrawUsdc() external onlyOwner nonReentrant {
        uint256 balance = usdcToken.balanceOf(address(this));
        require(balance > 0, "No USDC to withdraw");
        
        usdcToken.safeTransfer(owner(), balance);
        
        emit FeesWithdrawn(owner(), 0, balance);
    }
    
    /**
     * @dev Withdraw semua fees
     */
    function withdrawAll() external onlyOwner nonReentrant {
        uint256 ethBalance = address(this).balance;
        uint256 usdcBalance = usdcToken.balanceOf(address(this));
        
        if (ethBalance > 0) {
            (bool success, ) = payable(owner()).call{value: ethBalance}("");
            require(success, "ETH withdrawal failed");
        }
        
        if (usdcBalance > 0) {
            usdcToken.safeTransfer(owner(), usdcBalance);
        }
        
        emit FeesWithdrawn(owner(), ethBalance, usdcBalance);
    }
    
    /**
     * @dev Update NFT mint price
     */
    function setNFTMintPrice(uint256 _mintPriceEth, uint256 _mintPriceUsdc) external onlyOwner {
        nftMintPriceEth = _mintPriceEth;
        nftMintPriceUsdc = _mintPriceUsdc;
        emit NFTPriceUpdated(_mintPriceEth, _mintPriceUsdc);
    }
    
    /**
     * @dev Update Token mint price
     */
    function setTokenMintPrice(
        uint256 _mintPriceEth,
        uint256 _mintPriceUsdc,
        uint256 _tokensPerMint
    ) external onlyOwner {
        tokenMintPriceEth = _mintPriceEth;
        tokenMintPriceUsdc = _mintPriceUsdc;
        tokensPerMint = _tokensPerMint;
        emit TokenPriceUpdated(_mintPriceEth, _mintPriceUsdc, _tokensPerMint);
    }
    
    /**
     * @dev Toggle NFT minting
     */
    function toggleNFTMinting() external onlyOwner {
        nftMintingEnabled = !nftMintingEnabled;
    }
    
    /**
     * @dev Toggle Token minting
     */
    function toggleTokenMinting() external onlyOwner {
        tokenMintingEnabled = !tokenMintingEnabled;
    }
    
    /**
     * @dev Owner mint token tanpa fees (untuk airdrop)
     */
    function ownerMintToken(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= tokenMaxSupply, "Exceeds token max supply");
        _mint(to, amount);
    }
    
    // ============ View Functions ============
    
    /**
     * @dev Get NFT total supply
     */
    function nftTotalSupply() external view returns (uint256) {
        return _nftTokenIdCounter;
    }
    
    /**
     * @dev Get ETH balance
     */
    function getEthBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Get USDC balance
     */
    function getUsdcBalance() external view returns (uint256) {
        return usdcToken.balanceOf(address(this));
    }
    
    // Receive ETH
    receive() external payable {
        totalEthFees += msg.value;
    }
}
