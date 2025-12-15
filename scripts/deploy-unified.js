const hre = require("hardhat");

// USDC address di Base mainnet: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
// USDC address di Base Sepolia: 0x036CbD53842c5426634e7929541eC2318f3dCF7e

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("Deploying UnifiedFeeContract with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  const USDC_ADDRESS = process.env.USDC_ADDRESS || "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

  // Deploy UnifiedFeeContract
  console.log("\nDeploying UnifiedFeeContract...");
  const UnifiedFeeContract = await hre.ethers.getContractFactory("UnifiedFeeContract");
  const unifiedContract = await UnifiedFeeContract.deploy(
    "My Fee NFT",           // NFT name
    "MFNFT",                // NFT symbol
    "My Fee Token",         // Token name
    "MFT",                  // Token symbol
    USDC_ADDRESS,           // USDC address
    hre.ethers.parseEther("0.01"),      // NFT mint price ETH (0.01 ETH)
    hre.ethers.parseUnits("10", 6),    // NFT mint price USDC (10 USDC)
    10000,                              // NFT max supply
    hre.ethers.parseEther("0.005"),    // Token mint price ETH (0.005 ETH)
    hre.ethers.parseUnits("5", 6),     // Token mint price USDC (5 USDC)
    hre.ethers.parseEther("1000"),     // Tokens per mint (1000 tokens)
    hre.ethers.parseEther("1000000")   // Token max supply (1M tokens)
  );
  await unifiedContract.waitForDeployment();
  const unifiedAddress = await unifiedContract.getAddress();
  console.log("UnifiedFeeContract deployed to:", unifiedAddress);

  console.log("\n=== Deployment Summary ===");
  console.log("Network:", hre.network.name);
  console.log("Deployer:", deployer.address);
  console.log("\nContract Address:");
  console.log("UnifiedFeeContract:", unifiedAddress);
  console.log("\nUSDC Address:", USDC_ADDRESS);
  
  console.log("\n=== Contract Features ===");
  console.log("✅ NFT Minting (ETH & USDC)");
  console.log("✅ Token Minting (ETH & USDC)");
  console.log("✅ Fee Collection & Withdrawal");
  console.log("✅ All in ONE contract!");
  
  console.log("\n=== Next Steps ===");
  console.log("1. Verify contract on Basescan:");
  console.log(`   npx hardhat verify --network base ${unifiedAddress} "My Fee NFT" "MFNFT" "My Fee Token" "MFT" "${USDC_ADDRESS}" "${hre.ethers.parseEther("0.01")}" "${hre.ethers.parseUnits("10", 6)}" "10000" "${hre.ethers.parseEther("0.005")}" "${hre.ethers.parseUnits("5", 6)}" "${hre.ethers.parseEther("1000")}" "${hre.ethers.parseEther("1000000")}"`);
  
  console.log("\n2. To withdraw fees, call:");
  console.log(`   - unifiedContract.withdrawEth()`);
  console.log(`   - unifiedContract.withdrawUsdc()`);
  console.log(`   - unifiedContract.withdrawAll()`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
