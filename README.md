# Fee Contracts untuk Base Network

Smart contracts untuk mengumpulkan fees dari minting NFT dan Token di Base network. Fees dapat dibayar dengan ETH atau USDC, dan owner dapat withdraw fees yang terkumpul.

## Kontrak yang Tersedia

### 1. FeeCollector
Kontrak utama untuk mengumpulkan dan mengelola fees (ETH & USDC).

**Fitur:**
- Collect fees dalam ETH
- Collect fees dalam USDC
- Withdraw ETH fees (hanya owner)
- Withdraw USDC fees (hanya owner)
- Withdraw semua fees sekaligus

### 2. FeeNFT
Kontrak NFT dengan sistem fees untuk minting.

**Fitur:**
- Mint NFT dengan bayar ETH
- Mint NFT dengan bayar USDC
- Batch mint (ETH atau USDC)
- Update harga mint (owner)
- Toggle minting on/off (owner)

### 3. FeeToken
Kontrak ERC20 Token dengan sistem fees untuk minting.

**Fitur:**
- Mint token dengan bayar ETH
- Mint token dengan bayar USDC
- Batch mint (ETH atau USDC)
- Update harga mint (owner)
- Toggle minting on/off (owner)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Buat file `.env`:
```env
PRIVATE_KEY=your_private_key
BASE_RPC_URL=https://mainnet.base.org
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASESCAN_API_KEY=your_basescan_api_key
USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
```

**USDC Addresses:**
- Base Mainnet: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- Base Sepolia: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`

## Deploy

### Deploy ke Base Mainnet:
```bash
npm run deploy:base
```

### Deploy ke Base Sepolia (Testnet):
```bash
npm run deploy:baseSepolia
```

## Usage

### 1. Deploy Contracts
Setelah deploy, Anda akan mendapatkan 3 alamat kontrak:
- FeeCollector address
- FeeNFT address  
- FeeToken address

### 2. Users Mint NFT dengan ETH
```solidity
feeNFT.mint(userAddress, "ipfs://...", {value: mintPriceEth});
```

### 3. Users Mint NFT dengan USDC
```solidity
// User harus approve USDC dulu
usdc.approve(feeNFTAddress, mintPriceUsdc);
feeNFT.mintWithUsdc(userAddress, "ipfs://...");
```

### 4. Users Mint Token dengan ETH
```solidity
feeToken.mint(userAddress, {value: mintPriceEth});
```

### 5. Users Mint Token dengan USDC
```solidity
// User harus approve USDC dulu
usdc.approve(feeTokenAddress, mintPriceUsdc);
feeToken.mintWithUsdc(userAddress);
```

### 6. Owner Withdraw Fees

**Withdraw ETH:**
```solidity
feeCollector.withdrawEth();
```

**Withdraw USDC:**
```solidity
feeCollector.withdrawUsdc();
```

**Withdraw Semua:**
```solidity
feeCollector.withdrawAll();
```

## Contract Functions

### FeeCollector

- `collectFees(uint256 ethAmount, uint256 usdcAmount)` - Collect fees dalam ETH
- `collectFeesUsdc(uint256 usdcAmount)` - Collect fees dalam USDC
- `withdrawEth()` - Withdraw ETH fees (owner only)
- `withdrawUsdc()` - Withdraw USDC fees (owner only)
- `withdrawAll()` - Withdraw semua fees (owner only)
- `getEthBalance()` - Get ETH balance
- `getUsdcBalance()` - Get USDC balance

### FeeNFT

- `mint(address to, string tokenURI)` - Mint dengan ETH
- `mintWithUsdc(address to, string tokenURI)` - Mint dengan USDC
- `batchMint(...)` - Batch mint dengan ETH
- `batchMintWithUsdc(...)` - Batch mint dengan USDC
- `setMintPrice(uint256 ethPrice, uint256 usdcPrice)` - Update harga (owner)
- `toggleMinting()` - Enable/disable minting (owner)

### FeeToken

- `mint(address to)` - Mint dengan ETH
- `mintWithUsdc(address to)` - Mint dengan USDC
- `batchMint(address to, uint256 quantity)` - Batch mint dengan ETH
- `batchMintWithUsdc(address to, uint256 quantity)` - Batch mint dengan USDC
- `setMintPrice(...)` - Update harga (owner)
- `toggleMinting()` - Enable/disable minting (owner)

## Security

- Menggunakan OpenZeppelin contracts (audited)
- ReentrancyGuard untuk mencegah reentrancy attacks
- Ownable untuk access control
- SafeERC20 untuk safe token transfers

## License

MIT
