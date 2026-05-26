# 🗳️ E-Voting Pemilu

**E-Voting Pemilu** adalah purwarupa (prototype) sistem E-Voting desentralisasi masa depan yang menggabungkan keamanan **Blockchain Avalanche**, privasi mutlak menggunakan **ZK-SNARKs**, dan kecerdasan **Gemini AI** sebagai *Smart Security Auditor*. 

Proyek ini dibangun khusus untuk kompetisi **Vibe Coding** guna mendemonstrasikan bagaimana teknologi mutakhir dapat menciptakan pemilu yang transparan, aman, dan tanpa kompromi pada kerahasiaan (*secrecy*) pemilih.

## 🌟 Fitur Utama & Tech Stack

- **⛓️ Avalanche Subnet (Simulasi C-Chain):** Menggunakan *smart contract* untuk mencatat bukti (proof) voting secara permanen (*immutable*) sehingga hasil suara tidak dapat dimanipulasi oleh pihak manapun, termasuk penyelenggara pemilu.
- **🔐 ZK-SNARKs (Zero-Knowledge Proofs):** Memastikan kerahasiaan pemilih secara matematis. Sistem dapat memverifikasi bahwa pemilih memiliki hak suara yang sah tanpa perlu mengetahui *identitas asli* pemilih tersebut atau *siapa* yang dipilihnya.
- **🤖 Gemini AI Smart Auditor:** Memanfaatkan model *Google Gemini 1.5 Flash* untuk bertindak sebagai auditor keamanan pintar. AI mendeteksi anomali pada *payload* JSON, memvalidasi integritas data, dan bertindak sebagai lapis pertahanan (firewall) sebelum data diteruskan ke blockchain.
- **⚡ Golang & Next.js:** Dibangun menggunakan arsitektur modern berkinerja tinggi. Backend menggunakan Golang (Gin + GORM) dan Frontend menggunakan Next.js.

## 🚀 Status Proyek: Purwarupa (Demonstrasi)

Saat ini, E-Voting Pemilu berjalan dalam **Mode Purwarupa/Demonstrasi**. Beberapa fitur keamanan yang sangat ketat diimplementasikan sebagai "simulasi" agar lebih mudah diuji, divalidasi, dan dinilai oleh juri (misalnya: *Active Liveness Detection* wajah disimulasikan menggunakan acuan akhiran NIK "999").

Untuk melihat rancangan arsitektur skala nasional (*Enterprise/Production*) kami yang sesungguhnya—termasuk integrasi *Sovereign Gasless Subnet*, *Client-Side ZK Proving*, dan *Real-time Gemini Vision AI*—silakan baca dokumen visi arsitektur di bawah ini:

👉 **[BACA ROADMAP PRODUCTION (PRODUCTION_READY.md)](./PRODUCTION_READY.md)**

## 🛠️ Cara Menjalankan Proyek Lokal

### 1. Prasyarat Sistem
- Node.js (v18 atau lebih baru)
- Go (1.21 atau lebih baru)
- PostgreSQL
- Akun Google AI Studio (Untuk mendapatkan `GEMINI_API_KEY`)
- Ekstensi Browser **Core Wallet** (Wajib untuk halaman Otoritas Admin, MetaMask tidak didukung di halaman Admin)

### 2. Setup Backend & Database (Golang)
Buka terminal dan arahkan ke direktori `backend`:
```bash
cd backend
cp .env.example .env 
```
*Catatan: Pastikan untuk mengisi `GEMINI_API_KEY` dan kredensial database PostgreSQL Anda di dalam file `.env`.*

```bash
go mod tidy
go run cmd/api/main.go
```
*Server backend akan berjalan di port `8080`.*

### 3. Setup Frontend (Next.js)
Buka terminal baru dan arahkan ke direktori `frontend`:
```bash
cd frontend
npm install
npm run dev
```
*Buka `http://localhost:3000` di browser Anda.*

## 📂 Struktur Repositori Utama

- `/backend` - Logic server API berbasis Golang (Gin, GORM) & Gemini AI.
  - `/backend/cmd` - Entry point server API (`/api`) dan skrip deployment blockchain (`/deploy`).
  - `/backend/internal` - Logic internal backend (`handlers`, `middleware`, `models`, dan `relayer`).
  - `/backend/internal/blockchain` - Integrasi Go bindings (abigen) & RPC ke jaringan Avalanche Fuji.
  - `/backend/zk` - Eksekusi Zero-Knowledge Prover (SnarkJS).
- `/frontend` - Antarmuka pengguna berbasis Web3 (Next.js App Router, viem, Tailwind CSS).
  - `/frontend/app` - Halaman rute simulasi E-Voting (`/admin`, `/vote`, `/results`).
  - `/frontend/components` - Komponen antarmuka pengguna (UI) React.
  - `/frontend/lib` - Konstanta ABI, konfigurasi alamat Smart Contract, dan data Paslon.
- `PRODUCTION_READY.md` - Rancangan *Scale-up* Arsitektur untuk produksi skala riil.

---
