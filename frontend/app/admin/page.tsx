"use client";

import { useState, useEffect } from "react";
import { createWalletClient, custom, createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import WalletButton from "@/components/WalletButton";
import { NEXT_PUBLIC_EVOTING_ADDRESS, EVOTING_ABI } from "@/lib/constants";

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [userAddress, setUserAddress] = useState("");
  const [electionState, setElectionState] = useState<number | null>(null); // 0: Pending, 1: Active, 2: Ended
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  // Cek Status Admin & Status Pemilu saat wallet connect
  useEffect(() => {
    if (userAddress) {
      checkAuthority(userAddress);
    }
  }, [userAddress]);

  async function checkAuthority(address: string) {
    try {
      const publicClient = createPublicClient({ chain: sepolia, transport: http() });
      
      // 1. Cek apakah address ini terdaftar sebagai Authority di Smart Contract
      const isAuth = await publicClient.readContract({
        address: NEXT_PUBLIC_EVOTING_ADDRESS as `0x${string}`,
        abi: EVOTING_ABI,
        functionName: "authorities",
        args: [address],
      }) as boolean;

      setIsAdmin(isAuth);

      if (isAuth) {
        // 2. Jika Admin, ambil status pemilu saat ini (Election ID 0)
        const electionData: any = await publicClient.readContract({
          address: NEXT_PUBLIC_EVOTING_ADDRESS as `0x${string}`,
          abi: EVOTING_ABI,
          functionName: "getElection",
          args: [BigInt(0)],
        });
        setElectionState(electionData.state); // Enum: 0=Pending, 1=Active, 2=Ended
      }
    } catch (error) {
      console.error("Gagal cek admin:", error);
    }
  }

  // Fungsi Universal untuk Kirim Transaksi Admin
  async function handleAdminAction(action: "START" | "END") {
    if (!userAddress) return;
    setLoading(true);
    setStatusMsg(action === "START" ? "🚀 Memulai Pemilu..." : "🛑 Memberhentikan Pemilu...");

    try {
      const walletClient = createWalletClient({
        chain: sepolia,
        transport: custom((window as any).ethereum),
      });

      const hash = await walletClient.writeContract({
        address: NEXT_PUBLIC_EVOTING_ADDRESS as `0x${string}`,
        abi: EVOTING_ABI,
        functionName: action === "START" ? "startElection" : "endElection",
        args: [BigInt(0)], // Election ID 0
        account: userAddress as `0x${string}`,
      });

      setStatusMsg("⏳ Menunggu konfirmasi blockchain...");
      const publicClient = createPublicClient({ chain: sepolia, transport: http() });
      await publicClient.waitForTransactionReceipt({ hash });

      setStatusMsg("✅ Berhasil!");
      // Refresh status
      checkAuthority(userAddress);

    } catch (error: any) {
      console.error(error);
      alert("Gagal: " + (error.message || "Pastikan Anda adalah Admin"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-10 border-b border-gray-700 pb-6">
          <h1 className="text-3xl font-bold text-yellow-500">KPU Control Panel 🛠️</h1>
          <WalletButton onConnect={setUserAddress} />
        </div>

        {!userAddress ? (
          <div className="text-center py-20 bg-gray-800 rounded-xl">
            <p className="text-xl">Silakan login dengan Wallet Admin untuk mengakses panel ini.</p>
          </div>
        ) : !isAdmin ? (
          <div className="text-center py-20 bg-red-900/30 border border-red-500 rounded-xl">
            <h2 className="text-2xl font-bold text-red-500 mb-2">AKSES DITOLAK ⛔</h2>
            <p>Wallet Anda ({userAddress}) tidak terdaftar sebagai Panitia Pemilihan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* STATUS CARD */}
            <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700">
              <h2 className="text-xl font-bold mb-4 text-gray-400">Status Pemilu Saat Ini</h2>
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-4 h-4 rounded-full animate-pulse ${
                  electionState === 1 ? "bg-green-500" : electionState === 2 ? "bg-red-500" : "bg-yellow-500"
                }`}></div>
                <span className="text-4xl font-bold">
                  {electionState === 0 ? "PENDING" : electionState === 1 ? "ACTIVE (Berjalan)" : "ENDED (Selesai)"}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                Election ID: #0 <br/>
                Admin: {userAddress}
              </p>
            </div>

            {/* ACTION CARD */}
            <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 flex flex-col justify-center gap-4">
              <h2 className="text-xl font-bold mb-2 text-gray-400">Kontrol Pemilihan</h2>
              
              {loading && (
                <div className="bg-blue-900/50 text-blue-200 p-3 rounded text-center text-sm mb-2 animate-pulse">
                  {statusMsg}
                </div>
              )}

              {electionState === 0 && (
                <button
                  onClick={() => handleAdminAction("START")}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg transition transform active:scale-95 disabled:opacity-50"
                >
                  ▶️ MULAI PEMILU
                </button>
              )}

              {electionState === 1 && (
                <button
                  onClick={() => handleAdminAction("END")}
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg transition transform active:scale-95 disabled:opacity-50"
                >
                  ⏹️ STOP / AKHIRI PEMILU
                </button>
              )}

              {electionState === 2 && (
                <div className="text-center p-4 bg-gray-700 rounded-xl text-gray-400 font-bold">
                  ✅ Pemilu Telah Selesai. <br/>
                  <span className="text-xs font-normal">Hasil sudah final dan tidak dapat diubah.</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}