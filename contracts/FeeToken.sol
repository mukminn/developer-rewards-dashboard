// SPDX-License-Identifier: MIT
pragma solidity >=0.8.20 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./FeeCollector.sol";

/**
 * @title FeeToken
 * @dev ERC20 Token dengan fee system untuk minting
 */
contract FeeToken is ERC20, ERC20Burnable, Ownable, ReentrancyGuard {
    FeeCollector public feeCollector;
    
    uint256 public mintPriceEth; // Harga mint dalam wei (ETH)
    uint256 public mintPriceUsdc; // Harga mint dalam USDC (6 decimals)
    uint256 public tokensPerMint; // Jumlah token yang diberikan per mint
    
    uint256 public maxSupply;
    bool public mintingEnabled;
    
    // Events
    event TokensMinted(address indexed to, uint256 amount, uint256 ethPaid, uint256 usdcPaid, bool paidWithEth);
    event MintPriceUpdated(uint256 newEthPrice, uint256 newUsdcPrice, uint256 newTokensPerMint);
    
    constructor(
        string memory name,
        string memory symbol,
        address _feeCollector,
        uint256 _mintPriceEth,
        uint256 _mintPriceUsdc,
        uint256 _tokensPerMint,
        uint256 _maxSupply
    ) ERC20(name, symbol) Ownable(msg.sender) {
        feeCollector = FeeCollector(_feeCollector);
        mintPriceEth = _mintPriceEth;
        mintPriceUsdc = _mintPriceUsdc;
        tokensPerMint = _tokensPerMint;
        maxSupply = _maxSupply;
        mintingEnabled = true;
    }
    
    /**
     * @dev Mint tokens dengan membayar fees dalam ETH
     * @param to Address yang akan menerima tokens
     */
    function mint(address to) external payable nonReentrant {
        require(mintingEnabled, "Minting is disabled");
        require(totalSupply() + tokensPerMint <= maxSupply, "Max supply reached");
        require(msg.value >= mintPriceEth, "Insufficient payment");
        
        // Transfer fees ke FeeCollector
        (bool success, ) = address(feeCollector).call{value: mintPriceEth}("");
        require(success, "Fee transfer failed");
        
        // Record fees di FeeCollector
        feeCollector.collectFees(mintPriceEth, mintPriceUsdc);
        
        // Mint tokens
        _mint(to, tokensPerMint);
        
        // Refund excess payment
        if (msg.value > mintPriceEth) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - mintPriceEth}("");
            require(refundSuccess, "Refund failed");
        }
        
        emit TokensMinted(to, tokensPerMint, mintPriceEth, mintPriceUsdc, true);
    }
    
    /**
     * @dev Mint tokens dengan membayar fees dalam USDC
     * @param to Address yang akan menerima tokens
     */
    function mintWithUsdc(address to) external nonReentrant {
        require(mintingEnabled, "Minting is disabled");
        require(totalSupply() + tokensPerMint <= maxSupply, "Max supply reached");
        
        // Transfer USDC fees ke FeeCollector
        feeCollector.collectFeesUsdc(mintPriceUsdc);
        
        // Mint tokens
        _mint(to, tokensPerMint);
        
        emit TokensMinted(to, tokensPerMint, 0, mintPriceUsdc, false);
    }
    
    /**
     * @dev Batch mint multiple times dengan ETH
     * @param to Address yang akan menerima tokens
     * @param quantity Jumlah mint yang akan dilakukan
     */
    function batchMint(address to, uint256 quantity) external payable nonReentrant {
        require(mintingEnabled, "Minting is disabled");
        require(totalSupply() + (tokensPerMint * quantity) <= maxSupply, "Exceeds max supply");
        require(msg.value >= mintPriceEth * quantity, "Insufficient payment");
        
        uint256 totalFee = mintPriceEth * quantity;
        uint256 totalTokens = tokensPerMint * quantity;
        
        // Transfer fees ke FeeCollector
        (bool success, ) = address(feeCollector).call{value: totalFee}("");
        require(success, "Fee transfer failed");
        
        // Record fees
        feeCollector.collectFees(totalFee, mintPriceUsdc * quantity);
        
        // Mint tokens
        _mint(to, totalTokens);
        
        // Refund excess
        if (msg.value > totalFee) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - totalFee}("");
            require(refundSuccess, "Refund failed");
        }
        
        emit TokensMinted(to, totalTokens, totalFee, mintPriceUsdc * quantity, true);
    }
    
    /**
     * @dev Batch mint multiple times dengan USDC
     * @param to Address yang akan menerima tokens
     * @param quantity Jumlah mint yang akan dilakukan
     */
    function batchMintWithUsdc(address to, uint256 quantity) external nonReentrant {
        require(mintingEnabled, "Minting is disabled");
        require(totalSupply() + (tokensPerMint * quantity) <= maxSupply, "Exceeds max supply");
        
        uint256 totalUsdcFee = mintPriceUsdc * quantity;
        uint256 totalTokens = tokensPerMint * quantity;
        
        // Transfer USDC fees ke FeeCollector
        feeCollector.collectFeesUsdc(totalUsdcFee);
        
        // Mint tokens
        _mint(to, totalTokens);
        
        emit TokensMinted(to, totalTokens, 0, totalUsdcFee, false);
    }
    
    /**
     * @dev Update mint price (hanya owner)
     */
    function setMintPrice(
        uint256 _mintPriceEth,
        uint256 _mintPriceUsdc,
        uint256 _tokensPerMint
    ) external onlyOwner {
        mintPriceEth = _mintPriceEth;
        mintPriceUsdc = _mintPriceUsdc;
        tokensPerMint = _tokensPerMint;
        emit MintPriceUpdated(_mintPriceEth, _mintPriceUsdc, _tokensPerMint);
    }
    
    /**
     * @dev Toggle minting (hanya owner)
     */
    function toggleMinting() external onlyOwner {
        mintingEnabled = !mintingEnabled;
    }
    
    /**
     * @dev Owner can mint without fees (untuk airdrop, dll)
     */
    function ownerMint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= maxSupply, "Exceeds max supply");
        _mint(to, amount);
    }
}
