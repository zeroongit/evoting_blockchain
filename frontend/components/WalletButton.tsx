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

  const connectWallet = async () => {
    setLoading(true);
    try {
      // 1. Inisialisasi WalletConnect
      const provider = await EthereumProvider.init({
        projectId: "ee5cc44d6958f7a79fc4d378c980b362",
        showQrModal: true,
        chains: [sepolia.id],
        metadata: {
          name: "Bilik Suara Digital",
          description: "Aplikasi E-Voting ZK-SNARK",
          url: "https://evoting-blockchain.vercel.app", // Ganti dengan URL Vercel kamu
          icons: ["https://avatars.githubusercontent.com/u/37784886"]
        }
      });

      // 2. Munculkan Pop-up WalletConnect
      await provider.connect(); 

      // 3. Ambil Address dan kirim ke page.tsx beserta provider-nya
      const walletClient = createWalletClient({
        chain: sepolia,
        transport: custom(provider)
      });

      const [address] = await walletClient.getAddresses();
      
      // Kirim address dan instance provider ke atas
      onConnect(address, provider); 

    } catch (error) {
      console.error("Gagal connect wallet:", error);
      alert("Koneksi dibatalkan atau gagal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={connectWallet}
      disabled={loading}
      className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-3 px-6 sm:py-4 sm:px-10 rounded-full shadow-lg transition-all text-base sm:text-xl w-full sm:w-auto"
    >
      {loading ? "Membuka Dompet..." : "Hubungkan Identitas (Wallet)"}
    </button>
  );
}