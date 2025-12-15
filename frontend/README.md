# NFT Minting Platform - Mini App

Frontend aplikasi untuk NFT Minting dengan tema biru langit.

## Fitur

✅ **Mint NFT**
- Mint dengan ETH
- Mint dengan USDC
- Batch mint (multiple NFT sekaligus)

✅ **Dashboard**
- Total supply & max supply
- Total fees terkumpul
- Contract balance
- User statistics
- Minting status

✅ **Owner Panel**
- Withdraw ETH fees
- Withdraw USDC fees
- Update mint price
- Toggle minting on/off
- Owner mint (airdrop)

## Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Setup environment variables:**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` dan isi:
   ```
   NEXT_PUBLIC_CONTRACT_ADDRESS=0x7b72B887732184F23B58F6Ed14BCb92625D6c031
   NEXT_PUBLIC_USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
   NEXT_PUBLIC_CHAIN_ID=8453
   NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your-project-id
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Open browser:**
   ```
   http://localhost:3000
   ```

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling dengan tema biru langit
- **Wagmi** - Ethereum React hooks
- **RainbowKit** - Wallet connection UI
- **Viem** - Ethereum library

## Warna Tema

- Primary: Sky Blue (#0ea5e9)
- Background: Gradient biru langit
- Cards: White dengan backdrop blur
- Accent: Sky Blue shades

## Contract Functions

Semua fungsi public dari contract sudah diimplementasikan:
- `mintNFT()` - Mint dengan ETH
- `mintNFTWithUsdc()` - Mint dengan USDC
- `batchMintNFT()` - Batch mint dengan ETH
- `batchMintNFTWithUsdc()` - Batch mint dengan USDC
- `tokenURI()` - Get NFT metadata
- `nftTotalSupply()` - Total NFT yang sudah di-mint
- `nftMaxSupply()` - Maximum supply
- `nftMintPriceEth()` - Harga mint dengan ETH
- `nftMintPriceUsdc()` - Harga mint dengan USDC
- `totalEthFees()` - Total fees ETH
- `totalUsdcFees()` - Total fees USDC
- `getEthBalance()` - Contract ETH balance
- `getUsdcBalance()` - Contract USDC balance
- `userEthFees()` - User ETH fees
- `userUsdcFees()` - User USDC fees
- `nftMintingEnabled()` - Status minting
- Owner functions: `withdrawEth()`, `withdrawUsdc()`, `withdrawAll()`, `setNFTMintPrice()`, `toggleNFTMinting()`, `ownerMintNFT()`

## Build untuk Production

```bash
npm run build
npm start
```

## Deploy

Bisa di-deploy ke:
- Vercel (recommended)
- Netlify
- Cloudflare Pages
- Self-hosted
