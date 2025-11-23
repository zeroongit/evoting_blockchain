"use client";

import { useEffect, useState } from "react";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import { candidateData } from "@/lib/candidateData"; // Data statis (Nama, Foto)
import { NEXT_PUBLIC_EVOTING_ADDRESS, EVOTING_ABI } from "@/lib/constants";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

// Registrasi komponen Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function ResultsPage() {
  const [loading, setLoading] = useState(true);
  const [totalVotes, setTotalVotes] = useState(0);
  const [results, setResults] = useState<any[]>([]);

  // --- FUNGSI AMBIL DATA DARI BLOCKCHAIN ---
  async function fetchResults() {
    try {
      setLoading(true);
      const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(),
      });

      // Ambil Total Suara (dari Contract)
      const totalBN = await publicClient.readContract({
        address: NEXT_PUBLIC_EVOTING_ADDRESS as `0x${string}`,
        abi: EVOTING_ABI,
        functionName: "getTotalVotes",
        args: [BigInt(0)], // Election ID 0
      }) as bigint;

      const total = Number(totalBN);
      setTotalVotes(total);

      // Ambil Suara Per Kandidat (Looping)
      const newResults = await Promise.all(
        candidateData.map(async (candidate) => {
          const votesBN = await publicClient.readContract({
            address: NEXT_PUBLIC_EVOTING_ADDRESS as `0x${string}`,
            abi: EVOTING_ABI,
            functionName: "getCandidateVotes",
            args: [BigInt(0), BigInt(candidate.id)],
          }) as bigint;
          
          const voteCount = Number(votesBN);
          
          // Hitung Persentase
          const percentage = total > 0 ? ((voteCount / total) * 100).toFixed(1) : "0";

          return {
            ...candidate,
            voteCount,
            percentage,
          };
        })
      );

      // Urutkan dari suara terbanyak (Juara 1 di atas)
      newResults.sort((a, b) => b.voteCount - a.voteCount);
      setResults(newResults);

    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  }

  // Panggil saat halaman dibuka
  useEffect(() => {
    fetchResults();
    
    // Auto-refresh setiap 10 detik (Real Count!)
    const interval = setInterval(fetchResults, 10000);
    return () => clearInterval(interval);
  }, []);

  // --- CONFIG CHART ---
  const chartData = {
    labels: results.map((c) => c.name.split("&")[0]), // Ambil nama depan saja biar tidak kepanjangan
    datasets: [
      {
        label: "Jumlah Suara",
        data: results.map((c) => c.voteCount),
        backgroundColor: [
          "rgba(22, 163, 74, 0.7)",  // Hijau (01)
          "rgba(56, 189, 248, 0.7)", // Biru (02)
          "rgba(220, 38, 38, 0.7)",  // Merah (03)
        ],
        borderColor: [
          "rgb(22, 163, 74)",
          "rgb(56, 189, 248)",
          "rgb(220, 38, 38)",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Hasil Hitung Cepat (Real Count)
          </h1>
          <p className="text-gray-600">
            Data diambil langsung dari Blockchain Sepolia secara transparan.
          </p>
          <div className="mt-4 inline-flex items-center bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></span>
            <span className="text-sm font-mono text-gray-600">
              Total Suara Masuk: <strong>{totalVotes}</strong>
            </span>
          </div>
        </div>

        {loading && results.length === 0 ? (
           <div className="flex justify-center p-20">
             <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
           </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* KIRI: GRAFIK VISUAL */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-gray-700 mb-6 border-b pb-2">Visualisasi Data</h3>
              <div className="h-64 flex justify-center items-center">
                 {/* Bar Chart */}
                 <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
              <div className="mt-8 h-48 flex justify-center">
                 {/* Pie Chart Kecil */}
                 <Doughnut data={chartData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>

            {/* KANAN: LEADERBOARD DETAIL */}
            <div className="space-y-4">
              {results.map((candidate, index) => (
                <div 
                  key={candidate.id}
                  className={`relative overflow-hidden bg-white p-6 rounded-2xl shadow-md border-2 transition-transform transform hover:scale-[1.02] ${index === 0 ? "border-yellow-400 ring-2 ring-yellow-100" : "border-gray-100"}`}
                >
                  {/* Mahkota untuk Juara 1 */}
                  {index === 0 && (
                    <div className="absolute top-0 right-0 bg-yellow-400 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                      👑 Pemenang Sementara
                    </div>
                  )}

                  <div className="flex items-center gap-4 relative z-10">
                    {/* Foto */}
                    <div className="w-16 h-16 rounded-full border-2 border-gray-200 overflow-hidden flex-shrink-0">
                      <img src={candidate.image} alt={candidate.name} className="w-full h-full object-cover" />
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex justify-between items-end mb-1">
                        <h3 className="font-bold text-gray-800 text-lg leading-tight">
                          {candidate.name}
                        </h3>
                        <span className="text-2xl font-black text-indigo-900">
                          {candidate.percentage}%
                        </span>
                      </div>
                      
                      {/* Progress Bar Background */}
                      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ease-out ${candidate.color.replace('bg-', 'bg-')}`} // Hack sedikit biar warnanya masuk
                          style={{ width: `${candidate.percentage}%`, backgroundColor: index === 0 ? '#16a34a' : index === 1 ? '#0ea5e9' : '#dc2626' }}
                        ></div>
                      </div>
                      
                      <p className="text-xs text-gray-500 mt-2 text-right">
                        {candidate.voteCount} Suara Sah
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800 mt-6">
                💡 <strong>Info Skripsi:</strong> Halaman ini melakukan <i>query</i> langsung ke Smart Contract setiap 10 detik. Data yang Anda lihat 100% immutable (tidak bisa diubah admin).
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}