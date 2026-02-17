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
  const [method, setMethod] = useState("");

  // 1. FUNGSI UNTUK EKSTENSI BROWSER (Chrome/Firefox)
  const connectInjected = async () => {
    setLoading(true);
    setMethod("injected");
    try {
      // Cek apakah ekstensi terpasang di browser
      if (typeof window === "undefined" || !(window as any).ethereum) {
        alert("🦊 Ekstensi MetaMask tidak terdeteksi di browser ini! Silakan gunakan opsi WalletConnect atau buka dari browser bawaan MetaMask.");
        return;
      }
      
      const ethProvider = (window as any).ethereum;
      
      // Meminta izin koneksi ke ekstensi
      await ethProvider.request({ method: 'eth_requestAccounts' });
      
      const walletClient = createWalletClient({
        chain: sepolia,
        transport: custom(ethProvider)
      });

      const [address] = await walletClient.getAddresses();
      
      // Kirim provider ekstensi browser ke page.tsx
      onConnect(address, ethProvider);
      
    } catch (error: any) {
      console.error("Gagal connect extension:", error);
      if (error.code === 4001) {
        alert("Koneksi ditolak oleh pengguna.");
      }
    } finally {
      setLoading(false);
      setMethod("");
    }
  };

  // 2. FUNGSI UNTUK WALLETCONNECT (Mobile/QR Code)
  const connectWC = async () => {
    setLoading(true);
    setMethod("wc");
    try {
      const provider = await EthereumProvider.init({
        projectId: "ee5cc44d6958f7a79fc4d378c980b362", 
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
      
      // Kirim provider WalletConnect ke page.tsx
      onConnect(address, provider); 
      
    } catch (error) {
      console.error("Gagal connect WalletConnect:", error);
    } finally {
      setLoading(false);
      setMethod("");
    }
  };

  // --- RENDER UI: 2 TOMBOL PILIHAN ---
  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Tombol Ekstensi Browser */}
      <button 
        onClick={connectInjected}
        disabled={loading}
        className="bg-[#F6851B] hover:bg-[#e2761b] text-white font-bold py-3 px-6 sm:py-4 rounded-xl shadow-lg transition-all text-sm sm:text-lg w-full flex items-center justify-center gap-3 disabled:opacity-50"
      >
        <span className="text-2xl">🦊</span>
        {loading && method === "injected" ? "Membuka Ekstensi..." : "Ekstensi Browser (PC)"}
      </button>

      {/* Garis Pemisah (Divider) */}
      <div className="flex items-center gap-3 my-1 opacity-70">
        <hr className="flex-grow border-gray-500" />
        <span className="text-xs text-gray-400 font-mono tracking-widest">ATAU</span>
        <hr className="flex-grow border-gray-500" />
      </div>

      {/* Tombol WalletConnect */}
      <button 
        onClick={connectWC}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 sm:py-4 rounded-xl shadow-lg transition-all text-sm sm:text-lg w-full flex items-center justify-center gap-3 disabled:opacity-50"
      >
        <span className="text-2xl">📱</span>
        {loading && method === "wc" ? "Membuka QR..." : "WalletConnect (HP / QR)"}
      </button>
    </div>
  );
}