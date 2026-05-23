"use client";

import { useState } from "react";
import { EthereumProvider } from "@walletconnect/ethereum-provider";
import { createWalletClient, custom } from "viem";
import { avalancheFuji } from "viem/chains";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface WalletButtonProps {
  onConnect: (address: string, provider: unknown) => void;
}

interface WindowProvider {
  isAvalanche?: boolean;
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
}

export default function WalletButton({ onConnect }: WalletButtonProps) {
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  const connectSmartWallet = async () => {
    setLoading(true);
    
    try {
      // 🚀 CEK KONDISI 1: Wajibkan Core Wallet (window.avalanche)
      const win = window as unknown as { avalanche?: WindowProvider; ethereum?: WindowProvider };
      
      let ethProvider = null;
      if (typeof window !== "undefined") {
        if (typeof win.avalanche !== 'undefined') {
          ethProvider = win.avalanche;
        } else if (typeof win.ethereum !== 'undefined' && win.ethereum.isAvalanche) {
          ethProvider = win.ethereum;
        }
      }

      if (ethProvider) {
        setLoadingText("Membuka Core Wallet...");
        
        // Minta izin akses akun ke Core Wallet
        await ethProvider.request({ method: 'eth_requestAccounts' });
        
        // Otomatis pastikan dompet berada di jaringan Avalanche Fuji
        try {
          await ethProvider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xa869' }],
          });
        } catch (switchError: unknown) {
          const err = switchError as { code?: number };
          if (err.code === 4902) {
            await ethProvider.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0xa869',
                chainName: 'Avalanche Fuji Testnet',
                nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
                rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
                blockExplorerUrls: ['https://testnet.snowtrace.io/']
              }]
            });
          }
        }
        
        const walletClient = createWalletClient({
          chain: avalancheFuji,
          transport: custom(ethProvider)
        });

        const [address] = await walletClient.getAddresses();
        toast.success("Core Wallet berhasil terhubung!");
        onConnect(address, ethProvider);
        return;
      }

      // CEK KONDISI 2: Jika tidak ada dompet lokal, otomatis gunakan WalletConnect
      setLoadingText("Membuka WalletConnect...");
      
      const provider = await EthereumProvider.init({
        projectId: "ee5cc44d6958f7a79fc4d378c980b362", // <--- PASTIKAN ISI PROJECT ID KAMU DI SINI
        showQrModal: true,
        chains: [avalancheFuji.id],
        rpcMap: {
          [avalancheFuji.id]: "https://api.avax-test.network/ext/bc/C/rpc",
        },
        metadata: {
          name: "Bilik Suara Digital",
          description: "Aplikasi E-Voting ZK-SNARK",
          url: "https://evoting-blockchain.vercel.app", 
          icons: ["https://avatars.githubusercontent.com/u/37784886"]
        }
      });

      try {
        await provider.connect(); 
      } catch (connectError) {
        console.warn("Membersihkan sesi lama...", connectError);
        await provider.disconnect();
        await provider.connect();
      }

      const walletClient = createWalletClient({
        chain: avalancheFuji,
        transport: custom(provider)
      });

      const [address] = await walletClient.getAddresses();
      toast.success("Wallet berhasil terhubung!");
      onConnect(address, provider); 

    } catch (error: unknown) {
      console.error("Gagal connect wallet:", error);
      const err = error as { code?: number };
      if (err.code === 4001) {
        toast.error("Koneksi ditolak oleh pengguna.");
      } else {
        toast.error("Gagal menghubungkan wallet!");
      }
    } finally {
      setLoading(false);
      setLoadingText("");
    }
  };

  return (
    <Button 
      onClick={connectSmartWallet}
      disabled={loading}
      size="lg"
      className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-6 px-8 sm:px-12 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all text-base sm:text-xl w-full sm:w-auto flex items-center justify-center gap-3"
    >
      <span className="text-2xl">🔐</span>
      {loading ? loadingText : "Hubungkan Identitas (Wallet)"}
    </Button>
  );
}