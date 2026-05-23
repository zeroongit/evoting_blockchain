"use client";

import { useState, useEffect } from "react";
import { createPublicClient, http } from "viem";
import { avalancheFuji } from "viem/chains";
import Image from "next/image"; 
import { NEXT_PUBLIC_EVOTING_ADDRESS, EVOTING_ABI } from "@/lib/constants";
import { candidateData as staticCandidateData } from "@/lib/candidateData"; 
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Update Tipe Data untuk menyertakan Avatar
type CandidateResult = {
  id: number;
  name: string;
  voteCount: number;
  percentage: number;
  color: string;
  avatar: string; // Tambahan field avatar
};

// 1. OPTIMASI: Setup Client di luar komponen agar tidak di-recreate setiap 10 detik
const publicClient = createPublicClient({ 
  chain: avalancheFuji, 
  transport: http(),
  batch: { multicall: true }, // 2. OPTIMASI: Aktifkan multicall agar request otomatis di-batch (1x RPC call)
});

export default function ResultsPage() {
  const [results, setResults] = useState<CandidateResult[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [electionState, setElectionState] = useState<string>("Unknown");

  const fetchResults = async () => {
    try {
      const contractAddress = NEXT_PUBLIC_EVOTING_ADDRESS.EVoting as `0x${string}`;
      console.log("Fetching results from:", contractAddress);

      // 1. Ambil Info Pemilu
      const electionInfo = await publicClient.readContract({
        address: contractAddress,
        abi: EVOTING_ABI,
        functionName: "getElection",
        args: [BigInt(0)],
        blockTag: 'latest',
      }) as { state: number, candidateCount: bigint };

      const states = ["Pending", "Active", "Ended", "Finalized"];
      setElectionState(states[electionInfo.state] || "Unknown");

      const candidateCount = Number(electionInfo.candidateCount);
      // Batasi loop maksimal sejumlah kandidat yang terdaftar di frontend (candidateData.ts)
      // Hal ini mencegah munculnya kandidat dummy jika di smart contract tercatat lebih dari 3
      const loopCount = candidateCount > 0 ? Math.min(candidateCount, staticCandidateData.length) : staticCandidateData.length;

      let tempTotal = 0;
      const tempResults: CandidateResult[] = [];

      // 2. Loop Data Kandidat
      for (let i = 0; i < loopCount; i++) {
        let votes = 0;
        try {
          const votesBigInt = await publicClient.readContract({
            address: contractAddress,
            abi: EVOTING_ABI,
            functionName: "getCandidateVotes",
            args: [BigInt(0), BigInt(i)],
            blockTag: 'latest', 
          }) as bigint;
          votes = Number(votesBigInt);
        } catch (err) {
          console.error(`Gagal mengambil data suara untuk kandidat ${i}:`, err);
          console.warn(`Data suara untuk kandidat ${i} belum ada di blockchain. Default ke 0.`);
        }

        tempTotal += votes;

        // Ambil data statis (Foto & Nama)
        const staticData = staticCandidateData[i] || { 
          name: `Kandidat #${i+1}`, 
          color: "bg-gray-500",
          image: "https://picsum.photos/seed/placeholder/300/400"
        };

        tempResults.push({
          id: i,
          name: staticData.name,
          voteCount: votes,
          percentage: 0,
          color: staticData.color || "bg-blue-500",
          avatar: staticData.image,
        });
      }

      // 3. Hitung Persentase & Sort (Juara 1 tetap di urutan ID untuk layout surat suara, atau mau di sort?)
      // UNTUK TAMPILAN SURAT SUARA: Lebih baik urut sesuai Nomor Urut (Ascending ID), bukan vote terbanyak.
      const finalResults = tempResults.map(r => ({
        ...r,
        percentage: tempTotal > 0 ? (r.voteCount / tempTotal) * 100 : 0
      }));

      // Sort by ID (0, 1, 2) agar urut seperti kertas suara
      finalResults.sort((a, b) => a.id - b.id);

      setResults(finalResults);
      setTotalVotes(tempTotal);
      setLastUpdated(new Date().toLocaleTimeString());

    } catch (error) {
      console.error("Gagal mengambil hasil:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
    const interval = setInterval(fetchResults, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white py-12 px-4 sm:px-6 lg:px-8 selection:bg-cyan-500/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 border-b border-white/10 pb-8 gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-tight">
              Hasil Hitung Suara
            </h1>
            <p className="text-slate-400 mt-2 font-light">Real Count Terverifikasi Avalanche Fuji Testnet</p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <Card className="bg-slate-900/50 backdrop-blur-xl border-white/10 shadow-[0_0_30px_rgba(6,182,212,0.1)] rounded-2xl">
              <CardContent className="px-6 py-3 flex items-center gap-6 p-0">
                <div className="py-3 pl-6">
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono mb-1">Total Suara Masuk</p>
                  <p className="text-3xl font-black text-white leading-none font-mono">{totalVotes}</p>
                </div>
                <div className="h-10 w-[1px] bg-white/10"></div>
                <div className="py-3 pr-6">
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${electionState === 'Active' ? 'bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(6,182,212,1)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]'}`}></span>
                    <p className="font-bold text-white uppercase tracking-wider text-sm">{electionState}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <p className="text-xs text-slate-500 font-mono tracking-widest mt-1">Last Update: {lastUpdated}</p>
          </div>
        </div>

        {/* LOADING STATE */}
        {loading && results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative mb-6">
               <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-500 border-x-transparent shadow-[0_0_30px_rgba(6,182,212,0.5)]"></div>
               <div className="absolute inset-0 flex items-center justify-center animate-pulse text-xl">💠</div>
            </div>
            <p className="text-cyan-400 animate-pulse font-mono tracking-widest text-sm uppercase">Sinkronisasi On-Chain...</p>
          </div>
        ) : (
          /* GRID SURAT SUARA */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {results.map((candidate) => (
              <Card 
                key={candidate.id} 
                className="relative bg-slate-900/40 backdrop-blur-xl border-white/10 overflow-hidden shadow-2xl transform transition-all hover:scale-[1.02] hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] duration-500 flex flex-col rounded-3xl group"
              >
                {/* NOMOR URUT (Badge Pojok) */}
                <div className="absolute top-0 left-0 bg-cyan-500/90 backdrop-blur-md text-slate-950 font-black font-mono text-2xl px-5 py-3 rounded-br-2xl z-20 shadow-[0_0_15px_rgba(6,182,212,0.5)] border-b border-r border-cyan-400">
                  {candidate.id + 1}
                </div>

                {/* WINNER CROWN (Jika persentase tertinggi & suara > 0) */}
                {totalVotes > 0 && candidate.voteCount === Math.max(...results.map(r => r.voteCount)) && (
                   <div className="absolute top-4 right-4 bg-cyan-900/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-cyan-400 text-[10px] font-bold text-cyan-300 flex items-center gap-2 z-20 shadow-[0_0_20px_rgba(6,182,212,0.6)] tracking-widest font-mono uppercase">
                     <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping"></span>
                     Leading
                   </div>
                )}

                {/* FOTO KANDIDAT */}
                <div className="relative w-full aspect-[4/5] bg-slate-800 border-b border-white/5 overflow-hidden">
                  <Image 
                    src={candidate.avatar} 
                    alt={candidate.name}
                    fill
                    className="object-cover object-top filter grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    referrerPolicy="no-referrer"
                  />
                  {/* Overlay Gradient bawah */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent mix-blend-multiply opacity-90"></div>
                </div>

                {/* INFO KANDIDAT */}
                <div className="p-6 flex-grow flex flex-col justify-end -mt-16 relative z-10">
                  <h2 className="text-2xl font-bold text-white text-center drop-shadow-md mb-1 leading-tight tracking-wide">
                    {candidate.name}
                  </h2>
                </div>

                {/* STATISTIK SUARA (Footer) */}
                <div className="bg-slate-950/80 p-6 border-t border-white/5 mt-auto relative z-10 backdrop-blur-md">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <span className="text-[10px] font-mono tracking-widest uppercase text-slate-500 mb-1 block">Perolehan Suara</span>
                      <p className="text-3xl font-black text-white font-mono">{candidate.voteCount}</p>
                    </div>
                    <span className={`text-2xl font-black font-mono ${getPercentageColor(candidate.id)}`}>
                      {candidate.percentage.toFixed(1)}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden shadow-inner border border-white/5">
                    <div 
                      className={`h-full ${getBarColor(candidate.id)} transition-all duration-1000 ease-out`}
                      style={{ width: `${candidate.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* FOOTER */}
        <div className="mt-16 text-center border-t border-white/10 pt-8 pb-4">
          <p className="text-slate-500 text-sm font-light">
            Data ini bersifat transparan dan tidak dapat dimanipulasi (Immutable).
          </p>
          <div className="flex justify-center items-center gap-2 mt-3 text-xs text-cyan-500/70 font-mono tracking-widest bg-cyan-950/30 w-fit mx-auto px-4 py-2 rounded-full border border-cyan-500/20">
             <span>Contract: {NEXT_PUBLIC_EVOTING_ADDRESS.EVoting}</span>
             <Button asChild variant="link" className="text-cyan-400 hover:text-cyan-300 h-auto p-0 text-xs font-bold ml-2">
               <a href={`https://testnet.snowtrace.io/address/${NEXT_PUBLIC_EVOTING_ADDRESS.EVoting}`} target="_blank" rel="noreferrer">
                 [ View on Snowtrace ]
               </a>
             </Button>
          </div>
        </div>

      </div>
    </main>
  );
}

// Helper Warna Bar
function getBarColor(id: number) {
  switch (id) {
    case 0: return "bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.6)]";
    case 1: return "bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.6)]";
    case 2: return "bg-violet-400 shadow-[0_0_15px_rgba(167,139,250,0.6)]";
    default: return "bg-slate-500";
  }
}

function getPercentageColor(id: number) {
  switch (id) {
    case 0: return "text-emerald-400";
    case 1: return "text-cyan-400";
    case 2: return "text-violet-400";
    default: return "text-slate-400";
  }
}
