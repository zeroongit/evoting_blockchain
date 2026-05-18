"use client";

import { useState, useEffect } from "react";
import Image from "next/image"; 
import FaceVerification from "@/components/FaceVerification";
import { candidateData } from "@/lib/candidateData"; 

type VotingStep = "NIK" | "VERIFY_FACE" | "SELECT_CANDIDATE" | "SUBMIT_VOTE" | "DONE";

export default function VotePage() {
  const [step, setStep] = useState<VotingStep>("NIK");
  const [statusMsg, setStatusMsg] = useState("");
  const [txHash, setTxHash] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  
  // Voting states
  const [voterNik, setVoterNik] = useState("");
  const [voterName, setVoterName] = useState("");
  const [csrfToken, setCsrfToken] = useState("");

  // DPT Simulation states
  const [dptList, setDptList] = useState<{name: string, nik: string}[]>([]);
  const [newDptName, setNewDptName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Fetch initial CSRF token
    fetch('/api/v1/csrf-token')
      .then(res => res.json())
      .then(data => setCsrfToken(data.csrfToken))
      .catch(err => console.error("Could not fetch CSRF token", err));
      
    // Fetch initial DPT list
    fetchDPTList();
  }, []);

  const fetchDPTList = async () => {
    try {
      const res = await fetch('/api/v1/dpt');
      const data = await res.json();
      if (data.dpt) setDptList(data.dpt);
    } catch (err) {
      console.error("Gagal mendapatkan list DPT:", err);
    }
  }

  const handleGenerateDPT = async (simulationType: string) => {
    if (!newDptName.trim()) {
      alert("Nama wajib diisi sebelum generate DPT!");
      return;
    }
    
    setIsGenerating(true);
    try {
      const res = await fetch('/api/v1/dpt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({ name: newDptName, simulationType })
      });
      const data = await res.json();
      
      if (res.ok) {
        setNewDptName(""); // reset
        fetchDPTList(); // refresh list
      } else {
        alert("Gagal: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan sistem saat generate DPT");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNikSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (voterNik.length < 16) {
      alert("NIK harus 16 digit");
      return;
    }
    
    // Verifikasi NIK ke backend
    try {
      const res = await fetch('/api/v1/verify-nik', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nik: voterNik })
      });
      const data = await res.json();
      
      if (data.valid) {
        setVoterName(data.name);
        setStep("VERIFY_FACE");
      } else {
        alert("NIK tidak terdaftar dalam DPT. Silakan buat simulasi DPT terlebih dahulu.");
      }
    } catch (err) {
      console.error("Error verifying NIK:", err);
      alert("Gagal memverifikasi NIK ke server.");
    }
  };

  const handleFaceVerified = () => {
    setStep("SELECT_CANDIDATE");
  };

  const handleFaceFailed = () => {
    alert("Verifikasi Wajah / Liveness Gagal. Silakan ulangi.");
    setStep("NIK");
  };

  async function handleVote() {
    if (selectedCandidate === null) return;
    try {
      setStep("SUBMIT_VOTE");
      setStatusMsg("🗳️ Menghitung Proof dan Mengirim Suara...");

      const res = await fetch('/api/v1/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({ nik: voterNik, candidateId: selectedCandidate })
      });
      const data = await res.json();

      if (res.ok) {
        setTxHash(data.txHash || "0xabc123...");
        setStep("DONE");
      } else {
        throw new Error(data.error || "Gagal memberikan suara");
      }
    } catch (error) {
      console.error("Voting Error:", error);
      alert("Gagal Voting: " + (error instanceof Error ? error.message : "Cek Console"));
      setStep("SELECT_CANDIDATE");
    }
  }

  // --- RENDER UI ---
  return (
    <main className="min-h-screen bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto"> 
        
        {/* Header Global */}
        <div className="text-center mb-10">
           <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2">
             Bilik Suara Digital
           </h1>
           <p className="text-gray-400">Pemilu yang Aman, Jujur, dan Terverifikasi ZK-SNARK</p>
        </div>

        {/* ADMIN SIMULATION DPT (HANYA MUNCUL JIKA BELUM LOGIN) */}
        {step === "NIK" && (
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-8 max-w-3xl mx-auto">
            <h3 className="text-xl font-bold text-yellow-400 mb-2 border-b border-gray-700 pb-2">🛠️ Simulasi Generate DPT</h3>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <input 
                type="text" 
                placeholder="Masukkan Nama Pemilih..." 
                className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                value={newDptName}
                onChange={(e) => setNewDptName(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap mb-4">
               <button onClick={() => handleGenerateDPT("valid")} disabled={isGenerating} className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg text-sm font-bold transition">✅ Simulasi Valid</button>
               <button onClick={() => handleGenerateDPT("fail_liveness")} disabled={isGenerating} className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg text-sm font-bold transition">❌ Simulasi Liveness (999)</button>
            </div>

            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 max-h-40 overflow-y-auto">
              <h4 className="text-sm font-bold text-gray-500 mb-2 uppercase">Daftar Pemilih Terdaftar ({dptList.length})</h4>
              {dptList.length === 0 ? (
                <p className="text-xs text-gray-600 italic">Belum ada DPT yang di-generate.</p>
              ) : (
                <ul className="space-y-2">
                  {dptList.map((dpt, idx) => (
                    <li key={idx} className="flex justify-between items-center text-sm border-b border-gray-800 pb-1 cursor-pointer hover:bg-gray-800 p-1 rounded transition" onClick={() => setVoterNik(dpt.nik)}>
                      <span className="font-semibold text-gray-300">{dpt.name}</span>
                      <span className="font-mono text-xs text-blue-400 bg-blue-900/40 px-2 py-0.5 rounded">{dpt.nik}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* --- STEP 1: VALIDASI NIK --- */}
        {step === "NIK" && (
          <div className="flex flex-col items-center justify-center space-y-4 sm:space-y-6 bg-gray-800 p-6 sm:p-12 rounded-2xl border border-gray-700 max-w-lg mx-auto w-full shadow-2xl">
            <div className="text-6xl animate-pulse">📝</div>
            <h2 className="text-3xl font-bold text-center text-white">Login Pemilih</h2>
            <p className="text-gray-400 text-center mb-4">
              Masukkan Nomor Induk Kependudukan (NIK) Anda untuk mengakses bilik suara.
            </p>
            <form onSubmit={handleNikSubmit} className="w-full space-y-6">
              <input 
                type="text" 
                className="w-full rounded-xl border-gray-600 bg-gray-900 text-white shadow-inner focus:border-blue-500 focus:ring-blue-500 text-2xl p-4 border text-center font-mono tracking-widest placeholder-gray-600 outline-none" 
                value={voterNik}
                onChange={(e) => setVoterNik(e.target.value.replace(/\D/g, ''))}
                maxLength={16}
                placeholder="16 DIGIT NIK"
                required
              />
              <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-500 hover:to-blue-700 text-xl transition transform active:scale-95 shadow-lg">
                Masuk Bilik Suara
              </button>
            </form>
          </div>
        )}

        {/* --- STEP 2: FACE VERIFICATION --- */}
        {step === "VERIFY_FACE" && (
          <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 max-w-xl mx-auto shadow-2xl">
             <div className="text-center mb-6">
               <h2 className="text-2xl font-bold text-white mb-2">Selamat datang, {voterName}</h2>
               <p className="text-gray-400">Silakan lakukan verifikasi biometrik sebelum memilih.</p>
             </div>
             <div className="rounded-xl overflow-hidden shadow-inner border border-gray-600">
               <FaceVerification 
                 nik={voterNik}
                 onSuccess={handleFaceVerified} 
                 onFail={handleFaceFailed} 
               />
             </div>
          </div>
        )}

        {/* --- STEP 3: SURAT SUARA DIGITAL (SELECT CANDIDATE) --- */}
        {step === "SELECT_CANDIDATE" && (
           <div className="animate-fade-in duration-700">
             
             {/* KOP SURAT SUARA */}
             <div className="bg-white text-black p-6 mb-8 text-center border-b-8 border-double border-black shadow-lg rounded-t-lg">
               <div className="flex justify-center mb-2">
                   {/* Logo Garuda Dummy */}
                   <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center text-3xl font-bold shadow-md ring-4 ring-yellow-300">🦅</div>
               </div>
               <h2 className="text-3xl font-serif font-black uppercase tracking-widest border-b-2 border-black inline-block pb-1 mb-1">
                 SURAT SUARA
               </h2>
               <p className="text-sm font-bold font-serif uppercase tracking-wider mb-2">
                 PEMILIHAN UMUM PRESIDEN & WAKIL PRESIDEN
               </p>
               <div className="bg-gray-100 py-2 mt-4 rounded-md border border-gray-300">
                 <p className="text-xs font-mono font-bold text-gray-600 uppercase">Status Pemilih: Terverifikasi Biometrik ZK ✅ | {voterName}</p>
               </div>
             </div>

             {/* GRID PASLON */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-gray-200 p-8 rounded-b-lg border-x-2 border-b-2 border-gray-400 shadow-2xl relative">
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
                        src={c.image || "https://picsum.photos/seed/placeholder/300/400"} 
                        alt={c.name}
                        fill
                        className={`object-cover object-top transition-all duration-500 
                            ${selectedCandidate === c.id 
                                ? 'grayscale-0 scale-105' 
                                : 'grayscale transform group-hover:grayscale-0 group-hover:scale-105 opacity-90 group-hover:opacity-100'
                            }`}
                      />
                      
                      {/* EFEK COBLOS (PAKU/LUBANG) */}
                      {selectedCandidate === c.id && (
                        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                           <div className="relative">
                                {/* Efek Lubang */}
                                <div className="w-16 h-16 bg-black/80 rounded-full shadow-[inset_0_0_20px_rgba(0,0,0,1)] border-4 border-white/20 animate-bounce flex items-center justify-center">
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
            
            <div className="bg-black/30 p-4 rounded-xl text-xs text-gray-400 font-mono break-all border border-gray-700 mb-6 text-left">
              <span className="block text-gray-500 mb-1 uppercase font-bold text-[10px]">Bukti Transaksi (Tx Hash):</span>
              {txHash}
            </div>

            <a 
              href={`https://testnet.snowtrace.io/tx/${txHash}`} 
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-bold transition mb-8"
            >
              <span>🔍</span> Cek di Explorer (Avalanche)
            </a>
            
            <button 
                onClick={() => window.location.reload()} 
                className="block w-full mt-4 text-gray-500 hover:text-white text-sm uppercase tracking-widest font-bold"
            >
                Kembali ke Menu Utama
            </button>
          </div>
        )}
        
        {/* --- LOADING OVERLAY --- */}
        {(step === "SUBMIT_VOTE") && (
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center text-white z-50">
                <div className="relative mb-8">
                    <div className="animate-spin rounded-full h-24 w-24 border-t-8 border-b-8 border-yellow-500 border-x-transparent"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-4xl">🗳️</div>
                </div>
                <h3 className="text-3xl font-bold animate-pulse text-yellow-400 mb-2">{statusMsg}</h3>
                <p className="text-gray-400 text-sm font-mono tracking-widest uppercase">Blockchain Consensus in progress...</p>
            </div>
        )}
      </div>
    </main>
  );
}
