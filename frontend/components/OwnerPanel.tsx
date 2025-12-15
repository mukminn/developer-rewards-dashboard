'use client';

import { useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, parseUnits, formatEther, formatUnits } from 'viem';
import { contractAbi } from '@/lib/contract';
import { CONTRACT_ADDRESS } from '@/lib/config';
import { 
  Download, 
  Settings, 
  Gift, 
  Loader2, 
  CheckCircle,
  AlertCircle,
  Lock,
  Unlock,
  Link,
  FileText
} from 'lucide-react';

export default function OwnerPanel() {
  const { address } = useAccount();
  const [newPriceEth, setNewPriceEth] = useState('');
  const [newPriceUsdc, setNewPriceUsdc] = useState('');
  const [ownerMintAddress, setOwnerMintAddress] = useState('');
  const [ownerMintURI, setOwnerMintURI] = useState('');
  const [tokenIdForURI, setTokenIdForURI] = useState('');
  const [newTokenURI, setNewTokenURI] = useState('');
  const [batchTokenIds, setBatchTokenIds] = useState('');
  const [batchURIs, setBatchURIs] = useState('');
  const [baseURI, setBaseURI] = useState('');

  // Check if user is owner
  const { data: owner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: contractAbi,
    functionName: 'owner',
  });

  const isOwner = address && owner && address.toLowerCase() === owner.toLowerCase();

  // Read balances
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

  const { data: mintingEnabled } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: contractAbi,
    functionName: 'nftMintingEnabled',
  });

  const { data: currentBaseURI } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: contractAbi,
    functionName: 'baseURI',
  });

  // Write functions
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const handleWithdrawEth = () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: contractAbi,
      functionName: 'withdrawEth',
    });
  };

  const handleWithdrawUsdc = () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: contractAbi,
      functionName: 'withdrawUsdc',
    });
  };

  const handleWithdrawAll = () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: contractAbi,
      functionName: 'withdrawAll',
    });
  };

  const handleToggleMinting = () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: contractAbi,
      functionName: 'toggleNFTMinting',
    });
  };

  const handleSetPrice = () => {
    if (!newPriceEth || !newPriceUsdc) {
      alert('Harap isi semua field');
      return;
    }

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: contractAbi,
      functionName: 'setNFTMintPrice',
      args: [
        parseEther(newPriceEth),
        parseUnits(newPriceUsdc, 6),
      ],
    });
  };

  const handleOwnerMint = () => {
    if (!ownerMintAddress || !ownerMintURI) {
      alert('Harap isi semua field');
      return;
    }

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: contractAbi,
      functionName: 'ownerMintNFT',
      args: [ownerMintAddress, ownerMintURI],
    });
  };

  const handleSetTokenURI = () => {
    if (!tokenIdForURI || !newTokenURI) {
      alert('Harap isi semua field');
      return;
    }

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: contractAbi,
      functionName: 'setTokenURI',
      args: [BigInt(tokenIdForURI), newTokenURI],
    });
  };

  const handleBatchSetTokenURI = () => {
    if (!batchTokenIds || !batchURIs) {
      alert('Harap isi semua field');
      return;
    }

    const tokenIds = batchTokenIds.split(',').map(id => BigInt(id.trim()));
    const uris = batchURIs.split(',').map(uri => uri.trim());

    if (tokenIds.length !== uris.length) {
      alert('Jumlah Token ID dan URI harus sama');
      return;
    }

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: contractAbi,
      functionName: 'batchSetTokenURI',
      args: [tokenIds, uris],
    });
  };

  const handleSetBaseURI = () => {
    if (!baseURI) {
      alert('Harap isi Base URI');
      return;
    }

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: contractAbi,
      functionName: 'setBaseURI',
      args: [baseURI],
    });
  };

  if (!isOwner) {
    return (
      <div className="card text-center py-12">
        <AlertCircle className="w-16 h-16 text-sky-blue-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-sky-blue-800 mb-2">
          Akses Ditolak
        </h3>
        <p className="text-sky-blue-600">
          Hanya contract owner yang bisa mengakses panel ini.
        </p>
        <p className="text-sm text-sky-blue-500 mt-2">
          Owner: {owner?.slice(0, 6)}...{owner?.slice(-4)}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Withdraw Section */}
      <div className="card">
        <h3 className="text-2xl font-bold text-sky-blue-800 mb-6 flex items-center gap-2">
          <Download className="w-6 h-6" />
          Withdraw Fees
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleWithdrawEth}
            disabled={isPending || isConfirming || !ethBalance || ethBalance === 0n}
            className="btn-primary"
          >
            {isPending || isConfirming ? (
              <>
                <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Withdraw ETH'
            )}
          </button>
          <button
            onClick={handleWithdrawUsdc}
            disabled={isPending || isConfirming || !usdcBalance || usdcBalance === 0n}
            className="btn-primary"
          >
            {isPending || isConfirming ? (
              <>
                <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Withdraw USDC'
            )}
          </button>
          <button
            onClick={handleWithdrawAll}
            disabled={isPending || isConfirming}
            className="btn-secondary"
          >
            {isPending || isConfirming ? (
              <>
                <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Withdraw All'
            )}
          </button>
        </div>

        {isConfirmed && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-semibold text-green-800">Transaksi berhasil!</p>
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

      {/* Settings Section */}
      <div className="card">
        <h3 className="text-2xl font-bold text-sky-blue-800 mb-6 flex items-center gap-2">
          <Settings className="w-6 h-6" />
          Pengaturan
        </h3>

        {/* Toggle Minting */}
        <div className="mb-6 p-4 bg-sky-blue-50 rounded-xl border border-sky-blue-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-semibold text-sky-blue-800">Status Minting</div>
              <div className="text-sm text-sky-blue-600">
                {mintingEnabled ? 'Minting saat ini aktif' : 'Minting saat ini nonaktif'}
              </div>
            </div>
            {mintingEnabled ? (
              <Unlock className="w-8 h-8 text-green-600" />
            ) : (
              <Lock className="w-8 h-8 text-red-600" />
            )}
          </div>
          <button
            onClick={handleToggleMinting}
            disabled={isPending || isConfirming}
            className="btn-secondary w-full"
          >
            {isPending || isConfirming ? (
              <>
                <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              mintingEnabled ? 'Nonaktifkan Minting' : 'Aktifkan Minting'
            )}
          </button>
        </div>

        {/* Set Price */}
        <div className="space-y-4">
          <h4 className="font-semibold text-sky-blue-800">Update Harga Mint</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-sky-blue-700 mb-2">
                Harga ETH
              </label>
              <input
                type="text"
                value={newPriceEth}
                onChange={(e) => setNewPriceEth(e.target.value)}
                placeholder="0.1"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-sky-blue-700 mb-2">
                Harga USDC
              </label>
              <input
                type="text"
                value={newPriceUsdc}
                onChange={(e) => setNewPriceUsdc(e.target.value)}
                placeholder="100"
                className="input-field"
              />
            </div>
          </div>
          <button
            onClick={handleSetPrice}
            disabled={isPending || isConfirming}
            className="btn-primary w-full"
          >
            {isPending || isConfirming ? (
              <>
                <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Update Harga'
            )}
          </button>
        </div>
      </div>

      {/* Owner Mint Section */}
      <div className="card">
        <h3 className="text-2xl font-bold text-sky-blue-800 mb-6 flex items-center gap-2">
          <Gift className="w-6 h-6" />
          Owner Mint (Airdrop)
        </h3>
        <p className="text-sm text-sky-blue-600 mb-4">
          Mint NFT tanpa fees untuk airdrop atau giveaway.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-sky-blue-700 mb-2">
              Alamat Penerima
            </label>
            <input
              type="text"
              value={ownerMintAddress}
              onChange={(e) => setOwnerMintAddress(e.target.value)}
              placeholder="0x..."
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-sky-blue-700 mb-2">
              Token URI
            </label>
            <input
              type="text"
              value={ownerMintURI}
              onChange={(e) => setOwnerMintURI(e.target.value)}
              placeholder="https://ipfs.io/ipfs/Qm..."
              className="input-field"
            />
          </div>
          <button
            onClick={handleOwnerMint}
            disabled={isPending || isConfirming}
            className="btn-primary w-full"
          >
            {isPending || isConfirming ? (
              <>
                <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                Minting...
              </>
            ) : (
              'Mint NFT Gratis'
            )}
          </button>
        </div>
      </div>

      {/* Token URI Management */}
      <div className="card">
        <h3 className="text-2xl font-bold text-sky-blue-800 mb-6 flex items-center gap-2">
          <Link className="w-6 h-6" />
          Kelola Token URI
        </h3>

        {/* Set Single Token URI */}
        <div className="mb-6 space-y-4">
          <h4 className="font-semibold text-sky-blue-800">Update Token URI (Single)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-sky-blue-700 mb-2">
                Token ID
              </label>
              <input
                type="text"
                value={tokenIdForURI}
                onChange={(e) => setTokenIdForURI(e.target.value)}
                placeholder="0"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-sky-blue-700 mb-2">
                New Token URI
              </label>
              <input
                type="text"
                value={newTokenURI}
                onChange={(e) => setNewTokenURI(e.target.value)}
                placeholder="https://ipfs.io/ipfs/Qm..."
                className="input-field"
              />
            </div>
          </div>
          <button
            onClick={handleSetTokenURI}
            disabled={isPending || isConfirming}
            className="btn-primary w-full"
          >
            {isPending || isConfirming ? (
              <>
                <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Update Token URI'
            )}
          </button>
        </div>

        {/* Batch Set Token URI */}
        <div className="mb-6 space-y-4">
          <h4 className="font-semibold text-sky-blue-800">Batch Update Token URI</h4>
          <div>
            <label className="block text-sm font-semibold text-sky-blue-700 mb-2">
              Token IDs (pisahkan dengan koma)
            </label>
            <input
              type="text"
              value={batchTokenIds}
              onChange={(e) => setBatchTokenIds(e.target.value)}
              placeholder="0, 1, 2, 3"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-sky-blue-700 mb-2">
              Token URIs (pisahkan dengan koma, urutan harus sama dengan Token IDs)
            </label>
            <textarea
              value={batchURIs}
              onChange={(e) => setBatchURIs(e.target.value)}
              placeholder="https://ipfs.io/ipfs/Qm1..., https://ipfs.io/ipfs/Qm2..., https://ipfs.io/ipfs/Qm3..."
              className="input-field min-h-[100px]"
            />
          </div>
          <button
            onClick={handleBatchSetTokenURI}
            disabled={isPending || isConfirming}
            className="btn-primary w-full"
          >
            {isPending || isConfirming ? (
              <>
                <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Batch Update Token URIs'
            )}
          </button>
        </div>

        {/* Set Base URI */}
        <div className="space-y-4">
          <h4 className="font-semibold text-sky-blue-800">Set Base URI</h4>
          <div className="bg-sky-blue-50 border border-sky-blue-200 rounded-xl p-4 mb-4">
            <p className="text-sm text-sky-blue-700 mb-2">
              <strong>Current Base URI:</strong>
            </p>
            <p className="text-xs text-sky-blue-600 font-mono break-all">
              {currentBaseURI || '(Tidak ada)'}
            </p>
            <p className="text-xs text-sky-blue-600 mt-2">
              Base URI akan digunakan untuk NFT yang tidak memiliki custom URI. Format: https://ipfs.io/ipfs/QmHash/
            </p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-sky-blue-700 mb-2">
              New Base URI
            </label>
            <input
              type="text"
              value={baseURI}
              onChange={(e) => setBaseURI(e.target.value)}
              placeholder="https://ipfs.io/ipfs/QmHash/"
              className="input-field"
            />
          </div>
          <button
            onClick={handleSetBaseURI}
            disabled={isPending || isConfirming}
            className="btn-primary w-full"
          >
            {isPending || isConfirming ? (
              <>
                <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Set Base URI'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

