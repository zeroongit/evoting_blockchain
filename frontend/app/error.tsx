"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Anda bisa menyambungkan ini ke layanan log error seperti Sentry jika di production
    console.error("Aplikasi mengalami crash:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
      <div className="bg-gray-800 p-8 sm:p-12 rounded-3xl shadow-2xl border border-red-500/30 max-w-lg w-full space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-white">
          Terjadi Kesalahan Sistem
        </h2>
        <p className="text-gray-400 text-sm">
          Sistem E-Voting mengalami gangguan saat mencoba memproses permintaan Anda. Jangan khawatir, integritas suara blockchain tetap aman.
        </p>
        <button
          onClick={() => reset()}
          className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-bold rounded-xl text-white bg-red-600 hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 mt-4"
        >
          🔄 Coba Lagi
        </button>
        <p className="text-xs text-gray-600 mt-4 font-mono truncate">{error.message}</p>
      </div>
    </main>
  );
}