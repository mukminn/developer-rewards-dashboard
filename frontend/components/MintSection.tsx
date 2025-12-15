'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, parseUnits } from 'viem';
import { contractAbi } from '@/lib/contract';
import { CONTRACT_ADDRESS, USDC_ADDRESS } from '@/lib/config';
import { MintSingle, MintBatch } from './MintForms';
import { Coins, Zap } from 'lucide-react';

export default function MintSection() {
  const { address } = useAccount();
  const [mintType, setMintType] = useState<'single' | 'batch'>('single');
  const [paymentMethod, setPaymentMethod] = useState<'eth' | 'usdc'>('eth');

  return (
    <div className="space-y-8">
      {/* Payment Method Toggle */}
      <div className="card">
        <h3 className="text-2xl font-bold text-sky-blue-800 mb-6 flex items-center gap-2">
          <Coins className="w-6 h-6" />
          Pilih Metode Pembayaran
        </h3>
        <div className="flex gap-4">
          <button
            onClick={() => setPaymentMethod('eth')}
            className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all ${
              paymentMethod === 'eth'
                ? 'bg-gradient-to-r from-sky-blue-500 to-sky-blue-600 text-white shadow-lg'
                : 'bg-sky-blue-100 text-sky-blue-700 hover:bg-sky-blue-200'
            }`}
          >
            <Zap className="w-5 h-5 inline mr-2" />
            Bayar dengan ETH
          </button>
          <button
            onClick={() => setPaymentMethod('usdc')}
            className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all ${
              paymentMethod === 'usdc'
                ? 'bg-gradient-to-r from-sky-blue-500 to-sky-blue-600 text-white shadow-lg'
                : 'bg-sky-blue-100 text-sky-blue-700 hover:bg-sky-blue-200'
            }`}
          >
            <Coins className="w-5 h-5 inline mr-2" />
            Bayar dengan USDC
          </button>
        </div>
      </div>

      {/* Mint Type Toggle */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setMintType('single')}
          className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
            mintType === 'single'
              ? 'bg-sky-blue-600 text-white shadow-md'
              : 'bg-white text-sky-blue-600 border-2 border-sky-blue-300'
          }`}
        >
          Mint Satu NFT
        </button>
        <button
          onClick={() => setMintType('batch')}
          className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
            mintType === 'batch'
              ? 'bg-sky-blue-600 text-white shadow-md'
              : 'bg-white text-sky-blue-600 border-2 border-sky-blue-300'
          }`}
        >
          Batch Mint
        </button>
      </div>

      {/* Mint Forms */}
      {mintType === 'single' ? (
        <MintSingle paymentMethod={paymentMethod} />
      ) : (
        <MintBatch paymentMethod={paymentMethod} />
      )}
    </div>
  );
}
