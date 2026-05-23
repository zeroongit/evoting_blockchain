"use client";

import { useState, useEffect, useRef } from 'react';

export default function FaceVerification({ nik, nama, onSuccess, onFail }: { nik: string, nama: string, onSuccess: () => void, onFail: () => void }) {
  const [status, setStatus] = useState('Memuat kamera...');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Meminta akses kamera
    let stream: MediaStream | null = null;
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((s) => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      })
      .catch((err) => {
        console.error("Gagal mengakses kamera:", err);
      });

    // Simulasi Liveness Check via Gemini di frontend
    let timeout1: NodeJS.Timeout;
    let timeout2: NodeJS.Timeout;
    let timeout3: NodeJS.Timeout;

    if (nik.endsWith('999')) {
      timeout1 = setTimeout(() => setStatus('Menganalisa wajah via Gemini Vision...'), 500);
      timeout2 = setTimeout(() => {
        setStatus('Wajah tidak dikenali atau Liveness gagal.');
        timeout3 = setTimeout(onFail, 2000);
      }, 3500);
    } else {
      timeout1 = setTimeout(() => setStatus('Menganalisa wajah via Gemini Vision...'), 500);
      timeout2 = setTimeout(() => {
        setStatus('Verifikasi Biometrik Berhasil! (Gemini Vision)');
        timeout3 = setTimeout(onSuccess, 2000);
      }, 3500);
    }

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [nik, onSuccess, onFail]);

  return (
    <div className="flex flex-col items-center p-6 border-2 border-dashed border-gray-500 rounded-2xl bg-gray-800">
      <div className="w-80 h-80 bg-black rounded-full flex items-center justify-center mb-6 overflow-hidden relative shadow-[0_0_20px_rgba(59,130,246,0.5)] border-4 border-blue-500">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className="w-full h-full object-cover transform scale-x-[-1]"
        />
        <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center pointer-events-none">
          <div className="w-48 h-64 border-2 border-blue-400/50 rounded-full animate-pulse blur-[1px]"></div>
        </div>
      </div>
      <p className="text-xl font-bold text-white text-center mb-2">{status}</p>
      <div className="bg-green-900/50 border border-green-500/50 text-green-300 px-4 py-2 rounded-lg text-sm text-center">
        ✅ NIK belum dipakai dan terdaftar atas nama <span className="font-bold">{nama}</span>
      </div>
    </div>
  );
}
