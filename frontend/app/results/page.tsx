"use client";

import { useState, useEffect } from "react";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import Image from "next/image"; // Import Image untuk foto
import { NEXT_PUBLIC_EVOTING_ADDRESS, EVOTING_ABI } from "@/lib/constants";
import { candidateData as staticCandidateData } from "@/lib/candidateData"; 

// Update Tipe Data untuk menyertakan Avatar
type CandidateResult = {
  id: number;
  name: string;
  voteCount: number;
  percentage: number;
  color: string;
  avatar: string; // Tambahan field avatar
};

export default function ResultsPage() {
  const [results, setResults] = useState<CandidateResult[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [electionState, setElectionState] = useState<string>("Unknown");

  const fetchResults = async () => {
    try {
      // Setup Client (Bypass Cache agar data akurat)
      const publicClient = createPublicClient({ 
        chain: sepolia, 
        transport: http(),
        batch: { multicall: false },
      });

      const contractAddress = NEXT_PUBLIC_EVOTING_ADDRESS.EVoting as `0x${string}`;
      console.log("Fetching results from:", contractAddress);

      // 1. Ambil Info Pemilu
      const electionInfo: any = await publicClient.readContract({
        address: contractAddress,
        abi: EVOTING_ABI,
        functionName: "getElection",
        args: [BigInt(0)],
        blockTag: 'latest',
      });

      const states = ["Pending", "Active", "Ended", "Finalized"];
      setElectionState(states[electionInfo.state] || "Unknown");

      const candidateCount = Number(electionInfo.candidateCount);
      let tempTotal = 0;
      let tempResults: CandidateResult[] = [];

      // 2. Loop Data Kandidat
      for (let i = 0; i < candidateCount; i++) {
        const votesBigInt = await publicClient.readContract({
          address: contractAddress,
          abi: EVOTING_ABI,
          functionName: "getCandidateVotes",
          args: [BigInt(0), BigInt(i)],
          blockTag: 'latest', 
        }) as bigint;

        const votes = Number(votesBigInt);
        tempTotal += votes;

        // Ambil data statis (Foto & Nama)
        const staticData = staticCandidateData[i] || { 
          name: `Kandidat #${i+1}`, 
          color: "bg-gray-500",
          avatar: "/images/placeholder.png" // Fallback image jika tidak ada
        };

        tempResults.push({
          id: i,
          name: staticData.name,
          voteCount: votes,
          percentage: 0,
          color: staticData.color || "bg-blue-500",
          avatar: staticData.image || "/images/placeholder.png",
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
    <main className="min-h-screen bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 border-b border-gray-700 pb-8 gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              Hasil Hitung Suara 📊
            </h1>
            <p className="text-gray-400 mt-2">Real Count Terverifikasi Blockchain Sepolia</p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="bg-gray-800 px-6 py-3 rounded-xl border border-gray-700 flex items-center gap-4">
              <div>
                <p className="text-xs text-gray-400 uppercase">Total Suara Masuk</p>
                <p className="text-3xl font-bold text-white leading-none">{totalVotes}</p>
              </div>
              <div className="h-8 w-[1px] bg-gray-600"></div>
              <div>
                <p className="text-xs text-gray-400 uppercase">Status</p>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${electionState === 'Active' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                  <p className="font-bold text-white uppercase">{electionState}</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 font-mono">Last Update: {lastUpdated}</p>
          </div>
        </div>

        {/* LOADING STATE */}
        {loading && results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-500 mb-4"></div>
            <p className="text-gray-400 animate-pulse">Mengambil data dari Smart Contract...</p>
          </div>
        ) : (
          /* GRID SURAT SUARA */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {results.map((candidate) => (
              <div 
                key={candidate.id} 
                className="relative bg-black text-gray-900 rounded-2xl overflow-hidden shadow-2xl transform transition hover:scale-[1.02] duration-300 flex flex-col"
              >
                {/* NOMOR URUT (Badge Pojok) */}
                <div className="absolute top-0 left-0 bg-yellow-500 text-black font-extrabold text-3xl px-6 py-4 rounded-br-3xl z-10 shadow-lg">
                  {candidate.id + 1}
                </div>

                {/* WINNER CROWN (Jika persentase tertinggi & suara > 0) */}
                {/* Logika sederhana: Jika dia punya vote terbanyak di antara semua */}
                {totalVotes > 0 && candidate.voteCount === Math.max(...results.map(r => r.voteCount)) && (
                   <div className="absolute top-0 right-0 bg-yellow-400/20 backdrop-blur-sm px-3 py-1 m-2 rounded-full border border-yellow-500 text-xs font-bold text-yellow-800 flex items-center gap-1 z-10">
                     👑 Unggul Sementara
                   </div>
                )}

                {/* FOTO KANDIDAT */}
                <div className="relative w-full aspect-[4/5] bg-gray-200 border-b-4 border-yellow-500">
                  <Image 
                    src={candidate.avatar} 
                    alt={candidate.name}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  {/* Overlay Gradient bawah */}
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 to-transparent"></div>
                </div>

                {/* INFO KANDIDAT */}
                <div className="p-6 flex-grow flex flex-col justify-end -mt-12 relative z-10">
                  <h2 className="text-2xl font-bold text-white text-center drop-shadow-md mb-1 leading-tight">
                    {candidate.name}
                  </h2>
                </div>

                {/* STATISTIK SUARA (Footer) */}
                <div className="bg-gray-100 p-5 border-t border-gray-200">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <span className="text-sm font-semibold text-gray-500">Perolehan Suara</span>
                      <p className="text-3xl font-black text-gray-800">{candidate.voteCount}</p>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">
                      {candidate.percentage.toFixed(1)}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-300 rounded-full h-4 overflow-hidden shadow-inner">
                    <div 
                      className={`h-full ${getBarColor(candidate.id)} transition-all duration-1000 ease-out`}
                      style={{ width: `${candidate.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FOOTER */}
        <div className="mt-16 text-center border-t border-gray-800 pt-8">
          <p className="text-gray-500 text-sm">
            Data ini bersifat transparan dan tidak dapat dimanipulasi (Immutable).
          </p>
          <div className="flex justify-center items-center gap-2 mt-2 text-xs text-gray-600 font-mono">
             <span>Contract: {NEXT_PUBLIC_EVOTING_ADDRESS.EVoting}</span>
             <a 
               href={`https://sepolia.etherscan.io/address/${NEXT_PUBLIC_EVOTING_ADDRESS.EVoting}`}
               target="_blank"
               className="text-blue-500 hover:underline"
             >
               (View on Etherscan)
             </a>
          </div>
        </div>

      </div>
    </main>
  );
}

// Helper Warna Bar
function getBarColor(id: number) {
  switch (id) {
    case 0: return "bg-gradient-to-r from-green-500 to-green-600";
    case 1: return "bg-gradient-to-r from-blue-500 to-blue-600";
    case 2: return "bg-gradient-to-r from-red-500 to-red-600";
    default: return "bg-gray-500";
  }
}