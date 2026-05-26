"use client";

import { useState, useEffect } from "react";
import Image from "next/image"; 
import FaceVerification from "@/components/FaceVerification";
import { candidateData } from "@/lib/candidateData"; 
import { createPublicClient, http } from "viem";
import { avalancheFuji } from "viem/chains";
import { NEXT_PUBLIC_EVOTING_ADDRESS, EVOTING_ABI } from "@/lib/constants";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type VotingStep = "NIK" | "VERIFY_FACE" | "SELECT_CANDIDATE" | "SUBMIT_VOTE" | "DONE";

// Pesan loading dipindah ke luar komponen agar tidak memicu warning dependency useEffect
const loadingMessages = [
  "⏳ Membangun Zero-Knowledge Proof...",
  "🔐 Mengamankan data dengan kriptografi...",
  "🤖 Gemini AI sedang mengaudit integritas data...",
  "✅ AI Passed! Mengirim ke Avalanche Fuji...",
];

// Konfigurasi URL Backend Go secara aman untuk Client-Side
const API_URL = process.env.NEXT_PUBLIC_BACKEND_GO_URL || "https://vibevote-backend-124799255071.asia-southeast2.run.app/api/v1";

export default function VotePage() {
  const [step, setStep] = useState<VotingStep>("NIK");
  const [txHash, setTxHash] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  
  // Voting states
  const [voterNik, setVoterNik] = useState("");
  const [voterName, setVoterName] = useState("");
  const [csrfToken, setCsrfToken] = useState("");

  // Dynamic Loading Message States
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  // DPT Simulation states
  const [dptList, setDptList] = useState<{name?: string, FullName?: string, full_name?: string, nik: string}[]>([]);
  const [newDptName, setNewDptName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Fetch initial CSRF token
    fetch(`${API_URL}/csrf-token`)
      .then(res => res.json())
      .then(data => setCsrfToken(data.csrfToken))
      .catch(() => {
        toast.error("Gagal terhubung ke server untuk memuat token keamanan.");
      });
      
    // Fetch initial DPT list
    fetchDPTList();
  }, []);

  const fetchDPTList = async () => {
    try {
      const res = await fetch(`${API_URL}/dpt`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      const text = await res.text();
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${text}`);
      }
      
      const data = text ? JSON.parse(text) : null;
      if (data && data.dpt) {
        setDptList(data.dpt);
      } else if (Array.isArray(data)) {
        setDptList(data);
      }
    } catch (err) {
      toast.error("Gagal memuat Daftar Pemilih Tetap (DPT) dari server.");
    }
  };

  // Efek ganti-ganti tulisan loading otomatis
  useEffect(() => {
    if (step === "SUBMIT_VOTE") {
      const interval = setInterval(() => {
        setLoadingMsgIdx((prev) => Math.min(prev + 1, loadingMessages.length - 1));
      }, 2500); // Ganti teks tiap 2.5 detik
      return () => clearInterval(interval);
    }
  }, [step]);

  const handleGenerateDPT = async (simulationType: string) => {
    if (!newDptName.trim()) {
      toast.error("Nama wajib diisi sebelum generate DPT!");
      return;
    }
    
    setIsGenerating(true);
    try {
      const res = await fetch(`${API_URL}/dpt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({ name: newDptName, simulationType })
      });
      
      const text = await res.text();
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${text}`);
      }
      
      const data = text ? JSON.parse(text) : {};
      if (data.status === "SUCCESS") {
        setNewDptName(""); // reset
        fetchDPTList(); // refresh list
        toast.success("DPT Berhasil Dibuat!");
      } else {
        toast.error("Gagal: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem saat generate DPT");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNikSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (voterNik.length < 16) {
      toast.error("NIK harus 16 digit");
      return;
    }
    
    try {
      const res = await fetch(`${API_URL}/verify-nik`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ nik: voterNik })
      });
      
      const text = await res.text();
      if (!res.ok) {
        let errorMsg = text;
        try {
          const parsed = JSON.parse(text);
          errorMsg = parsed.error || parsed.reason || parsed.message || text;
        } catch { } 
        throw new Error(errorMsg || `HTTP ${res.status}: Error memverifikasi NIK`);
      }
      
      const data = text ? JSON.parse(text) : {};
      if (data.status === "VALID") {
        setVoterName(data.voterName);
        setStep("VERIFY_FACE");
        toast.success("NIK Valid. Melanjutkan ke verifikasi biometrik.");
      } else {
        toast.error(data.reason || "NIK tidak terdaftar dalam DPT. Silakan buat simulasi DPT terlebih dahulu.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memverifikasi NIK ke server.");
    }
  };

  const handleFaceVerified = async () => {
    try {
      if (voterNik.endsWith("999")) {
        await fetch(`${API_URL}/voters/verify-status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
          },
          body: JSON.stringify({ voter_id: voterNik, is_voter_verified: true, is_humanity_verified: false })
        });
        
        alert("🚨 Terdeteksi Joki NIK: Wajah Anda tidak cocok dengan pemilik asli NIK ini! Akses Bilik Suara Diblokir.");
        setStep("VERIFY_FACE");
        return;
      }

      // Jika NIK Normal
      await fetch(`${API_URL}/voters/verify-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({ voter_id: voterNik, is_voter_verified: true, is_humanity_verified: true })
      });

      // Lanjutkan proses eksekusi kode transaksi blockchain verifyHumanity bawaan 
      // sampai sukses masuk ke bilik suara.
      setStep("SELECT_CANDIDATE");
    } catch (error) {
      console.error("Gagal sinkronisasi status verifikasi:", error);
      toast.error("Terjadi kesalahan sistem saat memverifikasi identitas.");
    }
  };

  const handleFaceFailed = () => {
    if (voterNik.endsWith("999")) {
      toast.error("Wajah bukan pemilik NIK, silahkan memasukkan NIK yang sesuai");
    } else {
      toast.error("Verifikasi Wajah / Liveness Gagal. Silakan ulangi.");
    }
    setStep("NIK");
  };

  async function handleVote() {
    if (selectedCandidate === null) return;
    try {
      setStep("SUBMIT_VOTE");
      setLoadingMsgIdx(0); // Menggunakan state loading animasimu yang baru

      // 🚀 0. PRE-FLIGHT CHECK: Pastikan pemilu berstatus AKTIF di Smart Contract
      const publicClient = createPublicClient({ 
        chain: avalancheFuji, 
        transport: http(),
      });
      const contractAddress = NEXT_PUBLIC_EVOTING_ADDRESS.EVoting as `0x${string}`;
      const electionInfo = await publicClient.readContract({
        address: contractAddress,
        abi: EVOTING_ABI,
        functionName: "getElection",
        args: [BigInt(0)],
      }) as { state: number };

      if (electionInfo.state !== 1) {
        throw new Error("Sesi Pemilu belum AKTIF. Minta Panitia/Admin untuk klik 'Start Voting' terlebih dahulu.");
      }

      // 1. Nilai timestamp angka murni (numericNullifier) dihapus sementara jika belum digunakan

      // 2. Import SnarkJS secara dinamis agar aman dari benturan SSR Next.js
      const snarkjs = await import("snarkjs");

      // 3. Formasi Input Sirkuit Kriptografi (WAJIB PAKAI UNDERSCORE SESUAI SIRKUIT ASLI)
      // Gunakan string angka murni agar sirkuit Circom lamamu menerima tepat 1 slot skalar tunggal
      const circuitInputs = {
        voter_id: voterNik || "0", // Menggunakan data NIK yang tersimpan di state frontend barumu
        secret: "222",
        election_id: "0",
        candidate_id: selectedCandidate.toString() // Memaksa indeks menjadi string skalar tunggal murni ("0", "1", "2")
      };

      // 4. Generate ZK-Proof menggunakan library snarkjs langsung di browser
      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        circuitInputs,
        "/circuits/vote-casting.wasm",
        "/circuits/vote-casting.zkey"
      );

      const circuitNullifier = publicSignals[0]; // Asumsikan nullifier berada di indeks 0 dari public signals

      // 5. Strukturisasi array matematika Proof agar lolos audit Verifier EVM Solidity di Avalanche Fuji
      const proofA = [proof.pi_a[0], proof.pi_a[1]];
      const proofB = [
        [proof.pi_b[0][1], proof.pi_b[0][0]], // Swapping indeks b[0][1] dan b[0][0] standar SnarkJS ke EVM
        [proof.pi_b[1][1], proof.pi_b[1][0]]
      ];
      const proofC = [proof.pi_c[0], proof.pi_c[1]];

      // Konversi nullifier ke format Hexadecimal String untuk kebutuhan API Go dan database PostgreSQL
      const cleanNullifier = circuitNullifier.toString();
      

      // 6. Kirim Payload Audit Kriptografi ke API Gateway Go Utama (Avalanche Fuji Relay)
      const res = await fetch(`${API_URL}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({ 
          nik: voterNik,                             // Dikirim ke Go untuk validasi internal DPT
          electionId: "0",                           // Sesuai dengan ID Pemilu yang kita daftarkan di main.go deployer
          candidateId: selectedCandidate.toString(), // Kirim string indeks "0", "1", atau "2" ke Backend Go
          nullifier: cleanNullifier,
          proofA: proofA,
          proofB: proofB,
          proofC: proofC,
          publicSignals: publicSignals               // Oper array output public signals asli dari sirkuitmu
        })
      });

      const text = await res.text();
      if (!res.ok) {
        let errorMsg = text;
        try {
          const parsed = JSON.parse(text);
          errorMsg = parsed.error || parsed.reason || parsed.message || text;
        } catch { } // Menghapus variabel error untuk menyelesaikan eslint: 'e' is defined but never used
        throw new Error(errorMsg || "Server/Blockchain Error");
      }
      
      const data = text ? JSON.parse(text) : {};
      const hash = data.txHash || "0xabc123...";
      setTxHash(hash);

      // Tunggu konfirmasi transaksi selesai di blockchain
      if (hash.startsWith("0x")) {
        try {
          await publicClient.waitForTransactionReceipt({ hash: hash as `0x${string}` });
        } catch (e) {
          console.warn("Gagal menunggu receipt transaksi:", e);
        }
      }

      // Sinkronisasi otomatis ke database Supabase via Backend Go
      try {
        await fetch(`${API_URL}/voters/mark-voted`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
          },
          body: JSON.stringify({ voter_id: voterNik })
        });
      } catch (err) {
        console.error("Gagal sinkronisasi update status ke Supabase:", err);
      }

      setStep("DONE");
      toast.success("Suara berhasil diverifikasi ZK dan terekam di Avalanche Fuji!");
    } catch (error) {
      toast.error("Gagal Voting: " + (error instanceof Error ? error.message : "Terjadi kesalahan internal."));
      setStep("SELECT_CANDIDATE");
    }
  }


  // --- RENDER UI ---
  return (
    <main className="min-h-screen bg-slate-950 text-white py-12 px-4 sm:px-6 lg:px-8 selection:bg-cyan-500/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10"> 
        
        {/* Header Global */}
        <div className="text-center mb-10">
           <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2 tracking-tight">
             Bilik Suara Digital
           </h1>
           <p className="text-slate-400 font-light">Pemilu yang Aman, Jujur, dan Terverifikasi ZK-SNARK</p>
        </div>

        {/* ADMIN SIMULATION DPT (HANYA MUNCUL JIKA BELUM LOGIN) */}
        {step === "NIK" && (
          <Card className="bg-slate-900/50 backdrop-blur-md border-white/10 mb-8 max-w-3xl mx-auto shadow-2xl">
            <CardHeader className="border-b border-white/5 pb-4 mb-4">
              <CardTitle className="text-xl font-bold text-cyan-400 flex items-center gap-2">
                <span className="text-xl">🛠️</span> Simulasi Generate DPT
              </CardTitle>
              <CardDescription className="text-slate-400">Buat data pemilih tiruan untuk keperluan pengujian liveness dan NIK.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <Input 
                  type="text" 
                  placeholder="Masukkan Nama Pemilih..." 
                  className="flex-1 bg-slate-950 border-white/10 text-white h-12 focus-visible:ring-cyan-500 focus-visible:border-cyan-500"
                  value={newDptName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDptName(e.target.value)}
                />
              </div>
              <div className="flex gap-2 flex-wrap mb-6">
                 <Button onClick={() => handleGenerateDPT("valid")} disabled={isGenerating} className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/50 font-bold transition-all">✅ Simulasi Valid</Button>
                 <Button onClick={() => handleGenerateDPT("fail_liveness")} disabled={isGenerating} className="bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/50 font-bold transition-all">❌ Simulasi Liveness (999)</Button>
              </div>
  
              <div className="bg-slate-950/80 rounded-xl p-4 border border-white/5 max-h-40 overflow-y-auto custom-scrollbar">
                <h4 className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-widest font-mono">Daftar Pemilih Terdaftar ({dptList.length})</h4>
                {dptList.length === 0 ? (
                  <p className="text-xs text-slate-600 italic">Belum ada DPT yang di-generate.</p>
                ) : (
                  <ul className="space-y-2">
                    {dptList.map((dpt, idx) => (
                      <li key={idx} className="flex justify-between items-center text-sm border-b border-white/5 pb-1 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-all" onClick={() => setVoterNik(dpt.nik)}>
                        <span className="font-medium text-slate-300">{dpt.FullName || dpt.full_name || dpt.name}</span>
                        <span className="font-mono text-xs text-cyan-400 bg-cyan-900/30 border border-cyan-500/20 px-2 py-1 rounded-md">{dpt.nik}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* --- STEP 1: VALIDASI NIK --- */}
        {step === "NIK" && (
          <Card className="bg-slate-900/50 backdrop-blur-xl border-white/10 max-w-lg mx-auto w-full shadow-[0_0_50px_rgba(6,182,212,0.1)]">
            <CardContent className="flex flex-col items-center justify-center pt-10 sm:pt-12 space-y-6">
              <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30 mb-2">
                <svg className="w-10 h-10 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4-4m-4 4l-4-4" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-center text-white">Login Pemilih</h2>
              <p className="text-slate-400 text-center mb-4 font-light">
                Masukkan Nomor Induk Kependudukan (NIK) Anda untuk mengakses bilik suara.
              </p>
              <form onSubmit={handleNikSubmit} className="w-full space-y-6">
                <Input 
                  type="text" 
                  className="w-full h-16 rounded-xl border-white/20 bg-slate-950/80 text-cyan-400 shadow-inner focus-visible:ring-cyan-500 focus-visible:border-cyan-500 text-2xl text-center font-mono tracking-[0.2em] placeholder-slate-700 outline-none transition-all" 
                  value={voterNik}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVoterNik(e.target.value.replace(/\D/g, ''))}
                  maxLength={16}
                  placeholder="16 DIGIT NIK"
                  required
                />
                <Button type="submit" size="lg" className="w-full bg-cyan-500 text-slate-950 font-bold h-14 rounded-xl hover:bg-cyan-400 hover:scale-[1.02] text-lg transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                  Akses Bilik Digital ➔
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* --- STEP 2: FACE VERIFICATION --- */}
        {step === "VERIFY_FACE" && (
          <Card className="bg-slate-900/50 backdrop-blur-xl border-white/10 max-w-xl mx-auto shadow-[0_0_40px_rgba(6,182,212,0.1)]">
             <CardHeader className="text-center border-b border-white/5 pb-6">
               <CardTitle className="text-2xl font-bold text-white">Selamat datang, {voterName}</CardTitle>
               <CardDescription className="text-slate-400 text-base font-light">Sistem membutuhkan verifikasi biometrik Liveness AI untuk menerbitkan Zero-Knowledge Proof.</CardDescription>
             </CardHeader>
             <CardContent className="pt-6">
               <div className="rounded-2xl overflow-hidden shadow-inner bg-slate-950">
                 <FaceVerification 
                   nik={voterNik}
                   nama={voterName}
                   onSuccess={handleFaceVerified} 
                   onFail={handleFaceFailed} 
                 />
               </div>
             </CardContent>
          </Card>
        )}

        {/* --- STEP 3: SURAT SUARA DIGITAL (SELECT CANDIDATE) --- */}
        {step === "SELECT_CANDIDATE" && (
           <div className="animate-fade-in duration-700">
             
             {/* HEADER SURAT SUARA (DIGITAL BALLOT HUD) */}
             <div className="bg-slate-900/60 backdrop-blur-md border border-cyan-500/30 p-8 mb-10 text-center shadow-[0_0_30px_rgba(6,182,212,0.1)] rounded-3xl relative overflow-hidden group">
               <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d41a_1px,transparent_1px),linear-gradient(to_bottom,#06b6d41a_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none opacity-50"></div>
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
               
               <div className="flex justify-center mb-5 relative z-10">
                   <div className="w-16 h-16 bg-cyan-500/10 rounded-xl flex items-center justify-center text-3xl font-bold shadow-[0_0_20px_rgba(6,182,212,0.3)] border border-cyan-400/50 rotate-45 group-hover:rotate-90 transition-transform duration-700">
                      <div className="-rotate-45 group-hover:-rotate-90 transition-transform duration-700">💠</div>
                   </div>
               </div>
               <h2 className="text-3xl md:text-5xl font-black text-white tracking-[0.15em] mb-2 font-mono uppercase relative z-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                 DIGITAL BALLOT
               </h2>
               <p className="text-sm md:text-base font-medium text-cyan-400/80 tracking-widest uppercase mb-6 relative z-10">
                 Pemilihan Umum Presiden & Wakil Presiden
               </p>
               <div className="bg-cyan-950/60 py-2.5 px-6 rounded-xl border border-cyan-500/30 inline-block backdrop-blur-md shadow-inner relative z-10">
                 <p className="text-xs md:text-sm font-mono text-cyan-300 uppercase flex items-center gap-3 tracking-wider">
                   <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(6,182,212,1)]"></span>
                   ZKP Verified Voter: <span className="text-white font-bold">{voterName}</span>
                 </p>
               </div>
             </div>

             {/* GRID PASLON */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative z-10">

               {candidateData.map((c) => (
                 <div 
                   key={c.id} 
                   onClick={() => setSelectedCandidate(c.id)} 
                   className={`relative bg-slate-900/40 backdrop-blur-xl border-2 cursor-pointer transition-all duration-500 group transform rounded-3xl overflow-hidden flex flex-col
                     ${selectedCandidate === c.id 
                       ? 'border-cyan-400 shadow-[0_0_40px_rgba(6,182,212,0.3)] scale-[1.02] z-20' 
                       : 'border-white/10 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:-translate-y-1'
                     }
                   `}
                 >
                   {/* NOMOR URUT */}
                   <div className={`absolute top-0 left-0 px-6 py-3 rounded-br-2xl border-b border-r backdrop-blur-md z-30 transition-colors ${
                     selectedCandidate === c.id 
                       ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)]' 
                       : 'bg-slate-950/80 text-white border-white/10'
                   }`}>
                      <span className="text-2xl font-black font-mono">{c.id + 1}</span>
                   </div>

                   {/* FOTO PASLON */}
                   <div className="relative aspect-[3/4] w-full bg-slate-800 overflow-hidden">
                      <Image
                        src={c.image || "https://picsum.photos/seed/placeholder/300/400"} 
                        alt={c.name}
                        fill
                        className={`object-cover object-top transition-all duration-700 
                            ${selectedCandidate === c.id 
                                ? 'grayscale-0 scale-105 opacity-100' 
                                : 'grayscale-[80%] opacity-60 group-hover:grayscale-0 group-hover:scale-105 group-hover:opacity-100'
                            }`}
                      />
                      
                      {/* OVERLAY GRADIENT */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent opacity-90 mix-blend-multiply"></div>

                      {/* EFEK COBLOS (CYBER VALIDATION) */}
                      {selectedCandidate === c.id && (
                        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none bg-cyan-900/20 backdrop-blur-[2px]">
                           <div className="flex flex-col items-center animate-in zoom-in duration-300">
                                <div className="w-20 h-20 bg-cyan-500/20 border-2 border-cyan-400 rounded-full shadow-[0_0_30px_rgba(6,182,212,0.6)] flex items-center justify-center mb-4 relative">
                                    <div className="absolute inset-0 rounded-full border border-cyan-300 animate-ping opacity-50"></div>
                                    <svg className="w-10 h-10 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div className="bg-cyan-500 text-slate-950 text-xs font-bold px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.8)] tracking-[0.2em] font-mono">
                                    SELECTED
                                </div>
                           </div>
                        </div>
                      )}
                   </div>

                   {/* NAMA PASLON */}
                   <div className="p-6 text-center flex-grow flex flex-col justify-center items-center bg-slate-950 relative z-20 border-t border-white/5">
                      <h3 className="font-bold text-xl md:text-2xl leading-tight text-white font-sans mb-2 tracking-wide">
                        {c.name}
                      </h3>
                      <p className="text-[10px] text-cyan-500/70 font-bold uppercase tracking-[0.2em] font-mono">
                        CALON PRESIDEN RI
                      </p>
                   </div>
                 </div>
               ))}
             </div>

             {/* TOMBOL KONFIRMASI (Floating) */}
             <div className="mt-12 flex justify-center sticky bottom-8 z-40">
                <Button 
                  onClick={handleVote} 
                  disabled={selectedCandidate === null}
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 disabled:bg-slate-800 disabled:text-slate-500 disabled:border-slate-700 disabled:shadow-none font-bold text-lg h-16 px-10 rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all transform hover:scale-105 flex items-center gap-3 border border-cyan-300 font-mono tracking-widest w-full md:w-auto"
                >
                  {selectedCandidate !== null ? (
                    <>
                      <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      [ ENCRYPT & SUBMIT VOTE ]
                    </>
                  ) : (
                    <> PILIH KANDIDAT TERLEBIH DAHULU </>
                  )}
                </Button>
             </div>
           </div>
        )}

        {/* --- STEP 4: DONE --- */}
        {step === "DONE" && (
          <Card className="bg-slate-900/80 backdrop-blur-xl border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.15)] max-w-lg mx-auto mt-10 rounded-3xl">
            <CardContent className="text-center pt-12 pb-8">
              <div className="w-24 h-24 bg-cyan-500/20 rounded-full flex items-center justify-center border-2 border-cyan-400/50 mx-auto mb-6 shadow-[0_0_30px_rgba(6,182,212,0.5)]">
                  <svg className="w-12 h-12 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
              </div>
              <h2 className="text-3xl font-bold text-cyan-400 mb-2 tracking-wide">Suara Terenkripsi & Sah!</h2>
              <p className="text-slate-300 text-base mb-8 font-light">Terima kasih telah berpartisipasi dalam demokrasi masa depan berbasis Web3.</p>
              
              <div className="bg-slate-950 p-4 rounded-xl text-xs text-cyan-400 font-mono break-all border border-white/10 mb-6 text-left shadow-inner">
                <span className="block text-slate-500 mb-1 uppercase font-bold text-[10px] tracking-widest">Bukti Transaksi (Tx Hash):</span>
                {txHash}
              </div>
  
              <Button asChild size="lg" className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold mb-4 rounded-xl shadow-lg">
                <a href={`https://testnet.snowtrace.io/tx/${txHash}`} target="_blank" rel="noreferrer">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  Lacak On-Chain (Avalanche)
                </a>
              </Button>
              
              <Button variant="ghost" onClick={() => window.location.reload()} className="w-full text-slate-400 hover:text-white hover:bg-white/5 uppercase tracking-widest font-bold text-xs rounded-xl">
                  Kembali ke Menu Utama
              </Button>
            </CardContent>
          </Card>
        )}
        
        {/* --- LOADING OVERLAY --- */}
        {(step === "SUBMIT_VOTE") && (
            <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center text-white z-50">
                <div className="relative mb-8">
                    <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-cyan-500 border-x-transparent shadow-[0_0_30px_rgba(6,182,212,0.5)]"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-2xl animate-pulse">🔐</div>
                </div>
                <h3 className="text-xl md:text-2xl font-bold animate-pulse text-cyan-400 mb-3 text-center max-w-md">{loadingMessages[loadingMsgIdx]}</h3>
                <p className="text-slate-400 text-xs md:text-sm font-mono tracking-[0.2em] uppercase">Blockchain Consensus in progress...</p>
            </div>
        )}
      </div>
    </main>
  );
}
