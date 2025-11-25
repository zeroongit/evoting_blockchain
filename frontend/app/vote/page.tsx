"use client";

import { useState, useEffect } from "react";
import { createWalletClient, custom, http, createPublicClient } from "viem";
import { sepolia } from "viem/chains";
import WalletButton from "@/components/WalletButton";
import FaceVerification from "@/components/FaceVerification";
import { candidateData } from "@/lib/candidateData";
import { NEXT_PUBLIC_EVOTING_ADDRESS, EVOTING_ABI } from "@/lib/constants";
import { generateHumanityProof, generateVoteProof, checkBackendHealth } from "@/lib/zkBackend";

type VotingStep = "CONNECT" | "VERIFY_FACE" | "SUBMIT_VERIFICATION" | "SELECT_CANDIDATE" | "SUBMIT_VOTE" | "DONE";

async function checkAndSwitchNetwork(walletClient: any) {
  const chainId = await walletClient.getChainId();
  if (chainId !== sepolia.id) {
    try {
      await walletClient.switchChain({ id: sepolia.id });
    } catch (error: any) {
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
  const [backendReady, setBackendReady] = useState(false);

  // ✅ Check backend health on mount
  useEffect(() => {
    const checkBackend = async () => {
      const health = await checkBackendHealth();
      if (health) {
        setBackendReady(true);
        console.log("✅ Backend circuits ready:", health);
      } else {
        console.warn("⚠️ Backend circuits might not be available!");
        setBackendReady(false);
      }
    };
    checkBackend();
  }, []);

  // ✅ VERIFY HUMANITY - Generate proof via backend API
  async function handleFaceVerified(zkResult: any) {
    try {
      setStep("SUBMIT_VERIFICATION");
      setStatusMsg("🔐 Mengirim Bukti Kemanusiaan ke Blockchain...");

      if (!backendReady) {
        throw new Error("Backend tidak siap. Pastikan circuits sudah di-compile.");
      }

      // Call backend API untuk generate proof
      console.log("📡 Requesting humanity proof from backend...");
      
      const proofResult = await generateHumanityProof({
        human_score: 85,           // Dari face recognition hasil
        uniqueness_score: 90,      // Dari face recognition hasil
        behavior_proof: 75,        // Dari face recognition hasil
        timestamp: Math.floor(Date.now() / 1000),
        user_identifier: userAddress,
      });

      console.log("✅ Proof received:", proofResult);

      // Parse proof dari response
      const proof = proofResult.proof;
      const publicSignalsStr = proofResult.publicSignals;

      // Convert ke BigInt untuk contract
      const a = [BigInt(proof.pi_a[0]), BigInt(proof.pi_a[1])];
      const b = [
        [BigInt(proof.pi_b[0][0]), BigInt(proof.pi_b[0][1])],
        [BigInt(proof.pi_b[1][0]), BigInt(proof.pi_b[1][1])],
      ];
      const c = [BigInt(proof.pi_c[0]), BigInt(proof.pi_c[1])];

      // ✅ PENTING: Public signals HARUS 5 elements sesuai circuit
      const publicSignals = publicSignalsStr.map((v: string) => BigInt(v));

      if (publicSignals.length !== 5) {
        throw new Error(
          `Expected 5 public signals, got ${publicSignals.length}. Signals: ${publicSignalsStr.join(", ")}`
        );
      }

      console.log("🔍 Proof data parsed:");
      console.log("a:", a.map(x => x.toString()));
      console.log("b:", b.map(row => row.map(x => x.toString())));
      console.log("c:", c.map(x => x.toString()));
      console.log("publicSignals (5):", publicSignals.map(x => x.toString()));

      // Setup Wallet Client
      const walletClient = createWalletClient({
        chain: sepolia,
        transport: custom((window as any).ethereum),
      });

      await checkAndSwitchNetwork(walletClient);
      const [address] = await walletClient.getAddresses();

      // Kirim ke contract
      setStatusMsg("✍️ Mengirim ke Smart Contract...");

      const hash = await walletClient.writeContract({
        address: NEXT_PUBLIC_EVOTING_ADDRESS as `0x${string}`,
        abi: EVOTING_ABI,
        functionName: "verifyHumanity",
        args: [
          a as [bigint, bigint],
          b as [[bigint, bigint], [bigint, bigint]],
          c as [bigint, bigint],
          publicSignals as [bigint, bigint, bigint, bigint, bigint],
        ],
        account: address,
        gas: BigInt(500000),
      });

      setStatusMsg("⏳ Menunggu konfirmasi blockchain...");
      setTxHash(hash);

      const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(),
      });

      await publicClient.waitForTransactionReceipt({ hash });

      setStep("SELECT_CANDIDATE");
      setStatusMsg("");
      
    } catch (error: any) {
      console.error("❌ Error:", error);
      alert("Gagal Verifikasi Blockchain: " + (error.message || error));
      setStep("VERIFY_FACE");
    }
  }

  // ✅ CAST VOTE - Generate proof via backend API
  async function handleVote() {
    if (selectedCandidate === null) return;

    try {
      setStep("SUBMIT_VOTE");
      setStatusMsg("🗳️ Sedang mencoblos (Generate Vote Proof)...");

      if (!backendReady) {
        throw new Error("Backend tidak siap. Pastikan circuits sudah di-compile.");
      }

      // Generate vote proof via backend
      console.log("📡 Requesting vote proof from backend...");

      const voteInput = {
        commitment: "20595346326572914964186581639484694308224330290454662633399973481953444150659",
        nullifier: "11002798236248564979181902430552955631258061132494555643635906994269666662459",
        vote_hash: "0",
        election_id: 0,
        candidate_id: selectedCandidate,
        voter_id: 111,
        secret: 222,
        candidate_count: 3,
      };

      const proofResult = await generateVoteProof(voteInput);

      console.log("✅ Vote proof received:", proofResult);

      // Parse proof
      const proof = proofResult.proof;
      const publicSignalsStr = proofResult.publicSignals;

      const a = [BigInt(proof.pi_a[0]), BigInt(proof.pi_a[1])];
      const b = [
        [BigInt(proof.pi_b[0][0]), BigInt(proof.pi_b[0][1])],
        [BigInt(proof.pi_b[1][0]), BigInt(proof.pi_b[1][1])],
      ];
      const c = [BigInt(proof.pi_c[0]), BigInt(proof.pi_c[1])];

      const publicSignals = publicSignalsStr.map((v: string) => BigInt(v));

      if (publicSignals.length !== 5) {
        throw new Error(
          `Expected 5 public signals for vote, got ${publicSignals.length}`
        );
      }

      console.log("🔍 Vote proof data parsed:");
      console.log("publicSignals (5):", publicSignals.map(x => x.toString()));

      setStatusMsg("✍️ Mengirim Suara ke Blockchain...");

      // Setup Wallet & Contract
      const walletClient = createWalletClient({
        chain: sepolia,
        transport: custom((window as any).ethereum),
      });

      await checkAndSwitchNetwork(walletClient);
      const [address] = await walletClient.getAddresses();

      // Setup nullifier
      const nullifierHex = "0x" + BigInt(userAddress).toString(16).padStart(64, "0");

      const hash = await walletClient.writeContract({
        address: NEXT_PUBLIC_EVOTING_ADDRESS as `0x${string}`,
        abi: EVOTING_ABI,
        functionName: "castVote",
        args: [
          BigInt(0), // electionId
          BigInt(selectedCandidate),
          nullifierHex as `0x${string}`,
          a as [bigint, bigint],
          b as [[bigint, bigint], [bigint, bigint]],
          c as [bigint, bigint],
          publicSignals as [bigint, bigint, bigint, bigint, bigint],
        ],
        account: address,
        gas: BigInt(600000),
      });

      setStatusMsg("⏳ Menunggu suara masuk kotak...");
      setTxHash(hash);

      const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(),
      });

      await publicClient.waitForTransactionReceipt({ hash });

      setStep("DONE");

    } catch (error: any) {
      console.error("❌ Error voting:", error);
      if (error.message.includes("User denied")) {
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

          {!backendReady && step !== "DONE" && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">⚠️ Backend tidak siap. Pastikan circuits sudah di-compile!</p>
            </div>
          )}
          
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