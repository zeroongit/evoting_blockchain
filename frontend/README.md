# 🎨 Frontend Next.js - E-Voting Pemilu

Direktori ini berisi antarmuka pengguna (UI) sistem E-Voting Pemilu. Dibangun menggunakan **Next.js (App Router)**, **React**, **Tailwind CSS**, dan diintegrasikan dengan Web3 melalui library **viem** untuk membaca (*read*) dan menulis (*write*) data ke Smart Contract di jaringan Avalanche Fuji.

## 🌟 Modul Halaman Tersedia
- **Portal Pemilih (`/vote`)**: Antarmuka bilik digital yang memuat *liveness detection* (simulasi wajah NIK 999) dan pembuatan *Zero-Knowledge Proofs* menggunakan eksekusi library `snarkjs` secara langsung di sisi *client*.
- **Portal Admin (`/admin`)**: Dashboard otorisasi panitia untuk memulai/menghentikan sesi pemilu secara on-chain serta memanipulasi DPT dummy. Halaman ini mensyaratkan otentikasi ketat menggunakan dompet **Core Wallet**.

## 🛠️ Persyaratan Lingkungan
- **Node.js** (v18 atau lebih baru) disarankan mengelola via `nvm`.
- **NPM** atau **Yarn**
- Ekstensi Browser **Core Wallet** (MetaMask dilarang dalam validasi injeksi provider di halaman Admin).

## 🚀 Cara Menjalankan Frontend Lokal

1. **Instal dependensi bawaan NPM:**
   ```bash
   npm install
   ```

2. **Atur Environment Variables (Opsional):**
   Secara default, frontend memanggil backend Golang melalui rute `http://localhost:8080/api/v1`. Jika Anda perlu mengubahnya, buat file `.env.local` dan tambahkan:
   ```env
   NEXT_PUBLIC_BACKEND_GO_URL=http://localhost:8080/api/v1
   ```
   *Catatan: Konfigurasi alamat Smart Contract E-Voting Avalanche diletakkan secara terpusat di dalam `lib/constants.ts`.*

3. **Jalankan server pengembangan (Development Server):**
   ```bash
   npm run dev
   ```
   
4. **Akses aplikasi:**
   Buka http://localhost:3000 pada peramban web (browser). Anda bisa mencoba rute `/vote` dan `/admin`.

## 📂 Struktur Direktori Spesifik
- `app/` - Pengaturan arsitektur rute halaman dengan Next.js App Router (`/admin/page.tsx`, `/vote/page.tsx`).
- `components/` - Komponen modular UI yang dapat di-*reuse* (contoh: desain `FaceVerification.tsx`, tombol *Tailwind/shadcn*).
- `lib/` - Berisi file utilitas, data statis (`candidateData.ts`), dan struktur JSON *ABI Smart Contract* (`constants.ts`).
- `public/`
  - `circuits/` - Direktori esensial untuk menyimpan file `.wasm` dan `.zkey` (Sirkuite Circom). File ini akan diunduh secara statis ke dalam *browser* pemilih saat mereka melakukan *vote* guna mengeksekusi *Client-Side Proving ZK-SNARK*.
