"use client";

import { useState, useEffect } from "react";
import { createWalletClient, custom, http, createPublicClient } from "viem";
import { sepolia } from "viem/chains";
import WalletButton from "@/components/WalletButton";
import FaceVerification from "@/components/FaceVerification";
import { candidateData } from "@/lib/candidateData";
import { NEXT_PUBLIC_EVOTING_ADDRESS, EVOTING_ABI } from "@/lib/constants";

// 🚀 PERUBAHAN DI SINI: Import langsung dari zk.ts, bukan zkBackend
import { 
  generateHumanityProof, 
  generateVoteProof, 
  checkCircuitsAvailability 
} from "@/lib/zk"; 

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
  const [circuitsReady, setCircuitsReady] = useState(false);

  // ✅ Cek File Sirkuit saat load
  useEffect(() => {
    const init = async () => {
      // Panggil fungsi dari zk.ts
      const isReady = await checkCircuitsAvailability();
      setCircuitsReady(isReady);
      if (isReady) console.log("✅ ZK Circuits siap.");
      else console.warn("⚠️ File circuits tidak ditemukan.");
    };
    init();
  }, []);

  // ✅ VERIFY HUMANITY
  async function handleFaceVerified(zkResult: any) {
    try {
      setStep("SUBMIT_VERIFICATION");
      setStatusMsg("🧠 Menghitung Bukti Kemanusiaan...");

     // if (!circuitsReady) throw new Error("File sirkuit belum siap.");

      // Input dummy/real
      const proofInput = {
        human_score: 85,           
        uniqueness_score: 90,      
        behavior_proof: 75,        
        timestamp: Math.floor(Date.now() / 1000),
        user_identifier: userAddress,
      };

      // Panggil langsung fungsi dari zk.ts
      const proofResult = await generateHumanityProof(proofInput);

      // --- LOGIKA PARSING SAMA SEPERTI SEBELUMNYA ---
      const proof = proofResult.proof;
      const publicSignalsStr = proofResult.publicSignals;

      const a = [BigInt(proof.pi_a[0]), BigInt(proof.pi_a[1])];
      const b = [
        [BigInt(proof.pi_b[0][1]), BigInt(proof.pi_b[0][0])],
        [BigInt(proof.pi_b[1][1]), BigInt(proof.pi_b[1][0])],
      ];
      const c = [BigInt(proof.pi_c[0]), BigInt(proof.pi_c[1])];
      const publicSignals = publicSignalsStr.map((v: string) => BigInt(v));
      console.log("🔍 JUMLAH PUBLIC SIGNALS:", publicSignals.length);
      console.log("🔍 ISI SIGNALS:", publicSignals);

       if (publicSignals.length !== 3) throw new Error("Invalid signals length");

      // Setup Wallet
      setStatusMsg("✍️ Meminta Tanda Tangan...");
      const walletClient = createWalletClient({
        chain: sepolia,
        transport: custom((window as any).ethereum),
      });
      await checkAndSwitchNetwork(walletClient);
      const [address] = await walletClient.getAddresses();

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

      setStatusMsg("⏳ Menunggu konfirmasi...");
      setTxHash(hash);
      const publicClient = createPublicClient({ chain: sepolia, transport: http() });
      await publicClient.waitForTransactionReceipt({ hash });

      setStep("SELECT_CANDIDATE");
      setStatusMsg("");
      
    } catch (error: any) {
      console.error("Error:", error);
      alert("Gagal: " + error.message);
      setStep("VERIFY_FACE");
    }
  }

  // ✅ VOTE CASTING
  async function handleVote() {
    if (selectedCandidate === null) return;
    try {
      setStep("SUBMIT_VOTE");
      setStatusMsg("🗳️ Menghitung Suara...");

      if (!circuitsReady) throw new Error("Circuits not ready");

      // Dummy inputs
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

      // Panggil langsung dari zk.ts
      const proofResult = await generateVoteProof(voteInput);

      // Parsing Logic
      const proof = proofResult.proof;
      const publicSignalsStr = proofResult.publicSignals;
      const a = [BigInt(proof.pi_a[0]), BigInt(proof.pi_a[1])];
      const b = [
        [BigInt(proof.pi_b[0][1]), BigInt(proof.pi_b[0][0])],
        [BigInt(proof.pi_b[1][1]), BigInt(proof.pi_b[1][0])],
      ];
      const c = [BigInt(proof.pi_c[0]), BigInt(proof.pi_c[1])];
      const publicSignals = publicSignalsStr.map((v: string) => BigInt(v));

      setStatusMsg("✍️ Mengirim ke Blockchain...");
      const walletClient = createWalletClient({
        chain: sepolia,
        transport: custom((window as any).ethereum),
      });
      await checkAndSwitchNetwork(walletClient);
      const [address] = await walletClient.getAddresses();
      const nullifierHex = "0x" + BigInt(userAddress).toString(16).padStart(64, "0");

      const hash = await walletClient.writeContract({
        address: NEXT_PUBLIC_EVOTING_ADDRESS as `0x${string}`,
        abi: EVOTING_ABI,
        functionName: "castVote",
        args: [
          BigInt(0),
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

      setStatusMsg("⏳ Menunggu konfirmasi...");
      setTxHash(hash);
      const publicClient = createPublicClient({ chain: sepolia, transport: http() });
      await publicClient.waitForTransactionReceipt({ hash });

      setStep("DONE");

    } catch (error: any) {
      console.error("Voting Error:", error);
      alert("Gagal: " + error.message);
      setStep("SELECT_CANDIDATE");
    }
  }

  // --- RENDER UI (Sama seperti sebelumnya) ---
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* ... KODE UI SAMA PERSIS, TIDAK PERLU DIUBAH ... */}
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
           <h1 className="text-3xl font-extrabold">Bilik Suara (Direct ZK)</h1>
           {/* Tampilkan UI seperti kode sebelumnya */}
        </div>
        
        {/* Render Step UI: CONNECT, VERIFY, SELECT, dsb */}
        {step === "CONNECT" && <WalletButton onConnect={(a)=>{setUserAddress(a); setStep("VERIFY_FACE")}} />}
        {step === "VERIFY_FACE" && <FaceVerification onVerified={handleFaceVerified} />}
        {/* ... Lanjutkan dengan UI Candidate & Done yang sama ... */}
        {step === "SELECT_CANDIDATE" && (
           <div className="p-6 text-center">
             <h2 className="text-xl font-bold mb-4">Pilih Kandidat</h2>
             {candidateData.map(c => (
               <button key={c.id} onClick={() => setSelectedCandidate(c.id)} className={`block w-full p-4 mb-2 border rounded ${selectedCandidate === c.id ? 'bg-indigo-100 border-indigo-500' : ''}`}>
                 {c.name}
               </button>
             ))}
             <button onClick={handleVote} className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded">Coblos</button>
           </div>
        )}
        {step === "DONE" && <div className="text-center text-green-600 font-bold text-xl">Selesai! Tx: {txHash}</div>}
        
        {/* Loading Overlay */}
        {(step === "SUBMIT_VERIFICATION" || step === "SUBMIT_VOTE") && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center text-white z-50">
                <div className="bg-white text-black p-8 rounded-lg">
                    <p className="font-bold">{statusMsg}</p>
                </div>
            </div>
        )}
      </div>
    </main>
  );
}