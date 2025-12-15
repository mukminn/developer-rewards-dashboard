'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, usePublicClient } from 'wagmi';
import { contractAbi } from '@/lib/contract';
import { CONTRACT_ADDRESS } from '@/lib/config';
import { Image, Package, ExternalLink, Loader2 } from 'lucide-react';

interface NFTData {
  tokenId: bigint;
  uri: string;
  metadata?: any;
}

export default function MyNFTs() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [nfts, setNfts] = useState<NFTData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMetadata, setLoadingMetadata] = useState<Set<number>>(new Set());

  // Get balance
  const { data: balance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: contractAbi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    enabled: !!address,
  });

  // Fetch NFTs
  useEffect(() => {
    if (!address || !balance || !publicClient) {
      setLoading(false);
      return;
    }

    const fetchNFTs = async () => {
      setLoading(true);
      const nftList: NFTData[] = [];
      
      try {
        // Get all token IDs owned by user
        for (let i = 0; i < Number(balance); i++) {
          try {
            const tokenId = await publicClient.readContract({
              address: CONTRACT_ADDRESS,
              abi: contractAbi,
              functionName: 'tokenOfOwnerByIndex',
              args: [address, BigInt(i)],
            });

            if (tokenId) {
              // Get token URI
              let uri = '';
              try {
                uri = await publicClient.readContract({
                  address: CONTRACT_ADDRESS,
                  abi: contractAbi,
                  functionName: 'tokenURI',
                  args: [tokenId],
                }) as string;
              } catch (error) {
                console.error(`Error fetching URI for token ${tokenId}:`, error);
              }

              nftList.push({
                tokenId: tokenId as bigint,
                uri,
              });
            }
          } catch (error) {
            console.error(`Error fetching token ${i}:`, error);
          }
        }
      } catch (error) {
        console.error('Error fetching NFTs:', error);
      }

      setNfts(nftList);
      setLoading(false);
    };

    fetchNFTs();
  }, [address, balance, publicClient]);

  // Fetch metadata for a token
  const fetchMetadata = async (token: NFTData, index: number) => {
    if (!token.uri || loadingMetadata.has(index)) return;

    setLoadingMetadata(prev => new Set(prev).add(index));

    try {
      const response = await fetch(token.uri);
      if (response.ok) {
        const metadata = await response.json();
        setNfts(prev => {
          const updated = [...prev];
          updated[index] = { ...updated[index], metadata };
          return updated;
        });
      }
    } catch (error) {
      console.error('Error fetching metadata:', error);
    } finally {
      setLoadingMetadata(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
  };

  if (!address) {
    return (
      <div className="card text-center py-12">
        <Package className="w-16 h-16 text-sky-blue-400 mx-auto mb-4" />
        <p className="text-sky-blue-600">Silakan hubungkan wallet untuk melihat NFT Anda</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card text-center py-12">
        <Loader2 className="w-12 h-12 text-sky-blue-600 mx-auto mb-4 animate-spin" />
        <p className="text-sky-blue-600">Memuat NFT Anda...</p>
      </div>
    );
  }

  if (nfts.length === 0) {
    return (
      <div className="card text-center py-12">
        <Package className="w-16 h-16 text-sky-blue-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-sky-blue-800 mb-2">
          Belum Ada NFT
        </h3>
        <p className="text-sky-blue-600">
          Anda belum memiliki NFT dari collection ini. Mulai mint sekarang!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-sky-blue-800 flex items-center gap-2">
            <Package className="w-6 h-6" />
            NFT Saya ({nfts.length})
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nfts.map((nft, index) => (
          <div key={index} className="card hover:shadow-xl transition-shadow">
            <div className="aspect-square bg-gradient-to-br from-sky-blue-100 to-sky-blue-200 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
              {nft.metadata?.image ? (
                <img
                  src={nft.metadata.image}
                  alt={nft.metadata.name || `NFT #${nft.tokenId.toString()}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="text-center p-8">
                  <Image className="w-16 h-16 text-sky-blue-400 mx-auto mb-2" />
                  <p className="text-sm text-sky-blue-600">No Image</p>
                  {nft.uri && (
                    <button
                      onClick={() => fetchMetadata(nft, index)}
                      disabled={loadingMetadata.has(index)}
                      className="mt-3 text-xs btn-secondary py-1 px-3"
                    >
                      {loadingMetadata.has(index) ? (
                        <>
                          <Loader2 className="w-3 h-3 inline mr-1 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Load Metadata'
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-sky-blue-800 text-lg">
                {nft.metadata?.name || `NFT #${nft.tokenId.toString()}`}
              </h4>
              {nft.metadata?.description && (
                <p className="text-sm text-sky-blue-600 line-clamp-2">
                  {nft.metadata.description}
                </p>
              )}
              
              <div className="flex items-center justify-between pt-2 border-t border-sky-blue-200">
                <span className="text-xs text-sky-blue-600 font-mono">
                  Token ID: {nft.tokenId.toString()}
                </span>
                {nft.uri && (
                  <a
                    href={nft.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-blue-600 hover:text-sky-blue-800"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>

              {nft.metadata?.attributes && (
                <div className="pt-2 border-t border-sky-blue-200">
                  <p className="text-xs font-semibold text-sky-blue-700 mb-1">Attributes:</p>
                  <div className="flex flex-wrap gap-1">
                    {nft.metadata.attributes.slice(0, 3).map((attr: any, i: number) => (
                      <span
                        key={i}
                        className="text-xs bg-sky-blue-100 text-sky-blue-700 px-2 py-1 rounded"
                      >
                        {attr.trait_type}: {attr.value}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

