'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther, parseUnits, formatEther, formatUnits } from 'viem';
import { contractAbi, erc20Abi } from '@/lib/contract';
import { CONTRACT_ADDRESS, USDC_ADDRESS } from '@/lib/config';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface MintSingleProps {
  paymentMethod: 'eth' | 'usdc';
}

export function MintSingle({ paymentMethod }: MintSingleProps) {
  const { address } = useAccount();
  const [recipient, setRecipient] = useState(address || '');
  const [tokenURI, setTokenURI] = useState('');
  const [isApproving, setIsApproving] = useState(false);

  // Read mint price
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

  // Approve USDC
  const { writeContract: approveUsdc, isPending: isApprovingUsdc } = useWriteContract();
  const { writeContract: mintNFT, data: hash, isPending: isMinting } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const handleApprove = async () => {
    if (!mintPriceUsdc) return;
    setIsApproving(true);
    try {
      await approveUsdc({
        address: USDC_ADDRESS,
        abi: erc20Abi,
        functionName: 'approve',
        args: [CONTRACT_ADDRESS, mintPriceUsdc],
      });
    } catch (error) {
      console.error('Approve error:', error);
    } finally {
      setIsApproving(false);
    }
  };

  const handleMint = async () => {
    if (!recipient || !tokenURI) {
      alert('Harap isi semua field');
      return;
    }

    try {
      if (paymentMethod === 'eth' && mintPriceEth) {
        await mintNFT({
          address: CONTRACT_ADDRESS,
          abi: contractAbi,
          functionName: 'mintNFT',
          args: [recipient, tokenURI],
          value: mintPriceEth,
        });
      } else if (paymentMethod === 'usdc' && mintPriceUsdc) {
        await mintNFT({
          address: CONTRACT_ADDRESS,
          abi: contractAbi,
          functionName: 'mintNFTWithUsdc',
          args: [recipient, tokenURI],
        });
      }
    } catch (error: any) {
      console.error('Mint error:', error);
      alert(error?.shortMessage || 'Error saat minting NFT');
    }
  };

  return (
    <div className="card">
      <h3 className="text-2xl font-bold text-sky-blue-800 mb-6">
        Mint NFT {paymentMethod === 'eth' ? 'dengan ETH' : 'dengan USDC'}
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-sky-blue-700 mb-2">
            Alamat Penerima
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-sky-blue-700 mb-2">
            Token URI (Metadata JSON URL)
          </label>
          <input
            type="text"
            value={tokenURI}
            onChange={(e) => setTokenURI(e.target.value)}
            placeholder="https://ipfs.io/ipfs/Qm..."
            className="input-field"
          />
          <p className="text-xs text-sky-blue-600 mt-2">
            URL ke metadata JSON yang berisi gambar dan atribut NFT
          </p>
        </div>

        <div className="stat-card">
          <div className="flex justify-between items-center">
            <span className="text-sky-blue-700 font-semibold">Harga Mint:</span>
            <span className="text-sky-blue-800 font-bold text-lg">
              {paymentMethod === 'eth'
                ? mintPriceEth
                  ? `${formatEther(mintPriceEth)} ETH`
                  : 'Loading...'
                : mintPriceUsdc
                ? `${formatUnits(mintPriceUsdc, 6)} USDC`
                : 'Loading...'}
            </span>
          </div>
        </div>

        {paymentMethod === 'usdc' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-sm text-yellow-800 mb-3">
              Sebelum mint, Anda perlu approve USDC untuk contract ini.
            </p>
            <button
              onClick={handleApprove}
              disabled={isApproving || isApprovingUsdc}
              className="btn-secondary w-full"
            >
              {isApproving || isApprovingUsdc ? (
                <>
                  <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                  Approving...
                </>
              ) : (
                'Approve USDC'
              )}
            </button>
          </div>
        )}

        <button
          onClick={handleMint}
          disabled={isMinting || isConfirming}
          className="btn-primary w-full text-lg"
        >
          {isMinting || isConfirming ? (
            <>
              <Loader2 className="w-5 h-5 inline mr-2 animate-spin" />
              {isMinting ? 'Minting...' : 'Menunggu konfirmasi...'}
            </>
          ) : (
            'Mint NFT'
          )}
        </button>

        {isConfirmed && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-semibold text-green-800">NFT berhasil di-mint!</p>
              <a
                href={`https://basescan.org/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-green-600 hover:underline"
              >
                Lihat di Basescan
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface MintBatchProps {
  paymentMethod: 'eth' | 'usdc';
}

export function MintBatch({ paymentMethod }: MintBatchProps) {
  const { address } = useAccount();
  const [recipient, setRecipient] = useState(address || '');
  const [uris, setUris] = useState(['']);
  const [quantity, setQuantity] = useState(1);

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

  const { writeContract: mintBatch, data: hash, isPending: isMinting } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const handleAddURI = () => {
    setUris([...uris, '']);
  };

  const handleURIChange = (index: number, value: string) => {
    const newUris = [...uris];
    newUris[index] = value;
    setUris(newUris);
    setQuantity(newUris.length);
  };

  const handleMint = async () => {
    if (!recipient || uris.some(uri => !uri)) {
      alert('Harap isi semua URI');
      return;
    }

    try {
      if (paymentMethod === 'eth' && mintPriceEth) {
        const totalPrice = mintPriceEth * BigInt(quantity);
        await mintBatch({
          address: CONTRACT_ADDRESS,
          abi: contractAbi,
          functionName: 'batchMintNFT',
          args: [recipient, uris, quantity],
          value: totalPrice,
        });
      } else if (paymentMethod === 'usdc' && mintPriceUsdc) {
        await mintBatch({
          address: CONTRACT_ADDRESS,
          abi: contractAbi,
          functionName: 'batchMintNFTWithUsdc',
          args: [recipient, uris, quantity],
        });
      }
    } catch (error: any) {
      console.error('Batch mint error:', error);
      alert(error?.shortMessage || 'Error saat batch minting');
    }
  };

  return (
    <div className="card">
      <h3 className="text-2xl font-bold text-sky-blue-800 mb-6">
        Batch Mint NFT {paymentMethod === 'eth' ? 'dengan ETH' : 'dengan USDC'}
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-sky-blue-700 mb-2">
            Alamat Penerima
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-sky-blue-700 mb-2">
            Token URIs ({quantity} NFT)
          </label>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {uris.map((uri, index) => (
              <input
                key={index}
                type="text"
                value={uri}
                onChange={(e) => handleURIChange(index, e.target.value)}
                placeholder={`URI untuk NFT #${index + 1}`}
                className="input-field"
              />
            ))}
          </div>
          <button
            onClick={handleAddURI}
            className="btn-secondary mt-2 text-sm"
          >
            + Tambah URI
          </button>
        </div>

        <div className="stat-card">
          <div className="flex justify-between items-center">
            <span className="text-sky-blue-700 font-semibold">Total Harga ({quantity} NFT):</span>
            <span className="text-sky-blue-800 font-bold text-lg">
              {paymentMethod === 'eth'
                ? mintPriceEth
                  ? `${formatEther(mintPriceEth * BigInt(quantity))} ETH`
                  : 'Loading...'
                : mintPriceUsdc
                ? `${formatUnits(mintPriceUsdc * BigInt(quantity), 6)} USDC`
                : 'Loading...'}
            </span>
          </div>
        </div>

        <button
          onClick={handleMint}
          disabled={isMinting || isConfirming}
          className="btn-primary w-full text-lg"
        >
          {isMinting || isConfirming ? (
            <>
              <Loader2 className="w-5 h-5 inline mr-2 animate-spin" />
              {isMinting ? 'Minting...' : 'Menunggu konfirmasi...'}
            </>
          ) : (
            `Mint ${quantity} NFT`
          )}
        </button>

        {isConfirmed && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-semibold text-green-800">
                {quantity} NFT berhasil di-mint!
              </p>
              <a
                href={`https://basescan.org/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-green-600 hover:underline"
              >
                Lihat di Basescan
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
