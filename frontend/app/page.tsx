"use client";

import Link from "next/link";
import { candidateData } from "@/lib/candidateData";
import { useState, useEffect } from "react";
import AOS from "aos";
// @ts-expect-error - AOS CSS import tidak memiliki deklarasi tipe bawaan
import "aos/dist/aos.css"; // Import CSS Animasi AOS
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import GradientText from "@/components/GradientText";

// Mendefinisikan tipe data secara ketat untuk menggantikan 'any'
interface Candidate {
  id: number;
  number: string;
  name: string;
  color: string;
  image: string;
  bgImage?: string;
  biography: string;
  programs: string[];
  achievements: string[];
}

export default function Home() {

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,    
    });
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 pb-20 selection:bg-blue-500/30">
      
      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-slate-950 text-white py-20 px-4 text-center">
        {/* Glowing Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] pointer-events-none"></div>
        
        <div className="max-w-5xl mx-auto relative z-10 flex flex-col items-center">
          <div data-aos="fade-down" className="inline-block mb-6 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-sm font-medium text-blue-300">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              E-Voting Masa Depan
            </span>
          </div>
          
          <h1 data-aos="fade-down" data-aos-delay="100" className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-white leading-tight">
            Tentukan Masa Depan Bangsa <br />
            <GradientText
              colors={["#38bdf8", "#818cf8", "#c084fc", "#818cf8", "#38bdf8"]}
              animationSpeed={4}
              showBorder={false}
              className="inline-block mt-2 font-extrabold"
            >
              Secara Transparan & Aman
            </GradientText>
          </h1>
          
          <p 
            data-aos="fade-up" 
            data-aos-delay="200" 
            className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto font-light"
          >
            Sistem E-Voting berbasis Blockchain pertama yang menjamin suara Anda 
            terhitung secara akurat, anonim, dan tidak dapat dimanipulasi.
          </p>

          <div 
            data-aos="zoom-in" 
            data-aos-delay="400" 
            className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto"
          >
            <Button asChild size="lg" className="bg-white text-slate-950 font-bold rounded-full shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)] hover:bg-slate-200 transition-all transform hover:scale-105 h-14 px-8 text-base">
              <Link href="/vote">
                Mulai Voting Sekarang ➔
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white/20 text-white font-bold rounded-full hover:bg-white/10 hover:text-white transition-all backdrop-blur-md bg-white/5 h-14 px-8 text-base">
              <a href="#candidates">
                Pelajari Kandidat
              </a>
            </Button>
          </div>
        </div>
        
        {/* Grid Pattern Background */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      </section>

      {/* CANDIDATES SECTION */}
      <section id="candidates" className="relative bg-slate-950 py-24 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Kandidat Pilihan</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light">Pelajari visi, misi, dan rekam jejak kepemimpinan mereka untuk masa depan Indonesia yang lebih baik.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 xl:gap-12">
            {candidateData.map((candidate, index) => (
              <div key={candidate.id} data-aos="fade-up" data-aos-delay={index * 200}>
                <CandidateCard data={candidate} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INFO SECTION */}
      <section className="relative bg-slate-900 py-24 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Mengapa E-Voting Blockchain?
            </h2>
            <p className="text-slate-400 font-light max-w-2xl mx-auto">Teknologi desentralisasi menghadirkan tingkat kepercayaan baru dalam proses demokrasi.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              delay="0"
              icon="🔒"
              title="Aman & Terenkripsi"
              desc="Suara dilindungi kriptografi canggih (ZK-SNARKs) sehingga identitas Anda tetap rahasia mutlak."
            />
            <FeatureCard 
              delay="200"
              icon="⚡"
              title="Real-Time & Presisi"
              desc="Perhitungan suara dieksekusi oleh smart contract secara otomatis tanpa jeda rekapitulasi manual."
            />
            <FeatureCard 
              delay="400"
              icon="🔎"
              title="Transparan & Immutable"
              desc="Jejak audit on-chain dapat diverifikasi secara publik tanpa entitas tunggal yang dapat mengubah data."
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ delay, icon, title, desc }: { delay: string, icon: string, title: string, desc: string }) {
  return (
    <div data-aos="fade-up" data-aos-delay={delay} className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all hover:-translate-y-1 duration-300 group">
      <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center text-3xl mb-6 border border-blue-500/30 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="font-bold text-xl text-white mb-3">{title}</h3>
      <p className="text-slate-400 font-light leading-relaxed">{desc}</p>
    </div>
  );
}

function CandidateCard({ data }: { data: Candidate }) {
  const [activeTab, setActiveTab] = useState<"bio" | "program" | "awards">("bio");

  return (
    <Card className="rounded-3xl overflow-hidden bg-white/5 border-white/10 backdrop-blur-md hover:shadow-[0_0_40px_-10px_rgba(120,119,198,0.3)] transition-all duration-500 flex flex-col h-full group text-white">
      
      {/* HEADER KARTU */}
      <div className="relative h-72 flex flex-col justify-end items-center p-6 overflow-hidden">
        {/* Background Layer */}
        <div 
          className="absolute inset-0 bg-cover bg-top transition-transform duration-1000 group-hover:scale-110 opacity-60"
          style={{ backgroundImage: `url(${data.bgImage || data.image})` }} 
        />
        {/* Overlay Gradients for deep look */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        <div className={`absolute inset-0 ${data.color} opacity-20 mix-blend-overlay`} />

        <div className="relative z-10 w-full flex flex-col items-center">
          <div className="absolute top-0 left-0 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold tracking-widest border border-white/20 text-white shadow-lg">
            PASLON {data.number}
          </div>
          
          <div className="w-28 h-28 rounded-full mb-4 border-2 border-white/20 p-1 flex items-center justify-center overflow-hidden shadow-2xl relative bg-slate-900/50 backdrop-blur-sm">
             <Image 
               src={data.image} 
               alt={data.name} 
               width={112} 
               height={112} 
               className="w-full h-full object-cover rounded-full" 
             />
          </div>
          <h3 className="text-xl md:text-2xl font-extrabold leading-tight text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            {data.name}
          </h3>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex border-y border-white/10 bg-slate-950/50 relative z-20">
        <TabButton active={activeTab === "bio"} onClick={() => setActiveTab("bio")} icon="📖" label="Riwayat" />
        <TabButton active={activeTab === "program"} onClick={() => setActiveTab("program")} icon="⚡" label="Program" />
        <TabButton active={activeTab === "awards"} onClick={() => setActiveTab("awards")} icon="🏆" label="Prestasi" />
      </div>

      {/* CONTENT AREA */}
      <CardContent className="p-6 flex-grow bg-slate-950/30 relative z-20">
        <div className="h-48 overflow-y-auto pr-2 custom-scrollbar">
          {activeTab === "bio" && (
            <div className="animate-in fade-in zoom-in duration-500">
              <p className="text-sm text-slate-300 leading-relaxed font-light text-justify">
                {data.biography}
              </p>
            </div>
          )}

          {activeTab !== "bio" && (
            <ul className="space-y-4">
              {(activeTab === "program" ? data.programs : data.achievements || []).map((item: string, idx: number) => (
                <li key={idx} className="flex items-start text-sm text-slate-300 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                  <span className="mr-3 mt-0.5 flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-white/10 border border-white/20 text-[10px]">
                    {activeTab === "program" ? "✓" : "★"}
                  </span>
                  <span className="font-light leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-6 bg-slate-950/80 border-t border-white/10 flex justify-center mt-auto relative z-20">
        <Button 
          asChild 
          className="w-full bg-white text-slate-950 font-bold hover:bg-slate-200 hover:scale-[1.02] transition-all duration-300 h-12 rounded-xl"
        >
          <Link href="/vote">
            Pilih Paslon {data.number} <span className="ml-2">➔</span>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: string, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3 text-xs font-semibold transition-all duration-300 flex flex-col items-center gap-1 ${
        active 
          ? "text-white bg-white/10" 
          : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
      }`}
    >
      <span className="text-sm">{icon}</span>
      {label}
    </button>
  );
}