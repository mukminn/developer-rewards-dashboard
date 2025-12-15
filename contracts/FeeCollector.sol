// SPDX-License-Identifier: MIT
pragma solidity >=0.8.20 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title FeeCollector
 * @dev Contract untuk mengumpulkan fees dari minting NFT dan Token (ETH & USDC)
 */
contract FeeCollector is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    // Total fees terkumpul dalam ETH
    uint256 public totalEthFees;
    
    // Total fees terkumpul dalam USDC
    uint256 public totalUsdcFees;
    
    // USDC token address (Base mainnet: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913)
    IERC20 public usdcToken;
    
    // Mapping untuk track fees per user
    mapping(address => uint256) public userEthFees;
    mapping(address => uint256) public userUsdcFees;
    
    // Events
    event FeesCollected(address indexed user, uint256 ethAmount, uint256 usdcAmount);
    event FeesCollectedUsdc(address indexed user, uint256 usdcAmount);
    event FeesWithdrawn(address indexed owner, uint256 ethAmount, uint256 usdcAmount);
    
    constructor(address _usdcAddress) Ownable(msg.sender) {
        usdcToken = IERC20(_usdcAddress);
    }
    
    /**
     * @dev Function untuk menerima fees dalam ETH dari minting
     * @param ethAmount Jumlah fees dalam ETH (wei)
     * @param usdcAmount Jumlah fees dalam USDC (untuk tracking)
     */
    function collectFees(uint256 ethAmount, uint256 usdcAmount) external payable {
        require(msg.value >= ethAmount, "Insufficient ETH sent");
        
        totalEthFees += ethAmount;
        totalUsdcFees += usdcAmount;
        userEthFees[msg.sender] += ethAmount;
        userUsdcFees[msg.sender] += usdcAmount;
        
        emit FeesCollected(msg.sender, ethAmount, usdcAmount);
    }
    
    /**
     * @dev Function untuk menerima fees dalam USDC dari minting
     * @param usdcAmount Jumlah fees dalam USDC
     */
    function collectFeesUsdc(uint256 usdcAmount) external {
        require(usdcAmount > 0, "Amount must be greater than 0");
        
        usdcToken.safeTransferFrom(msg.sender, address(this), usdcAmount);
        
        totalUsdcFees += usdcAmount;
        userUsdcFees[msg.sender] += usdcAmount;
        
        emit FeesCollectedUsdc(msg.sender, usdcAmount);
    }
    
    /**
     * @dev Function untuk withdraw ETH fees (hanya owner)
     */
    function withdrawEth() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "ETH withdrawal failed");
        
        emit FeesWithdrawn(owner(), balance, 0);
    }
    
    /**
     * @dev Function untuk withdraw USDC fees (hanya owner)
     */
    function withdrawUsdc() external onlyOwner nonReentrant {
        uint256 balance = usdcToken.balanceOf(address(this));
        require(balance > 0, "No USDC to withdraw");
        
        usdcToken.safeTransfer(owner(), balance);
        
        emit FeesWithdrawn(owner(), 0, balance);
    }
    
    /**
     * @dev Function untuk withdraw semua fees (ETH & USDC)
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
    
    /**
     * @dev Update USDC token address (hanya owner)
     */
    function setUsdcAddress(address _usdcAddress) external onlyOwner {
        usdcToken = IERC20(_usdcAddress);
    }
    
    // Receive ETH
    receive() external payable {
        totalEthFees += msg.value;
    }
}
