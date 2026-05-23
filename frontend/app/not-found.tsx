import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 animate-pulse">
          404
        </h1>
        <h2 className="text-3xl font-bold text-white tracking-tight sm:text-4xl">
          Halaman Tidak Ditemukan
        </h2>
        <p className="text-lg text-gray-400 max-w-md mx-auto">
          Maaf, bilik suara atau halaman yang Anda cari mungkin telah dipindahkan atau memang tidak pernah ada di sistem ini.
        </p>
        <div className="pt-6">
          <Link href="/" className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-gray-900 bg-yellow-500 hover:bg-yellow-400 transition-transform hover:scale-105 duration-200">
            🏠 Kembali ke Beranda
          </Link>
        </div>
      </div>
    </main>
  );
}