'use client';

import { useAccount } from 'wagmi';
import { useReadContract } from 'wagmi';
import { formatEther, formatUnits } from 'viem';
import { contractAbi } from '@/lib/contract';
import { CONTRACT_ADDRESS } from '@/lib/config';
import { 
  Coins, 
  Users, 
  TrendingUp, 
  Wallet, 
  Package,
  Lock,
  Unlock
} from 'lucide-react';

export default function Dashboard() {
  const { address } = useAccount();

  // Read contract data
  const { data: totalSupply } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: contractAbi,
    functionName: 'nftTotalSupply',
  });

  const { data: maxSupply } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: contractAbi,
    functionName: 'nftMaxSupply',
  });

  const { data: mintPriceEth } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: contractAbi,
    functionName: 'nftMintPriceEth',
  });

  const { data: mintPriceUsdc } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: contractAbi,
    functionName: 'nftMintPriceUsdc',
  });

  const { data: totalEthFees } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: contractAbi,
    functionName: 'totalEthFees',
  });

  const { data: totalUsdcFees } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: contractAbi,
    functionName: 'totalUsdcFees',
  });

  const { data: ethBalance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: contractAbi,
    functionName: 'getEthBalance',
  });

  const { data: usdcBalance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: contractAbi,
    functionName: 'getUsdcBalance',
  });

  const { data: userEthFees } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: contractAbi,
    functionName: 'userEthFees',
    args: address ? [address] : undefined,
    enabled: !!address,
  });

  const { data: userUsdcFees } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: contractAbi,
    functionName: 'userUsdcFees',
    args: address ? [address] : undefined,
    enabled: !!address,
  });

  const { data: mintingEnabled } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: contractAbi,
    functionName: 'nftMintingEnabled',
  });

  const supplyPercentage = totalSupply && maxSupply 
    ? (Number(totalSupply) / Number(maxSupply)) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <Package className="w-8 h-8 text-sky-blue-600" />
            <span className="text-xs text-sky-blue-600 font-semibold">Total Supply</span>
          </div>
          <div className="text-3xl font-bold text-sky-blue-800">
            {totalSupply?.toString() || '0'}
          </div>
          <div className="text-sm text-sky-blue-600 mt-1">
            dari {maxSupply?.toString() || '0'} maksimal
          </div>
          <div className="mt-3 w-full bg-sky-blue-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-sky-blue-500 to-sky-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${supplyPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <Coins className="w-8 h-8 text-sky-blue-600" />
            <span className="text-xs text-sky-blue-600 font-semibold">Total Fees ETH</span>
          </div>
          <div className="text-3xl font-bold text-sky-blue-800">
            {totalEthFees ? formatEther(totalEthFees) : '0'}
          </div>
          <div className="text-sm text-sky-blue-600 mt-1">ETH</div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-8 h-8 text-sky-blue-600" />
            <span className="text-xs text-sky-blue-600 font-semibold">Total Fees USDC</span>
          </div>
          <div className="text-3xl font-bold text-sky-blue-800">
            {totalUsdcFees ? formatUnits(totalUsdcFees, 6) : '0'}
          </div>
          <div className="text-sm text-sky-blue-600 mt-1">USDC</div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            {mintingEnabled ? (
              <Unlock className="w-8 h-8 text-green-600" />
            ) : (
              <Lock className="w-8 h-8 text-red-600" />
            )}
            <span className="text-xs text-sky-blue-600 font-semibold">Status Minting</span>
          </div>
          <div className={`text-2xl font-bold ${mintingEnabled ? 'text-green-600' : 'text-red-600'}`}>
            {mintingEnabled ? 'Aktif' : 'Nonaktif'}
          </div>
          <div className="text-sm text-sky-blue-600 mt-1">
            {mintingEnabled ? 'NFT bisa di-mint' : 'Minting ditutup'}
          </div>
        </div>
      </div>

      {/* Contract Balance */}
      <div className="card">
        <h3 className="text-xl font-bold text-sky-blue-800 mb-4 flex items-center gap-2">
          <Wallet className="w-6 h-6" />
          Saldo Contract
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="stat-card">
            <div className="text-sm text-sky-blue-600 mb-2">ETH Balance</div>
            <div className="text-2xl font-bold text-sky-blue-800">
              {ethBalance ? formatEther(ethBalance) : '0'} ETH
            </div>
          </div>
          <div className="stat-card">
            <div className="text-sm text-sky-blue-600 mb-2">USDC Balance</div>
            <div className="text-2xl font-bold text-sky-blue-800">
              {usdcBalance ? formatUnits(usdcBalance, 6) : '0'} USDC
            </div>
          </div>
        </div>
      </div>

      {/* Mint Prices */}
      <div className="card">
        <h3 className="text-xl font-bold text-sky-blue-800 mb-4">Harga Mint</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="stat-card">
            <div className="text-sm text-sky-blue-600 mb-2">Harga dengan ETH</div>
            <div className="text-2xl font-bold text-sky-blue-800">
              {mintPriceEth ? formatEther(mintPriceEth) : '0'} ETH
            </div>
          </div>
          <div className="stat-card">
            <div className="text-sm text-sky-blue-600 mb-2">Harga dengan USDC</div>
            <div className="text-2xl font-bold text-sky-blue-800">
              {mintPriceUsdc ? formatUnits(mintPriceUsdc, 6) : '0'} USDC
            </div>
          </div>
        </div>
      </div>

      {/* User Stats */}
      {address && (
        <div className="card">
          <h3 className="text-xl font-bold text-sky-blue-800 mb-4 flex items-center gap-2">
            <Users className="w-6 h-6" />
            Statistik Anda
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="stat-card">
              <div className="text-sm text-sky-blue-600 mb-2">Total Fees ETH Anda</div>
              <div className="text-2xl font-bold text-sky-blue-800">
                {userEthFees ? formatEther(userEthFees) : '0'} ETH
              </div>
            </div>
            <div className="stat-card">
              <div className="text-sm text-sky-blue-600 mb-2">Total Fees USDC Anda</div>
              <div className="text-2xl font-bold text-sky-blue-800">
                {userUsdcFees ? formatUnits(userUsdcFees, 6) : '0'} USDC
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contract Info */}
      <div className="card">
        <h3 className="text-xl font-bold text-sky-blue-800 mb-4">Informasi Contract</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-sky-blue-600">Contract Address:</span>
            <a
              href={`https://basescan.org/address/${CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-blue-600 hover:text-sky-blue-800 font-mono text-xs break-all"
            >
              {CONTRACT_ADDRESS}
            </a>
          </div>
          <div className="flex justify-between">
            <span className="text-sky-blue-600">Network:</span>
            <span className="text-sky-blue-800 font-semibold">Base Mainnet</span>
          </div>
        </div>
      </div>
    </div>
  );
}
