'use client';

import { useAccount, useConnect } from 'wagmi';
import { useState } from 'react';
import Header from '@/components/Header';
import Dashboard from '@/components/Dashboard';
import MintSection from '@/components/MintSection';
import OwnerPanel from '@/components/OwnerPanel';
import MyNFTs from '@/components/MyNFTs';
import { Sparkles, Zap, Users, Coins } from 'lucide-react';

export default function Home() {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const [activeTab, setActiveTab] = useState<'mint' | 'mynfts' | 'dashboard' | 'owner'>('mint');

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-12 h-12 text-sky-blue-600" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-sky-blue-600 to-sky-blue-800 bg-clip-text text-transparent">
              NFT Minting Platform
            </h1>
          </div>
          <p className="text-xl text-sky-blue-700 mt-4">
            Platform NFT Minting dengan sistem fees terpadu
          </p>
          <p className="text-sm text-sky-blue-600 mt-2">
            Mint NFT dengan ETH atau USDC • Batch minting • Owner airdrop • Fee management
          </p>
          
          {!isConnected && (
            <div className="mt-8">
              <div className="flex gap-3 justify-center">
                {connectors.map((connector) => (
                  <button
                    key={connector.uid}
                    onClick={() => connect({ connector })}
                    className="btn-primary text-lg px-8 py-4"
                  >
                    Sambungkan {connector.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="card text-center">
            <Zap className="w-10 h-10 text-sky-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-sky-blue-800 mb-2">Mint Cepat</h3>
            <p className="text-sm text-sky-blue-600">Mint NFT dengan satu klik</p>
          </div>
          <div className="card text-center">
            <Coins className="w-10 h-10 text-sky-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-sky-blue-800 mb-2">Multi Payment</h3>
            <p className="text-sm text-sky-blue-600">Bayar dengan ETH atau USDC</p>
          </div>
          <div className="card text-center">
            <Users className="w-10 h-10 text-sky-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-sky-blue-800 mb-2">Batch Mint</h3>
            <p className="text-sm text-sky-blue-600">Mint banyak NFT sekaligus</p>
          </div>
          <div className="card text-center">
            <Sparkles className="w-10 h-10 text-sky-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-sky-blue-800 mb-2">Aman & Terpercaya</h3>
            <p className="text-sm text-sky-blue-600">Smart contract terverifikasi</p>
          </div>
        </div>

        {isConnected && (
          <>
            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b-2 border-sky-blue-200 overflow-x-auto">
              <button
                onClick={() => setActiveTab('mint')}
                className={`px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
                  activeTab === 'mint'
                    ? 'text-sky-blue-600 border-b-2 border-sky-blue-600'
                    : 'text-sky-blue-400 hover:text-sky-blue-600'
                }`}
              >
                Mint NFT
              </button>
              <button
                onClick={() => setActiveTab('mynfts')}
                className={`px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
                  activeTab === 'mynfts'
                    ? 'text-sky-blue-600 border-b-2 border-sky-blue-600'
                    : 'text-sky-blue-400 hover:text-sky-blue-600'
                }`}
              >
                NFT Saya
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
                  activeTab === 'dashboard'
                    ? 'text-sky-blue-600 border-b-2 border-sky-blue-600'
                    : 'text-sky-blue-400 hover:text-sky-blue-600'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('owner')}
                className={`px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
                  activeTab === 'owner'
                    ? 'text-sky-blue-600 border-b-2 border-sky-blue-600'
                    : 'text-sky-blue-400 hover:text-sky-blue-600'
                }`}
              >
                Owner Panel
              </button>
            </div>

            {/* Content */}
            {activeTab === 'mint' && <MintSection />}
            {activeTab === 'mynfts' && <MyNFTs />}
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'owner' && <OwnerPanel />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 py-8 border-t border-sky-blue-200 bg-white/50">
        <div className="container mx-auto px-4 text-center text-sky-blue-600">
          <p>© 2024 Unified Fee NFT Platform - Built with ❤️ on Base Network</p>
          <p className="text-xs mt-2 text-sky-blue-500">
            Smart Contract: <a href={`https://basescan.org/address/${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x...'}`} target="_blank" rel="noopener noreferrer" className="hover:underline">View on Basescan</a>
          </p>
        </div>
      </footer>
    </div>
  );
}

