"use client";

import { useState, useEffect } from "react";
import { createWalletClient, custom, http, createPublicClient } from "viem";
import { sepolia } from "viem/chains";
import WalletButton from "@/components/WalletButton";
import FaceVerification from "@/components/FaceVerification";
import { candidateData } from "@/lib/candidateData"; // Pastikan file ini ada
import { NEXT_PUBLIC_EVOTING_ADDRESS, EVOTING_ABI } from "@/lib/constants";
import { 
  generateHumanityProof, 
  generateVoteProof, 
  checkCircuitsAvailability 
} from "@/lib/zk"; 

type VotingStep = "CONNECT" | "VERIFY_FACE" | "SUBMIT_VERIFICATION" | "SELECT_CANDIDATE" | "SUBMIT_VOTE" | "DONE";

export default function VotePage() {
  const [step, setStep] = useState<VotingStep>("CONNECT");
  const [userAddress, setUserAddress] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [txHash, setTxHash] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [circuitsReady, setCircuitsReady] = useState(false);

  // 1. Cek Ketersediaan Sirkuit ZK di Folder Public
  useEffect(() => {
    const init = async () => {
      const isReady = await checkCircuitsAvailability();
      setCircuitsReady(isReady);
      if (isReady) console.log("✅ ZK Circuits siap.");
      else console.warn("⚠️ File circuits tidak ditemukan di /public/zk/");
    };
    init();
  }, []);

  // Helper: Switch Network ke Sepolia
  async function checkAndSwitchNetwork(walletClient: any) {
    const chainId = await walletClient.getChainId();
    if (chainId !== sepolia.id) {
      try {
        await walletClient.switchChain({ id: sepolia.id });
      } catch (error: any) {
        if (error.code === 4902) alert("Tolong tambahkan network Sepolia ke MetaMask.");
        throw new Error("Harap ganti network ke Sepolia.");
      }
    }
  }

  // 2. PROSES VERIFIKASI WAJAH & HUMANITY PROOF
  async function handleFaceVerified(zkResult: any) {
    try {
      setStep("SUBMIT_VERIFICATION");
      setStatusMsg("🧠 Menghitung Bukti Kemanusiaan (ZK-SNARK)...");

      // Input Dummy untuk Proof (Di Real App, ini dari hasil scan wajah asli)
      const proofInput = {
        human_score: 85,           
        uniqueness_score: 90,      
        behavior_proof: 75,        
        timestamp: Math.floor(Date.now() / 1000),
        user_identifier: userAddress,
      };

      // Generate Proof
      const proofResult = await generateHumanityProof(proofInput);

      // Parsing Output SnarkJS ke Format Solidity
      const proof = proofResult.proof;
      const publicSignalsStr = proofResult.publicSignals;

      const a = [BigInt(proof.pi_a[0]), BigInt(proof.pi_a[1])];
      const b = [
        [BigInt(proof.pi_b[0][1]), BigInt(proof.pi_b[0][0])],
        [BigInt(proof.pi_b[1][1]), BigInt(proof.pi_b[1][0])],
      ];
      const c = [BigInt(proof.pi_c[0]), BigInt(proof.pi_c[1])];
      
      // Convert signals ke BigInt
      const publicSignals = publicSignalsStr.map((v: string) => BigInt(v));
      
      console.log("🔍 Signals:", publicSignals);

      // Setup Wallet
      setStatusMsg("✍️ Meminta Tanda Tangan di Wallet...");
      const walletClient = createWalletClient({
        chain: sepolia,
        transport: custom((window as any).ethereum),
      });
      await checkAndSwitchNetwork(walletClient);
      const [address] = await walletClient.getAddresses();

      // ✅ FIX UTAMA: Gunakan .EVoting untuk mengambil string alamat
      const contractAddress = NEXT_PUBLIC_EVOTING_ADDRESS.EVoting as `0x${string}`;

      const hash = await walletClient.writeContract({
        address: contractAddress, 
        abi: EVOTING_ABI,
        functionName: "verifyHumanity",
        args: [
          a as [bigint, bigint],
          b as [[bigint, bigint], [bigint, bigint]],
          c as [bigint, bigint],
          publicSignals, // Kirim array langsung
        ],
        account: address,
        gas: BigInt(500000), // Gas limit manual biar aman
      });

      setStatusMsg("⏳ Menunggu konfirmasi Block...");
      setTxHash(hash);
      
      const publicClient = createPublicClient({ chain: sepolia, transport: http() });
      await publicClient.waitForTransactionReceipt({ hash });

      // Sukses -> Lanjut Pilih Kandidat
      setStep("SELECT_CANDIDATE");
      setStatusMsg("");
      
    } catch (error: any) {
      console.error("Error Verify:", error);
      alert("Gagal Verifikasi: " + (error.message || error));
      setStep("VERIFY_FACE"); // Kembali ke scan wajah
    }
  }

  // 3. PROSES VOTING (COBLOS)
  async function handleVote() {
    if (selectedCandidate === null) return;
    try {
      setStep("SUBMIT_VOTE");
      setStatusMsg("🗳️ Menghitung Proof Suara Rahasia...");

      if (!circuitsReady) throw new Error("Sirkuit ZK belum siap (cek console).");

      // Dummy inputs untuk Vote Circuit
      const voteInput = {
        // commitment: "20595346326572914964186581639484694308224330290454662633399973481953444150659",
        // nullifier: "11002798236248564979181902430552955631258061132494555643635906994269666662459",
        // vote_hash: "0",
        election_id: 0,
        candidate_id: selectedCandidate,
        voter_id: 111,
        secret: 222,
      };

      // Generate Vote Proof
      const proofResult = await generateVoteProof(voteInput);

      // Parsing
      const proof = proofResult.proof;
      const publicSignalsStr = proofResult.publicSignals;
      
      const a = [BigInt(proof.pi_a[0]), BigInt(proof.pi_a[1])];
      const b = [
        [BigInt(proof.pi_b[0][1]), BigInt(proof.pi_b[0][0])],
        [BigInt(proof.pi_b[1][1]), BigInt(proof.pi_b[1][0])],
      ];
      const c = [BigInt(proof.pi_c[0]), BigInt(proof.pi_c[1])];
      const publicSignals = publicSignalsStr.map((v: string) => BigInt(v));

      // Persiapan Transaksi
      setStatusMsg("✍️ Mengirim Suara ke Blockchain...");
      const walletClient = createWalletClient({
        chain: sepolia,
        transport: custom((window as any).ethereum),
      });
      await checkAndSwitchNetwork(walletClient);
      const [address] = await walletClient.getAddresses();

      // Nullifier dari input (harus sama dengan yang dipakai di proof)
      // Di real case, ini hasil hash(userID + electionID)
      const nullifierVal = BigInt("11002798236248564979181902430552955631258061132494555643635906994269666662459");

      // ✅ FIX UTAMA: Gunakan .EVoting
      const contractAddress = NEXT_PUBLIC_EVOTING_ADDRESS.EVoting as `0x${string}`;

      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: EVOTING_ABI,
        functionName: "castVote",
        args: [
          BigInt(0),              // Election ID
          BigInt(selectedCandidate), // Candidate ID
          nullifierVal,           // Nullifier (uint256)
          a as [bigint, bigint],
          b as [[bigint, bigint], [bigint, bigint]],
          c as [bigint, bigint],
          publicSignals,          // Public Signals Array
        ],
        account: address,
        gas: BigInt(600000),
      });

      setStatusMsg("⏳ Merekam Suara di Blockchain...");
      setTxHash(hash);
      
      const publicClient = createPublicClient({ chain: sepolia, transport: http() });
      await publicClient.waitForTransactionReceipt({ hash });

      setStep("DONE");

    } catch (error: any) {
      console.error("Voting Error:", error);
      alert("Gagal Voting: " + error.message);
      setStep("SELECT_CANDIDATE");
    }
  }

  // --- RENDER UI ---
  return (
    <main className="min-h-screen bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10">
           <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2">
             Bilik Suara Digital
           </h1>
           <p className="text-gray-400">Pemilu yang Aman, Jujur, dan Terverifikasi ZK-SNARK</p>
        </div>

        {/* --- STEP 1: CONNECT WALLET --- */}
        {step === "CONNECT" && (
          <div className="flex flex-col items-center justify-center space-y-6 bg-gray-800 p-8 rounded-2xl border border-gray-700">
            <div className="text-6xl">🔒</div>
            <h2 className="text-2xl font-bold">Login Pemilih</h2>
            <p className="text-gray-400 text-center max-w-md">
              Hubungkan wallet Anda untuk memulai proses verifikasi identitas dan memberikan hak suara.
            </p>
            <WalletButton onConnect={(addr)=>{
              setUserAddress(addr); 
              setStep("VERIFY_FACE");
            }} />
          </div>
        )}

        {/* --- STEP 2: FACE VERIFICATION --- */}
        {step === "VERIFY_FACE" && (
          <div className="bg-gray-800 p-1 rounded-2xl border border-gray-700 overflow-hidden">
             <FaceVerification onVerified={handleFaceVerified} />
          </div>
        )}

        {/* --- STEP 3: SELECT CANDIDATE --- */}
        {step === "SELECT_CANDIDATE" && (
           <div className="space-y-6">
             <div className="text-center">
               <h2 className="text-2xl font-bold text-white">Pilih Calon Presiden</h2>
               <p className="text-gray-400">Suara Anda bersifat rahasia dan tidak dapat diubah.</p>
             </div>

             <div className="grid gap-4">
               {candidateData.map((c) => (
                 <button 
                   key={c.id} 
                   onClick={() => setSelectedCandidate(c.id)} 
                   className={`relative flex items-center p-4 rounded-xl border-2 transition-all ${
                     selectedCandidate === c.id 
                       ? 'bg-yellow-900/40 border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.3)]' 
                       : 'bg-gray-800 border-gray-700 hover:border-gray-500'
                   }`}
                 >
                   <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mr-4 ${
                      selectedCandidate === c.id ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-gray-300'
                   }`}>
                     {c.id + 1}
                   </div>
                   <div className="text-left">
                     <h3 className="font-bold text-lg text-white">{c.name}</h3>
                     <p className="text-sm text-gray-400">Kandidat No. {c.id + 1}</p>
                   </div>
                   {selectedCandidate === c.id && (
                     <div className="absolute right-4 text-yellow-500 text-2xl">✓</div>
                   )}
                 </button>
               ))}
             </div>

             <button 
               onClick={handleVote} 
               disabled={selectedCandidate === null}
               className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg transition transform active:scale-95"
             >
               🚀 COBLOS SEKARANG
             </button>
           </div>
        )}

        {/* --- STEP 4: DONE --- */}
        {step === "DONE" && (
          <div className="text-center bg-gray-800 p-10 rounded-2xl border border-green-500/50 shadow-2xl">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-green-400 mb-2">Terima Kasih!</h2>
            <p className="text-white text-lg mb-6">Suara Anda telah berhasil direkam di Blockchain.</p>
            
            <div className="bg-black/30 p-4 rounded-lg text-sm text-gray-400 font-mono break-all border border-gray-700">
              Tx Hash: {txHash}
            </div>

            <a 
              href={`https://sepolia.etherscan.io/tx/${txHash}`} 
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-6 text-blue-400 hover:text-blue-300 underline"
            >
              Lihat di Etherscan ↗
            </a>
          </div>
        )}
        
        {/* --- LOADING OVERLAY --- */}
        {(step === "SUBMIT_VERIFICATION" || step === "SUBMIT_VOTE") && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-white z-50">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-500 mb-6"></div>
                <h3 className="text-2xl font-bold animate-pulse">{statusMsg}</h3>
                <p className="text-gray-400 mt-2 text-sm">Jangan tutup halaman ini...</p>
                {txHash && (
                  <p className="mt-4 text-xs font-mono bg-gray-800 px-3 py-1 rounded text-gray-300">
                    Tx: {txHash.slice(0,10)}...
                  </p>
                )}
            </div>
        )}
      </div>
    </main>
  );
}