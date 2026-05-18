"use client";

import { useState, useEffect } from 'react';

export default function FaceVerification({ nik, onSuccess, onFail }: { nik: string, onSuccess: () => void, onFail: () => void }) {
  const [status, setStatus] = useState('Memuat kamera...');

  useEffect(() => {
    // Simulasi Liveness Check via Gemini di frontend (untuk demo, kita buat auto-lolos timer kecuali berakhiran 999 atau 888)
    let timeout1: NodeJS.Timeout;
    let timeout2: NodeJS.Timeout;
    let timeout3: NodeJS.Timeout;

    if (nik.endsWith('999')) {
      timeout1 = setTimeout(() => setStatus('Menganalisa wajah...'), 500);
      timeout2 = setTimeout(() => {
        setStatus('Wajah tidak dikenali atau Liveness gagal.');
        timeout3 = setTimeout(onFail, 2000);
      }, 2500);
    } else {
      timeout1 = setTimeout(() => setStatus('Mendeteksi kehadiran fisik... (Demo Mode: Auto-pass)'), 500);
      timeout2 = setTimeout(() => {
        setStatus('Verifikasi Berhasil!');
        timeout3 = setTimeout(onSuccess, 1500);
      }, 2500);
    }

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
    };
  }, [nik, onSuccess, onFail]);

  return (
    <div className="flex flex-col items-center p-6 border-2 border-dashed border-gray-500 rounded-2xl bg-gray-800">
      <div className="w-64 h-64 bg-gray-700 rounded-full flex items-center justify-center mb-6 overflow-hidden relative shadow-inner">
        {/* Placeholder camera feed */}
        <div className="absolute inset-0 bg-blue-900 opacity-50 flex items-center justify-center">
            <svg className="w-16 h-16 text-blue-400 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
        </div>
      </div>
      <p className="text-xl font-bold text-white text-center">{status}</p>
    </div>
  );
}
