"use client";

import { useState, useEffect } from "react";
import Image from "next/image"; 
import { createWalletClient, custom, http, createPublicClient } from "viem";
import { sepolia } from "viem/chains";
import WalletButton from "@/components/WalletButton";
import FaceVerification from "@/components/FaceVerification";
import { candidateData } from "@/lib/candidateData"; 
import { NEXT_PUBLIC_EVOTING_ADDRESS, EVOTING_ABI } from "@/lib/constants";
import { 
  generateHumanityProof, 
  generateVoteProof, 
  checkCircuitsAvailability 
} from "@/lib/zk"; 
import { keccak256, toBytes } from "viem";

type VotingStep = "CONNECT" | "VERIFY_FACE" | "SUBMIT_VERIFICATION" | "SELECT_CANDIDATE" | "SUBMIT_VOTE" | "DONE";

export default function VotePage() {
  const [step, setStep] = useState<VotingStep>("CONNECT");
  const [userAddress, setUserAddress] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [txHash, setTxHash] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [circuitsReady, setCircuitsReady] = useState(false);
  const [voterNik, setVoterNik] = useState("");

  // 1. Cek Ketersediaan Sirkuit ZK
  useEffect(() => {
    const init = async () => {
      const isReady = await checkCircuitsAvailability();
      setCircuitsReady(isReady);
      if (isReady) console.log("✅ ZK Circuits siap.");
      else console.warn("⚠️ File circuits tidak ditemukan di /public/zk/");
    };
    init();
  }, []);

  // Helper: Switch Network
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
      if (zkResult.nik) {
        setVoterNik(zkResult.nik);
      }
      setStep("SUBMIT_VERIFICATION");
      setStatusMsg("🧠 Menghitung Bukti Kemanusiaan (ZK-SNARK)...");

      const proofInput = {
        human_score: 85,           
        uniqueness_score: 90,      
        behavior_proof: 75,        
        timestamp: Math.floor(Date.now() / 1000),
        user_identifier: userAddress,
      };

      const proofResult = await generateHumanityProof(proofInput);
      const proof = proofResult.proof;
      const publicSignalsStr = proofResult.publicSignals;

      const a = [BigInt(proof.pi_a[0]), BigInt(proof.pi_a[1])];
      const b = [
        [BigInt(proof.pi_b[0][1]), BigInt(proof.pi_b[0][0])],
        [BigInt(proof.pi_b[1][1]), BigInt(proof.pi_b[1][0])],
      ];
      const c = [BigInt(proof.pi_c[0]), BigInt(proof.pi_c[1])];
      const publicSignals = publicSignalsStr.map((v: string) => BigInt(v));
      
      console.log("🔍 Signals:", publicSignals);

      setStatusMsg("✍️ Meminta Tanda Tangan di Wallet...");
      const walletClient = createWalletClient({
        chain: sepolia,
        transport: custom((window as any).ethereum),
      });
      await checkAndSwitchNetwork(walletClient);
      const [address] = await walletClient.getAddresses();
      const contractAddress = NEXT_PUBLIC_EVOTING_ADDRESS.EVoting as `0x${string}`;

      const hash = await walletClient.writeContract({
        address: contractAddress, 
        abi: EVOTING_ABI,
        functionName: "verifyHumanity",
        args: [
          a as [bigint, bigint],
          b as [[bigint, bigint], [bigint, bigint]],
          c as [bigint, bigint],
          publicSignals, 
        ],
        account: address,
        gas: BigInt(500000),
      });

      setStatusMsg("⏳ Menunggu konfirmasi Block...");
      setTxHash(hash);
      
      const publicClient = createPublicClient({ chain: sepolia, transport: http() });
      await publicClient.waitForTransactionReceipt({ hash });

      setStep("SELECT_CANDIDATE");
      setStatusMsg("");
      
    } catch (error: any) {
      console.error("Error Verify:", error);
      alert("Gagal Verifikasi: " + (error.message || error));
      setStep("VERIFY_FACE"); 
    }
  }

  // 3. PROSES VOTING (COBLOS)
  async function handleVote() {
    if (selectedCandidate === null) return;
    try {
      setStep("SUBMIT_VOTE");
      setStatusMsg("🗳️ Menghitung Proof Suara Rahasia...");

      const rawNik = voterNik && voterNik.length > 0 ? voterNik : "0";
      const nikHash = keccak256(toBytes(rawNik));
      const voterIdVal = BigInt(nikHash) % BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");
      
      console.log("🔒 Voter ID (from NIK):", voterIdVal.toString());

      if (!circuitsReady) throw new Error("Sirkuit ZK belum siap (cek console).");

      const cleanInput = {
        voter_id: voterIdVal.toString(),
        secret: 222,
        election_id: 0,
        candidate_id: selectedCandidate,
      };

      console.log("📤 Sending CLEAN Input to ZK:", JSON.stringify(cleanInput, null, 2));

      const proofResult = await generateVoteProof(cleanInput);
      const proof = proofResult.proof;
      const publicSignalsStr = proofResult.publicSignals;
      const nullifierFromCircuit = BigInt(publicSignalsStr[0]);
      
      const a = [BigInt(proof.pi_a[0]), BigInt(proof.pi_a[1])];
      const b = [
        [BigInt(proof.pi_b[0][1]), BigInt(proof.pi_b[0][0])],
        [BigInt(proof.pi_b[1][1]), BigInt(proof.pi_b[1][0])],
      ];
      const c = [BigInt(proof.pi_c[0]), BigInt(proof.pi_c[1])];
      const publicSignals = publicSignalsStr.map((v: string) => BigInt(v));

      console.log("✅ Nullifier Generated by Circuit:", nullifierFromCircuit.toString());

      setStatusMsg("✍️ Mengirim Suara ke Blockchain...");
      const walletClient = createWalletClient({
        chain: sepolia,
        transport: custom((window as any).ethereum),
      });
      await checkAndSwitchNetwork(walletClient);
      const [address] = await walletClient.getAddresses();
      const contractAddress = NEXT_PUBLIC_EVOTING_ADDRESS.EVoting as `0x${string}`;

      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: EVOTING_ABI,
        functionName: "castVote",
        args: [
          BigInt(0),                 
          BigInt(selectedCandidate), 
          nullifierFromCircuit,      
          a as [bigint, bigint],
          b as [[bigint, bigint], [bigint, bigint]],
          c as [bigint, bigint],
          publicSignals,          
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
      console.error("Voting Error Full:", error);
      alert("Gagal Voting: " + (error.message || "Cek Console"));
      setStep("SELECT_CANDIDATE");
    }
  }

  // --- RENDER UI ---
  return (
    <main className="min-h-screen bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto"> {/* Container Lebar untuk Surat Suara */}
        
        {/* Header Global */}
        <div className="text-center mb-10">
           <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2">
             Bilik Suara Digital
           </h1>
           <p className="text-gray-400">Pemilu yang Aman, Jujur, dan Terverifikasi ZK-SNARK</p>
        </div>

        {/* --- STEP 1: CONNECT WALLET --- */}
        {step === "CONNECT" && (
          <div className="flex flex-col items-center justify-center space-y-6 bg-gray-800 p-12 rounded-2xl border border-gray-700 max-w-lg mx-auto">
            <div className="text-6xl animate-bounce-slow">🔐</div>
            <h2 className="text-2xl font-bold">Login Pemilih</h2>
            <p className="text-gray-400 text-center">
              Scan QR / Hubungkan Wallet untuk mengakses terminal.
            </p>
            <WalletButton onConnect={(addr)=>{
              setUserAddress(addr); 
              setStep("VERIFY_FACE");
            }} />
          </div>
        )}

        {/* --- STEP 2: FACE VERIFICATION --- */}
        {step === "VERIFY_FACE" && (
          <div className="bg-gray-800 p-1 rounded-2xl border border-gray-700 overflow-hidden max-w-xl mx-auto">
             <FaceVerification 
             userAddress={userAddress}
             onVerified={handleFaceVerified} />
          </div>
        )}

        {/* --- STEP 3: SURAT SUARA DIGITAL (SELECT CANDIDATE) --- */}
        {step === "SELECT_CANDIDATE" && (
           <div className="animate-in fade-in duration-700">
             
             {/* KOP SURAT SUARA */}
             <div className="bg-white text-black p-6 mb-8 text-center border-b-8 border-double border-black shadow-lg rounded-t-lg">
               <div className="flex justify-center mb-2">
                   {/* Logo Garuda Dummy */}
                   <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center text-2xl font-bold shadow-md">🦅</div>
               </div>
               <h2 className="text-3xl font-serif font-black uppercase tracking-widest border-b-2 border-black inline-block pb-1 mb-1">
                 SURAT SUARA
               </h2>
               <p className="text-sm font-bold font-serif uppercase tracking-wider">
                 PEMILIHAN UMUM PRESIDEN & WAKIL PRESIDEN
               </p>
             </div>

             {/* GRID PASLON */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-gray-200 p-8 rounded-b-lg border-x-2 border-b-2 border-gray-400 shadow-2xl relative">
                {/* Background Pattern (Optional) */}
                <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cardboard.png')]"></div>

               {candidateData.map((c) => (
                 <div 
                   key={c.id} 
                   onClick={() => setSelectedCandidate(c.id)} 
                   className={`relative bg-white border-4 cursor-pointer transition-all duration-300 group transform
                     ${selectedCandidate === c.id 
                       ? 'border-red-700 shadow-[0_0_0_8px_rgba(185,28,28,0.2)] scale-[1.02] z-10' 
                       : 'border-black hover:border-gray-600 hover:shadow-xl'
                     }
                   `}
                 >
                   {/* NOMOR URUT */}
                   <div className={`border-b-4 border-black p-3 text-center transition-colors ${selectedCandidate === c.id ? 'bg-red-700 text-white' : 'bg-white text-black'}`}>
                      <span className="text-5xl font-extrabold font-serif">{c.id + 1}</span>
                   </div>

                   {/* FOTO PASLON */}
                   <div className="relative aspect-[3/4] w-full bg-gray-300 overflow-hidden border-b-4 border-black">
                      <Image
                        src={c.image || "/images/placeholder.png"} 
                        alt={c.name}
                        fill
                        className={`object-cover object-top transition-all duration-500 
                            ${selectedCandidate === c.id 
                                ? 'grayscale-0 scale-105' 
                                : 'grayscale group-hover:grayscale-0 group-hover:scale-105 opacity-90 group-hover:opacity-100'
                            }`}
                      />
                      
                      {/* EFEK COBLOS (PAKU/LUBANG) */}
                      {selectedCandidate === c.id && (
                        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                           <div className="relative">
                                {/* Efek Lubang */}
                                <div className="w-16 h-16 bg-black/80 rounded-full shadow-[inset_0_0_20px_rgba(0,0,0,1)] border-4 border-white/20 animate-bounce-slow flex items-center justify-center">
                                    <span className="text-4xl drop-shadow-lg">📌</span>
                                </div>
                                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap">
                                    PILIHAN ANDA
                                </div>
                           </div>
                        </div>
                      )}
                   </div>

                   {/* NAMA PASLON */}
                   <div className="p-4 text-center h-28 flex flex-col justify-center items-center bg-white">
                      <h3 className="font-bold text-xl leading-tight text-black uppercase font-serif mb-1">
                        {c.name}
                      </h3>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                        CALON PRESIDEN RI
                      </p>
                   </div>
                 </div>
               ))}
             </div>

             {/* TOMBOL KONFIRMASI (Floating) */}
             <div className="mt-8 flex justify-center sticky bottom-8 z-30">
                <button 
                  onClick={handleVote} 
                  disabled={selectedCandidate === null}
                  className="bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xl py-4 px-12 rounded-full shadow-[0_10px_30px_rgba(220,38,38,0.5)] transition transform active:scale-95 flex items-center gap-3 border-4 border-white"
                >
                  <span>🚀</span> MASUKKAN KE KOTAK SUARA
                </button>
             </div>
           </div>
        )}

        {/* --- STEP 4: DONE --- */}
        {step === "DONE" && (
          <div className="text-center bg-gray-800 p-12 rounded-2xl border border-green-500/50 shadow-2xl max-w-lg mx-auto mt-10">
            <div className="text-8xl mb-6 animate-bounce">🎉</div>
            <h2 className="text-4xl font-bold text-green-400 mb-2">Suara Sah!</h2>
            <p className="text-white text-lg mb-8">Terima kasih telah berpartisipasi dalam pemilu masa depan.</p>
            
            <div className="bg-black/30 p-4 rounded-xl text-xs text-gray-400 font-mono break-all border border-gray-700 mb-6">
              <span className="block text-gray-500 mb-1">Bukti Transaksi (Tx Hash):</span>
              {txHash}
            </div>

            <a 
              href={`https://sepolia.etherscan.io/tx/${txHash}`} 
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-bold transition"
            >
              <span>🔍</span> Cek di Etherscan
            </a>
            
            <button 
                onClick={() => window.location.reload()} 
                className="block w-full mt-4 text-gray-500 hover:text-white text-sm"
            >
                Kembali ke Menu Utama
            </button>
          </div>
        )}
        
        {/* --- LOADING OVERLAY --- */}
        {(step === "SUBMIT_VERIFICATION" || step === "SUBMIT_VOTE") && (
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center text-white z-50">
                <div className="relative mb-8">
                    <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-yellow-500"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-3xl">🗳️</div>
                </div>
                <h3 className="text-3xl font-bold animate-pulse text-yellow-400 mb-2">{statusMsg}</h3>
                <p className="text-gray-400 text-sm font-mono">Blockchain Consensus in progress...</p>
                {txHash && (
                  <div className="mt-6 bg-gray-800 px-4 py-2 rounded-full border border-gray-600 text-xs font-mono text-green-400">
                    Hash: {txHash.slice(0,10)}...{txHash.slice(-6)}
                  </div>
                )}
            </div>
        )}
      </div>
    </main>
  );
}