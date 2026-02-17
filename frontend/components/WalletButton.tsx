"use client";

import { useState } from "react";
import { EthereumProvider } from "@walletconnect/ethereum-provider";
import { createWalletClient, custom } from "viem";
import { sepolia } from "viem/chains";

interface WalletButtonProps {
  onConnect: (address: string, provider: any) => void;
}

export default function WalletButton({ onConnect }: WalletButtonProps) {
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  const connectSmartWallet = async () => {
    setLoading(true);
    
    try {
      // CEK KONDISI 1: Apakah ada dompet lokal (Ekstensi PC atau In-App Browser)?
      if (typeof window !== "undefined" && (window as any).ethereum) {
        setLoadingText("Membuka Dompet Lokal...");
        const ethProvider = (window as any).ethereum;
        
        // Minta izin ke ekstensi/dompet lokal
        await ethProvider.request({ method: 'eth_requestAccounts' });
        
        const walletClient = createWalletClient({
          chain: sepolia,
          transport: custom(ethProvider)
        });

        const [address] = await walletClient.getAddresses();
        onConnect(address, ethProvider);
        return; // Hentikan fungsi di sini agar tidak lanjut ke WalletConnect
      }

      // CEK KONDISI 2: Jika tidak ada dompet lokal, otomatis gunakan WalletConnect
      setLoadingText("Membuka WalletConnect...");
      
      const provider = await EthereumProvider.init({
        projectId: "ee5cc44d6958f7a79fc4d378c980b362", // <--- PASTIKAN ISI PROJECT ID KAMU DI SINI
        showQrModal: true,
        chains: [sepolia.id],
        rpcMap: {
          [sepolia.id]: "https://rpc.sepolia.org",
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
        chain: sepolia,
        transport: custom(provider)
      });

      const [address] = await walletClient.getAddresses();
      onConnect(address, provider); 

    } catch (error: any) {
      console.error("Gagal connect wallet:", error);
      if (error.code === 4001) {
        alert("Koneksi ditolak oleh pengguna.");
      }
    } finally {
      setLoading(false);
      setLoadingText("");
    }
  };

  return (
    <button 
      onClick={connectSmartWallet}
      disabled={loading}
      className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-4 px-8 sm:px-12 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all text-base sm:text-xl w-full sm:w-auto flex items-center justify-center gap-3 disabled:opacity-70"
    >
      <span className="text-2xl">🔐</span>
      {loading ? loadingText : "Hubungkan Identitas (Wallet)"}
    </button>
  );
}