"use client";

import { useState } from "react";
import { createWalletClient, custom, http, createPublicClient } from "viem";
import { sepolia } from "viem/chains";
import WalletButton from "@/components/WalletButton";
import FaceVerification from "@/components/FaceVerification";
import { candidateData } from "@/lib/candidateData";
import { NEXT_PUBLIC_EVOTING_ADDRESS, EVOTING_ABI } from "@/lib/constants";
import { packGroth16ProofToBytes } from "@/lib/utils";
import { generateProof } from "@/lib/zk";

// Definisi Tahapan Voting
type VotingStep = "CONNECT" | "VERIFY_FACE" | "SUBMIT_VERIFICATION" | "SELECT_CANDIDATE" | "SUBMIT_VOTE" | "DONE";

async function checkAndSwitchNetwork(walletClient: any) {
  const chainId = await walletClient.getChainId();
  if (chainId !== sepolia.id) {
    try {
      await walletClient.switchChain({ id: sepolia.id });
    } catch (error: any) {
      // Jika error 4902 (Chain not found), user harus add manual (jarang terjadi untuk Sepolia)
      if (error.code === 4902) {
         alert("Tolong tambahkan network Sepolia ke MetaMask kamu.");
      }
      throw new Error("Harap ganti network ke Sepolia untuk melanjutkan.");
    }
  }
}

