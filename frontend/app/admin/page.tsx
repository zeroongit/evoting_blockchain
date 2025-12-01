"use client";

import { useState, useEffect } from "react";
import { createWalletClient, custom, createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import WalletButton from "@/components/WalletButton";
import { NEXT_PUBLIC_EVOTING_ADDRESS, EVOTING_ABI } from "@/lib/constants";

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [userAddress, setUserAddress] = useState("");
  const [electionState, setElectionState] = useState<number | null>(null); // 0: Pending, 1: Active, 2: Ended, 3: Finalized
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [txHash, setTxHash] = useState("");

  // Cek Status Admin & Status Pemilu saat wallet connect
  useEffect(() => {
    if (userAddress) {
      checkAuthority(userAddress);
    }
  }, [userAddress]);

  async function checkAuthority(address: string) {
    try {
      const publicClient = createPublicClient({ chain: sepolia, transport: http() });
      
      // ✅ FIX: Gunakan .EVoting agar mengambil string alamat, bukan object
      const contractAddress = NEXT_PUBLIC_EVOTING_ADDRESS.EVoting as `0x${string}`;

      // 1. Cek apakah address ini terdaftar sebagai Authority di Smart Contract
      const isAuth = await publicClient.readContract({
        address: contractAddress, 
        abi: EVOTING_ABI,
        functionName: "authorities",
        args: [address],
      }) as boolean;

      setIsAdmin(isAuth);

      if (isAuth) {
        // 2. Jika Admin, ambil status pemilu saat ini (Election ID 0)
        const electionData: any = await publicClient.readContract({
          address: contractAddress,
          abi: EVOTING_ABI,
          functionName: "getElection",
          args: [BigInt(0)],
        });
        setElectionState(electionData.state); // Enum: 0=Pending, 1=Active, 2=Ended, 3=Finalized
      }
    } catch (error) {
      console.error("Gagal cek admin:", error);
    }
  }

  // ✅ Fungsi untuk kirim transaksi ke contract
  async function sendContractAction(functionName: "startElection" | "endElection" | "resetElection" | "finalizeElection", displayMsg: string) {
    if (!userAddress) return;
    setLoading(true);
    setStatusMsg(displayMsg);
    setTxHash("");

    try {
      const walletClient = createWalletClient({
        chain: sepolia,
        transport: custom((window as any).ethereum),
      });

      // ✅ FIX: Gunakan .EVoting di sini juga
      const contractAddress = NEXT_PUBLIC_EVOTING_ADDRESS.EVoting as `0x${string}`;

      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: EVOTING_ABI,
        functionName: functionName,
        args: [BigInt(0)], // Election ID 0
        account: userAddress as `0x${string}`,
      });

      setTxHash(hash);
      setStatusMsg("⏳ Menunggu konfirmasi blockchain...");
      
      const publicClient = createPublicClient({ chain: sepolia, transport: http() });
      await publicClient.waitForTransactionReceipt({ hash });

      setStatusMsg("✅ Berhasil!");
      
      // Refresh status setelah sukses
      setTimeout(() => {
        setStatusMsg("");
        checkAuthority(userAddress);
      }, 2000);

    } catch (error: any) {
      console.error(error);
      setStatusMsg("❌ Gagal: " + (error.message || "Error"));
    } finally {
      setLoading(false);
    }
  }

  const getStateColor = (state: number | null) => {
    switch (state) {
      case 0: return "bg-yellow-500";
      case 1: return "bg-green-500";
      case 2: return "bg-red-500";
      case 3: return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const getStateLabel = (state: number | null) => {
    switch (state) {
      case 0: return "PENDING (Belum Dimulai)";
      case 1: return "ACTIVE (Sedang Berjalan)";
      case 2: return "ENDED (Selesai)";
      case 3: return "FINALIZED (Final/Terkunci)";
      default: return "UNKNOWN";
    }
  };

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
                <div className={`w-4 h-4 rounded-full animate-pulse ${getStateColor(electionState)}`}></div>
                <span className="text-3xl font-bold">{getStateLabel(electionState)}</span>
              </div>
              <div className="text-sm text-gray-500 space-y-2">
                <p>Election ID: #0</p>
                <p>Admin: {userAddress?.slice(0, 10)}...{userAddress?.slice(-8)}</p>
                <p>State Code: {electionState}</p>
              </div>
            </div>

            {/* ACTION CARD */}
            <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700">
              <h2 className="text-xl font-bold mb-4 text-gray-400">Kontrol Pemilihan</h2>
              
              {statusMsg && (
                <div className="bg-blue-900/50 text-blue-200 p-3 rounded text-center text-sm mb-4 animate-pulse">
                  {statusMsg}
                  {txHash && (
                    <p className="text-xs mt-2 font-mono break-all">
                      TX: {txHash.slice(0, 10)}...{txHash.slice(-10)}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-3">
                {/* START BUTTON */}
                {electionState === 0 && (
                  <button
                    onClick={() => sendContractAction("startElection", "🚀 Memulai Pemilu...")}
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white font-bold py-4 rounded-xl shadow-lg transition transform active:scale-95 disabled:opacity-50"
                  >
                    ▶️ MULAI PEMILU
                  </button>
                )}

                {/* END BUTTON */}
                {electionState === 1 && (
                  <button
                    onClick={() => sendContractAction("endElection", "🛑 Mengakhiri Pemilu...")}
                    disabled={loading}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white font-bold py-4 rounded-xl shadow-lg transition transform active:scale-95 disabled:opacity-50"
                  >
                    ⏹️ STOP / AKHIRI PEMILU
                  </button>
                )}

                {/* RESET & FINALIZE (when ended) */}
                {electionState === 2 && (
                  <>
                    <button
                      onClick={() => sendContractAction("resetElection", "🔄 Mereset Pemilu...")}
                      disabled={loading}
                      className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-800 text-white font-bold py-3 rounded-xl shadow-lg transition transform active:scale-95 disabled:opacity-50"
                    >
                      🔄 RESET KE PENDING
                    </button>
                    <button
                      onClick={() => sendContractAction("finalizeElection", "🔒 Finalisasi Pemilu...")}
                      disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-bold py-3 rounded-xl shadow-lg transition transform active:scale-95 disabled:opacity-50"
                    >
                      🔒 FINALISASI (TERKUNCI)
                    </button>
                  </>
                )}

                {/* FINALIZED STATE */}
                {electionState === 3 && (
                  <div className="text-center p-4 bg-blue-700/30 border border-blue-500 rounded-xl text-blue-200 font-bold">
                    🔒 PEMILU FINALIZED <br/>
                    <span className="text-xs font-normal">Hasil sudah final dan TIDAK dapat direset.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}