'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Wallet } from 'lucide-react';

export default function Header() {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-sky-blue-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-blue-500 to-sky-blue-600 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-sky-blue-800">Unified Fee NFT</h2>
              <p className="text-xs text-sky-blue-600">Mint dengan ETH atau USDC</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {isConnected && (
              <div className="hidden md:flex items-center gap-2 text-sm text-sky-blue-700">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Terhubung</span>
              </div>
            )}
            {isConnected ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-sky-blue-700 font-mono">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
                <button
                  onClick={() => disconnect()}
                  className="btn-secondary text-sm py-2 px-4"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                {connectors.map((connector) => (
                  <button
                    key={connector.uid}
                    onClick={() => connect({ connector })}
                    className="btn-primary text-sm py-2 px-4"
                  >
                    Connect {connector.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