export default function VotePage() {
  const [step, setStep] = useState<VotingStep>("CONNECT");
  const [userAddress, setUserAddress] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [txHash, setTxHash] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);

  // --- 1. FUNGSI KIRIM TRANSAKSI VERIFIKASI WAJAH ---
  async function handleFaceVerified(zkResult: any) {
    try {
      setStep("SUBMIT_VERIFICATION");
      setStatusMsg("🔐 Mengirim Bukti Kemanusiaan ke Blockchain...");

      // A. Siapkan Data Proof
      const proofBytes = packGroth16ProofToBytes(zkResult.proof);
      const publicSignals = zkResult.publicSignals.map((x: string) => BigInt(x));

      console.log("Public Signals yang dikirim:", publicSignals);

      // B. Setup Wallet Client
      const walletClient = createWalletClient({
        chain: sepolia,
        transport: custom((window as any).ethereum),
      });

      await checkAndSwitchNetwork(walletClient);

      const [address] = await walletClient.getAddresses();

      // C. Panggil Contract: verifyHumanity
      const hash = await walletClient.writeContract({
        address: NEXT_PUBLIC_EVOTING_ADDRESS as `0x${string}`,
        abi: EVOTING_ABI,
        functionName: "verifyHumanity",
        args: [proofBytes, publicSignals],
        account: address,
      });

      setStatusMsg("⏳ Menunggu konfirmasi blockchain...");
      setTxHash(hash);

      // D. Tunggu Transaksi Selesai
      const publicClient = createPublicClient({ chain: sepolia, transport: http() });
      await publicClient.waitForTransactionReceipt({ hash });

      // E. Sukses -> Lanjut Pilih Kandidat
      setStep("SELECT_CANDIDATE");
      setStatusMsg("");
      
    } catch (error: any) {
      console.error(error);
      alert("Gagal Verifikasi Blockchain: " + (error.message || error));
      setStep("VERIFY_FACE"); // Ulangi
    }
  }

  // --- 2. FUNGSI KIRIM SUARA (VOTE) ---
  async function handleVote() {
    if (selectedCandidate === null) return;

    try {
      setStep("SUBMIT_VOTE");
      setStatusMsg("🗳️ Sedang mencoblos (Generate Vote Proof)...");

      // A. Generate Proof untuk Voting (Vote Circuit)
      // Kita butuh proof dummy yang valid secara struktur untuk contract
      // Di real app, input ini kompleks (Merkle Tree). Untuk demo skripsi, kita pakai input dummy yang valid di circuit.
      const voteInput = {
        commitment: 123, // Dummy inputs sesuai circuit vote.wasm
        nullifier: 456,
        vote_hash: 789,
        election_id: 0,
        voter_id: 111,
        secret: 222,
        candidate_id: selectedCandidate,
        candidate_count: 3
      };
      
      // Generate ZK Proof Voting
      const zkResult = await generateProof("vote", voteInput);
      const proofBytes = packGroth16ProofToBytes(zkResult.proof);

      setStatusMsg("✍️ Mengirim Suara ke Blockchain...");

      // B. Setup Nullifier (Agar tidak bisa double vote)
      // Kita buat Nullifier unik berdasarkan userAddress + ElectionID agar demo lancar
      // Di produksi, ini harus hash rahasia.
      const nullifierHex = "0x" + BigInt(userAddress).toString(16).padStart(64, "0"); 

      // C. Kirim Transaksi: castVote
      const walletClient = createWalletClient({
        chain: sepolia,
        transport: custom((window as any).ethereum),
      });

      await checkAndSwitchNetwork(walletClient);
      const [address] = await walletClient.getAddresses();

      const hash = await walletClient.writeContract({
        address: NEXT_PUBLIC_EVOTING_ADDRESS as `0x${string}`,
        abi: EVOTING_ABI,
        functionName: "castVote",
        // args: electionId, candidateId, nullifier, proof
        args: [BigInt(0), BigInt(selectedCandidate), nullifierHex as `0x${string}`, proofBytes], 
        account: userAddress as `0x${string}`,
      });

      setStatusMsg("⏳ Menunggu suara masuk kotak...");
      setTxHash(hash);

      const publicClient = createPublicClient({ chain: sepolia, transport: http() });
      await publicClient.waitForTransactionReceipt({ hash });

      setStep("DONE");

    } catch (error: any) {
      console.error(error);
      // Handle error user reject / rpc error
      if(error.message.includes("User denied")) {
         setStatusMsg("❌ Transaksi dibatalkan user.");
      } else {
         alert("Gagal Voting: " + error.message);
      }
      setStep("SELECT_CANDIDATE");
    }
  }

  // --- RENDER UI BERDASARKAN STEP ---

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        {/* HEADER PAGE */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900">Bilik Suara Digital</h1>
          <p className="mt-2 text-gray-600">
            {step === "DONE" 
              ? "Terima kasih telah berpartisipasi!" 
              : "Ikuti langkah-langkah berikut untuk memberikan suara."}
          </p>
          
          {/* PROGRESS BAR */}
          {step !== "DONE" && (
            <div className="flex justify-center mt-6 gap-2">
              <span className={`h-2 w-16 rounded-full ${["CONNECT", "VERIFY_FACE", "SUBMIT_VERIFICATION", "SELECT_CANDIDATE", "SUBMIT_VOTE"].includes(step) ? "bg-indigo-600" : "bg-gray-200"}`}></span>
              <span className={`h-2 w-16 rounded-full ${["VERIFY_FACE", "SUBMIT_VERIFICATION", "SELECT_CANDIDATE", "SUBMIT_VOTE"].includes(step) ? "bg-indigo-600" : "bg-gray-200"}`}></span>
              <span className={`h-2 w-16 rounded-full ${["SELECT_CANDIDATE", "SUBMIT_VOTE"].includes(step) ? "bg-indigo-600" : "bg-gray-200"}`}></span>
            </div>
          )}
        </div>

        {/* CONTENT CARD */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden min-h-[400px] relative">
          
          {/* LOADING OVERLAY */}
          {(step === "SUBMIT_VERIFICATION" || step === "SUBMIT_VOTE") && (
            <div className="absolute inset-0 bg-white/90 z-50 flex flex-col items-center justify-center p-8 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
              <h3 className="text-xl font-bold text-gray-800 animate-pulse">{statusMsg}</h3>
              {txHash && (
                <p className="mt-4 text-xs text-gray-500 bg-gray-100 p-2 rounded border font-mono">
                  Hash: {txHash}
                </p>
              )}
              <p className="mt-4 text-sm text-yellow-600">⚠️ Jangan tutup browser Anda.</p>
            </div>
          )}

          {/* STEP 1: CONNECT WALLET */}
          {step === "CONNECT" && (
            <div className="flex flex-col items-center justify-center h-full p-10 text-center">
              <div className="bg-indigo-100 p-4 rounded-full mb-6 text-4xl">💳</div>
              <h2 className="text-2xl font-bold mb-2">Langkah 1: Identifikasi Dompet</h2>
              <p className="text-gray-500 mb-8 max-w-md">
                Hubungkan dompet digital Anda (MetaMask) untuk mendapatkan akses ke bilik suara.
              </p>
              <WalletButton onConnect={(addr) => {
                setUserAddress(addr);
                setStep("VERIFY_FACE");
              }} />
            </div>
          )}

          {/* STEP 2: FACE VERIFICATION */}
          {step === "VERIFY_FACE" && (
            <div className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-2">Langkah 2: Verifikasi Biometrik</h2>
              <p className="text-gray-500 mb-6">
                Lakukan pemindaian wajah untuk membuktikan bahwa Anda manusia asli (Proof of Humanity).
              </p>
              {/* Panggil Komponen FaceVerification */}
              <FaceVerification onVerified={handleFaceVerified} />
            </div>
          )}

          {/* STEP 3: SELECT CANDIDATE */}
          {step === "SELECT_CANDIDATE" && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-bold">Langkah 3: Tentukan Pilihan</h2>
                 <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-bold">✅ Identitas Terverifikasi</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {candidateData.map((c) => (
                  <div 
                    key={c.id}
                    onClick={() => setSelectedCandidate(c.id)}
                    className={`cursor-pointer border-2 rounded-xl overflow-hidden transition-all transform hover:scale-105 ${selectedCandidate === c.id ? "border-indigo-600 shadow-2xl ring-2 ring-indigo-300" : "border-gray-200 hover:border-indigo-300"}`}
                  >
                    <div className={`${c.color} h-24 relative`}>
                      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-white rounded-full border-4 border-white overflow-hidden">
                        <img src={c.image} className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div className="pt-8 pb-4 px-2 text-center">
                      <h3 className="font-bold text-sm">{c.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">Nomor Urut {c.number}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <button
                  onClick={handleVote}
                  disabled={selectedCandidate === null}
                  className="bg-indigo-600 text-white font-bold py-3 px-12 rounded-full text-lg shadow-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
                >
                  {selectedCandidate !== null ? "KONFIRMASI PILIHAN 🗳️" : "Pilih Salah Satu"}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: DONE / SUCCESS */}
          {step === "DONE" && (
            <div className="flex flex-col items-center justify-center h-full p-12 text-center animate-in fade-in zoom-in duration-500">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-6xl">🎉</span>
              </div>
              <h2 className="text-3xl font-bold text-green-700 mb-2">Suara Berhasil Masuk!</h2>
              <p className="text-gray-600 mb-8 max-w-md">
                Terima kasih telah menggunakan hak pilih Anda. Suara Anda telah diamankan dengan kriptografi di Blockchain Sepolia.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 w-full max-w-md mb-6">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Bukti Transaksi (Tx Hash):</p>
                <a 
                  href={`https://sepolia.etherscan.io/tx/${txHash}`}
                  target="_blank"
                  className="text-xs text-blue-600 font-mono break-all hover:underline"
                >
                  {txHash}
                </a>
              </div>

              <a 
                href="/results" 
                className="text-indigo-600 font-bold hover:underline"
              >
                Lihat Hasil Sementara ➔
              </a>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}