"use client";

import Link from "next/link";
import { candidateData } from "@/lib/candidateData";
import { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css"; // Import CSS Animasi AOS

export default function Home() {

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,    
    });
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      
      {/* HERO SECTION */}
      <section className="bg-indigo-900 text-white py-20 px-4 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          {/* Animasi Fade Down untuk Judul */}
          <h1 
            data-aos="fade-down" 
            className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight"
          >
            Tentukan Masa Depan Bangsa <br />
            <span className="text-blue-300">Secara Transparan & Aman</span>
          </h1>
          
          {/* Animasi Fade Up untuk Deskripsi */}
          <p 
            data-aos="fade-up" 
            data-aos-delay="200" 
            className="text-lg md:text-xl text-indigo-200 mb-8 max-w-2xl mx-auto"
          >
            Sistem E-Voting berbasis Blockchain pertama yang menjamin suara Anda 
            terhitung secara akurat, anonim, dan tidak dapat dimanipulasi.
          </p>

          {/* Animasi Zoom In untuk Tombol */}
          <div 
            data-aos="zoom-in" 
            data-aos-delay="400" 
            className="flex justify-center gap-4"
          >
            <Link 
              href="/vote" 
              className="bg-white text-indigo-900 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-gray-100 transition transform hover:scale-105"
            >
              Mulai Voting Sekarang ➔
            </Link>
            <a 
              href="#candidates" 
              className="border border-white text-white font-bold py-3 px-8 rounded-full hover:bg-white/10 transition"
            >
              Lihat Kandidat
            </a>
          </div>
        </div>
        
        {/* Background Pattern */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute left-0 bottom-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* CANDIDATES SECTION */}
      <section id="candidates" className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12" data-aos="fade-up">
          <h2 className="text-3xl font-bold text-gray-800">Kenali Kandidat Pilihanmu</h2>
          <p className="text-gray-600 mt-2">Pelajari visi, misi, dan rekam jejak mereka sebelum memberikan suara.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {candidateData.map((candidate, index) => (
            // Animasi Flip Left untuk setiap kartu dengan delay berjenjang
            <div 
              key={candidate.id} 
              data-aos="flip-left" 
              data-aos-delay={index * 200} // Kartu 1 muncul duluan, lalu kartu 2, dst
            >
              <CandidateCard data={candidate} />
            </div>
          ))}
        </div>
      </section>

      {/* INFO SECTION */}
      <section className="bg-white py-16 border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 data-aos="fade-right" className="text-2xl font-bold text-gray-800 mb-8">
            Mengapa E-Voting Blockchain?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div data-aos="fade-up" data-aos-delay="0" className="p-6 bg-blue-50 rounded-xl hover:shadow-lg transition">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="font-bold text-lg mb-2">Aman & Terenkripsi</h3>
              <p className="text-sm text-gray-600">Suara dilindungi kriptografi canggih (ZK-SNARKs) sehingga identitas Anda tetap rahasia.</p>
            </div>
            
            <div data-aos="fade-up" data-aos-delay="200" className="p-6 bg-blue-50 rounded-xl hover:shadow-lg transition">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="font-bold text-lg mb-2">Real-Time & Cepat</h3>
              <p className="text-sm text-gray-600">Perhitungan suara terjadi secara otomatis di blockchain tanpa perlu rekapitulasi manual.</p>
            </div>
            
            <div data-aos="fade-up" data-aos-delay="400" className="p-6 bg-blue-50 rounded-xl hover:shadow-lg transition">
              <div className="text-4xl mb-4">🔎</div>
              <h3 className="font-bold text-lg mb-2">Transparan</h3>
              <p className="text-sm text-gray-600">Semua orang dapat memverifikasi hasil pemilihan langsung dari jaringan publik.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

// Sub-Component (Tidak perlu diubah, cukup AOS di parentnya tadi)
function CandidateCard({ data }: { data: any }) {
  // State sekarang bisa 'program', 'awards', atau 'bio'
  const [activeTab, setActiveTab] = useState<"program" | "awards" | "bio">("bio"); // Default kita set ke 'bio' biar langsung kebaca

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow border border-gray-100 flex flex-col h-full group">
      
      {/* HEADER KARTU (Tetap sama seperti sebelumnya) */}
      <div className="relative p-6 text-center text-white overflow-hidden h-64 flex flex-col justify-center items-center">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
          style={{ backgroundImage: `url(${data.bgImage})` }}
        />
        <div className={`absolute inset-0 ${data.color} opacity-85 mix-blend-multiply`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

        <div className="relative z-10 w-full">
          <div className="absolute top-0 left-0 bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border border-white/30 shadow-sm">
            No. Urut {data.number}
          </div>
          <div className="w-28 h-28 bg-white rounded-full mx-auto mb-3 border-4 border-white/50 flex items-center justify-center overflow-hidden shadow-2xl relative">
             <img src={data.image} alt={data.name} className="w-full h-full object-cover" />
          </div>
          <h3 className="text-xl font-bold leading-tight drop-shadow-lg text-shadow-sm min-h-[3.5rem] flex items-center justify-center">
            {data.name}
          </h3>
        </div>
      </div>

      {/* TABS NAVIGATION (Sekarang ada 3 Tombol) */}
      <div className="flex border-b border-gray-100 bg-white relative z-20">
        <button
          onClick={() => setActiveTab("bio")}
          className={`flex-1 py-3 text-xs font-bold transition ${
            activeTab === "bio" 
              ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50" 
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          📖 Riwayat
        </button>
        <button
          onClick={() => setActiveTab("program")}
          className={`flex-1 py-3 text-xs font-bold transition ${
            activeTab === "program" 
              ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50" 
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          🔥 Program
        </button>
        <button
          onClick={() => setActiveTab("awards")}
          className={`flex-1 py-3 text-xs font-bold transition ${
            activeTab === "awards" 
              ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50" 
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          🏆 Prestasi
        </button>
      </div>

      {/* CONTENT AREA */}
      <div className="p-6 flex-grow bg-white relative z-20">
        
        {/* Tampilan untuk Tab BIOGRAFI (Teks Paragraf) */}
        {activeTab === "bio" && (
          <div className="animate-in fade-in zoom-in duration-300">
            <p className="text-sm text-gray-600 leading-relaxed text-justify">
              {data.biography}
            </p>
          </div>
        )}

        {/* Tampilan untuk Tab PROGRAM & PRESTASI (List Poin) */}
        {activeTab !== "bio" && (
          <ul className="space-y-3">
            {(activeTab === "program" ? data.programs : data.achievements || []).map((item: string, idx: number) => (
              <li key={idx} className="flex items-start text-sm text-gray-700 animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${idx * 100}ms` }}>
                <span className={`mr-2 mt-1 min-w-[16px] ${activeTab === "program" ? "text-green-500" : "text-yellow-500"}`}>
                  {activeTab === "program" ? "✓" : "★"}
                </span>
                {item}
              </li>
            ))}
          </ul>
        )}

      </div>

      <div className="p-4 bg-gray-50 border-t border-gray-100 text-center mt-auto relative z-20">
        <Link 
          href="/vote" 
          className="text-indigo-600 font-bold text-sm hover:text-indigo-800 flex items-center justify-center gap-1 group-hover:gap-2 transition-all"
        >
          Pilih Paslon {data.number} <span>➔</span>
        </Link>
      </div>
    </div>
  );
}