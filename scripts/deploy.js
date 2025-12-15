const hre = require("hardhat");

// USDC address di Base mainnet: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
// USDC address di Base Sepolia: 0x036CbD53842c5426634e7929541eC2318f3dCF7e

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // Base mainnet USDC: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
  // Base Sepolia USDC: 0x036CbD53842c5426634e7929541eC2318f3dCF7e
  const USDC_ADDRESS = process.env.USDC_ADDRESS || "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

  // Deploy FeeCollector
  console.log("\n1. Deploying FeeCollector...");
  const FeeCollector = await hre.ethers.getContractFactory("FeeCollector");
  const feeCollector = await FeeCollector.deploy(USDC_ADDRESS);
  await feeCollector.waitForDeployment();
  const feeCollectorAddress = await feeCollector.getAddress();
  console.log("FeeCollector deployed to:", feeCollectorAddress);

  // Deploy FeeNFT
  console.log("\n2. Deploying FeeNFT...");
  const FeeNFT = await hre.ethers.getContractFactory("FeeNFT");
  // Parameters: name, symbol, feeCollector, mintPriceEth (wei), mintPriceUsdc (6 decimals), maxSupply
  // Contoh: 0.01 ETH = 10000000000000000 wei, 10 USDC = 10000000 (6 decimals)
  const feeNFT = await FeeNFT.deploy(
    "My Fee NFT",
    "MFNFT",
    feeCollectorAddress,
    hre.ethers.parseEther("0.01"), // 0.01 ETH
    hre.ethers.parseUnits("10", 6), // 10 USDC (6 decimals)
    10000 // max supply
  );
  await feeNFT.waitForDeployment();
  const feeNFTAddress = await feeNFT.getAddress();
  console.log("FeeNFT deployed to:", feeNFTAddress);

  // Deploy FeeToken
  console.log("\n3. Deploying FeeToken...");
  const FeeToken = await hre.ethers.getContractFactory("FeeToken");
  // Parameters: name, symbol, feeCollector, mintPriceEth, mintPriceUsdc, tokensPerMint, maxSupply
  const feeToken = await FeeToken.deploy(
    "My Fee Token",
    "MFT",
    feeCollectorAddress,
    hre.ethers.parseEther("0.005"), // 0.005 ETH
    hre.ethers.parseUnits("5", 6), // 5 USDC
    hre.ethers.parseEther("1000"), // 1000 tokens per mint
    hre.ethers.parseEther("1000000") // 1M max supply
  );
  await feeToken.waitForDeployment();
  const feeTokenAddress = await feeToken.getAddress();
  console.log("FeeToken deployed to:", feeTokenAddress);

  console.log("\n=== Deployment Summary ===");
  console.log("Network:", hre.network.name);
  console.log("Deployer:", deployer.address);
  console.log("\nContract Addresses:");
  console.log("FeeCollector:", feeCollectorAddress);
  console.log("FeeNFT:", feeNFTAddress);
  console.log("FeeToken:", feeTokenAddress);
  console.log("\nUSDC Address:", USDC_ADDRESS);
  
  console.log("\n=== Next Steps ===");
  console.log("1. Verify contracts on Basescan:");
  console.log(`   npx hardhat verify --network base ${feeCollectorAddress} "${USDC_ADDRESS}"`);
  console.log(`   npx hardhat verify --network base ${feeNFTAddress} "My Fee NFT" "MFNFT" "${feeCollectorAddress}" "${hre.ethers.parseEther("0.01")}" "${hre.ethers.parseUnits("10", 6)}" "10000"`);
  console.log(`   npx hardhat verify --network base ${feeTokenAddress} "My Fee Token" "MFT" "${feeCollectorAddress}" "${hre.ethers.parseEther("0.005")}" "${hre.ethers.parseUnits("5", 6)}" "${hre.ethers.parseEther("1000")}" "${hre.ethers.parseEther("1000000")}"`);
  
  console.log("\n2. To withdraw fees, call:");
  console.log(`   - feeCollector.withdrawEth()`);
  console.log(`   - feeCollector.withdrawUsdc()`);
  console.log(`   - feeCollector.withdrawAll()`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
