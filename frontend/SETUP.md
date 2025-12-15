# Setup Instructions

## Quick Start

1. **Masuk ke folder frontend:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Buat file environment:**
   ```bash
   # Windows PowerShell
   New-Item .env.local
   
   # Atau copy dari example
   copy .env.local.example .env.local
   ```

4. **Edit `.env.local` dan isi:**
   ```env
   NEXT_PUBLIC_CONTRACT_ADDRESS=0x7b72B887732184F23B58F6Ed14BCb92625D6c031
   NEXT_PUBLIC_USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
   NEXT_PUBLIC_CHAIN_ID=8453
   NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your-walletconnect-project-id
   ```

   **Untuk WalletConnect Project ID:**
   - Daftar di https://cloud.walletconnect.com
   - Buat project baru
   - Copy Project ID

5. **Jalankan development server:**
   ```bash
   npm run dev
   ```

6. **Buka browser:**
   ```
   http://localhost:3000
   ```

## Fitur yang Tersedia

### 🎨 Mint NFT
- ✅ Mint dengan ETH
- ✅ Mint dengan USDC (dengan approve)
- ✅ Batch mint (multiple NFT)
- ✅ Input token URI untuk metadata

### 📊 Dashboard
- ✅ Total supply & progress bar
- ✅ Total fees (ETH & USDC)
- ✅ Contract balance
- ✅ Mint prices
- ✅ User statistics
- ✅ Minting status

### 👑 Owner Panel
- ✅ Withdraw ETH
- ✅ Withdraw USDC
- ✅ Withdraw All
- ✅ Update mint price
- ✅ Toggle minting on/off
- ✅ Owner mint (airdrop)

## Tema Warna

Aplikasi menggunakan tema **biru langit** dengan:
- Background: Gradient biru langit
- Cards: White dengan backdrop blur
- Buttons: Gradient sky blue
- Accent: Sky blue shades

## Troubleshooting

**Error: "Cannot find module"**
- Pastikan sudah run `npm install`
- Hapus `node_modules` dan `package-lock.json`, lalu install ulang

**Error: "Invalid contract address"**
- Pastikan `.env.local` sudah diisi dengan benar
- Cek contract address di Basescan

**Wallet tidak connect**
- Pastikan WalletConnect Project ID sudah diisi
- Cek network (harus Base Mainnet)

**Transaction failed**
- Pastikan wallet sudah connect ke Base network
- Cek balance cukup untuk gas fees
- Untuk USDC mint, pastikan sudah approve

## Build untuk Production

```bash
npm run build
npm start
```

## Deploy ke Vercel

1. Push code ke GitHub
2. Import project di Vercel
3. Set environment variables di Vercel dashboard
4. Deploy!
