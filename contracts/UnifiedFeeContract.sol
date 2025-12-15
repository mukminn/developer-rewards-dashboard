// SPDX-License-Identifier: MIT
pragma solidity >=0.8.20 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title UnifiedFeeContract
 * @dev Kontrak untuk NFT minting dengan sistem fees (ETH & USDC)
 */
contract UnifiedFeeContract is ERC721, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    // ============ NFT Variables ============
    uint256 private _nftTokenIdCounter;
    uint256 public nftMintPriceEth;
    uint256 public nftMintPriceUsdc;
    uint256 public nftMaxSupply;
    bool public nftMintingEnabled;
    mapping(uint256 => string) private _tokenURIs;
    
    // ============ Fee Variables ============
    uint256 public totalEthFees;
    uint256 public totalUsdcFees;
    IERC20 public usdcToken;
    
    mapping(address => uint256) public userEthFees;
    mapping(address => uint256) public userUsdcFees;
    
    // ============ Events ============
    event NFTMinted(address indexed to, uint256 indexed tokenId, uint256 ethPaid, uint256 usdcPaid, bool paidWithEth);
    event FeesWithdrawn(address indexed owner, uint256 ethAmount, uint256 usdcAmount);
    event NFTPriceUpdated(uint256 newEthPrice, uint256 newUsdcPrice);
    
    constructor(
        string memory nftName,
        string memory nftSymbol,
        address _usdcAddress,
        uint256 _nftMintPriceEth,
        uint256 _nftMintPriceUsdc,
        uint256 _nftMaxSupply
    ) 
        ERC721(nftName, nftSymbol) 
        Ownable(msg.sender) 
    {
        usdcToken = IERC20(_usdcAddress);
        
        // NFT settings
        nftMintPriceEth = _nftMintPriceEth;
        nftMintPriceUsdc = _nftMintPriceUsdc;
        nftMaxSupply = _nftMaxSupply;
        nftMintingEnabled = true;
        _nftTokenIdCounter = 0;
    }
    
    // ============ NFT Functions ============
    
    /**
     * @dev Mint NFT dengan ETH
     */
    function mintNFT(address to, string memory uri) external payable nonReentrant {
        require(nftMintingEnabled, "NFT minting is disabled");
        require(_nftTokenIdCounter < nftMaxSupply, "NFT max supply reached");
        require(msg.value >= nftMintPriceEth, "Insufficient payment");
        
        uint256 tokenId = _nftTokenIdCounter;
        _nftTokenIdCounter++;
        
        _safeMint(to, tokenId);
        _tokenURIs[tokenId] = uri;
        
        // Collect fees
        totalEthFees += nftMintPriceEth;
        userEthFees[msg.sender] += nftMintPriceEth;
        
        // Refund excess
        if (msg.value > nftMintPriceEth) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - nftMintPriceEth}("");
            require(refundSuccess, "Refund failed");
        }
        
        emit NFTMinted(to, tokenId, nftMintPriceEth, 0, true);
    }
    
    /**
     * @dev Mint NFT dengan USDC
     */
    function mintNFTWithUsdc(address to, string memory uri) external nonReentrant {
        require(nftMintingEnabled, "NFT minting is disabled");
        require(_nftTokenIdCounter < nftMaxSupply, "NFT max supply reached");
        
        uint256 tokenId = _nftTokenIdCounter;
        _nftTokenIdCounter++;
        
        _safeMint(to, tokenId);
        _tokenURIs[tokenId] = uri;
        
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
            _tokenURIs[tokenId] = tokenURIs[i];
            
            emit NFTMinted(to, tokenId, nftMintPriceEth, 0, true);
        }
        
        // Collect fees
        totalEthFees += totalFee;
        userEthFees[msg.sender] += totalFee;
        
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
            _tokenURIs[tokenId] = tokenURIs[i];
            
            emit NFTMinted(to, tokenId, 0, nftMintPriceUsdc, false);
        }
        
        // Collect USDC fees
        usdcToken.safeTransferFrom(msg.sender, address(this), totalUsdcFee);
        totalUsdcFees += totalUsdcFee;
        userUsdcFees[msg.sender] += totalUsdcFee;
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
     * @dev Toggle NFT minting
     */
    function toggleNFTMinting() external onlyOwner {
        nftMintingEnabled = !nftMintingEnabled;
    }
    
    /**
     * @dev Owner mint NFT tanpa fees (untuk airdrop)
     */
    function ownerMintNFT(address to, string memory uri) external onlyOwner {
        require(_nftTokenIdCounter < nftMaxSupply, "NFT max supply reached");
        
        uint256 tokenId = _nftTokenIdCounter;
        _nftTokenIdCounter++;
        
        _safeMint(to, tokenId);
        _tokenURIs[tokenId] = uri;
        
        emit NFTMinted(to, tokenId, 0, 0, true);
    }
    
    // ============ Override Functions ============
    
    /**
     * @dev Get token URI untuk NFT
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        _requireOwned(tokenId);
        string memory uri = _tokenURIs[tokenId];
        if (bytes(uri).length > 0) {
            return uri;
        }
        return "";
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
