# 🗳️ E-Voting Election

**E-Voting Election** is a future decentralized E-Voting system prototype combining **Avalanche Blockchain** security, absolute privacy using **ZK-SNARKs**, and **Gemini AI** intelligence as a *Smart Security Auditor*. 

This project was built specifically for the **Vibe Coding** competition to demonstrate how cutting-edge technology can create transparent, secure elections without compromising voter *secrecy*.

## 🌟 Main Features & Tech Stack

- **⛓️ Avalanche Subnet (C-Chain Simulation):** Uses *smart contracts* to record voting proofs permanently (*immutable*) so that voting results cannot be manipulated by any party, including election organizers.
- **🔐 ZK-SNARKs (Zero-Knowledge Proofs):** Ensures voter privacy mathematically. The system can verify that a voter has a valid right to vote without needing to know the *real identity* of the voter or *who* they voted for.
- **🤖 Gemini AI Smart Auditor:** Utilizes the *Google Gemini 1.5 Flash* model to act as a smart security auditor. The AI detects anomalies in the JSON *payload*, validates data integrity, and acts as a defense layer (firewall) before data is passed to the blockchain.
- **⚡ Golang & Next.js:** Built using a high-performance modern architecture. The backend uses Golang (Gin + GORM) and the Frontend uses Next.js.

## 🚀 Project Status: Prototype (Demonstration)

Currently, E-Voting Election is running in **Prototype/Demonstration Mode**. Some highly strict security features are implemented as "simulations" to make it easier to test, validate, and be judged by the panel (e.g., facial *Active Liveness Detection* is simulated using the NIK suffix reference "999").

To view our true national-scale architecture design (*Enterprise/Production*)—including the integration of a *Sovereign Gasless Subnet*, *Client-Side ZK Proving*, and *Real-time Gemini Vision AI*—please read the architectural vision document below:

👉 **[READ THE PRODUCTION ROADMAP (PRODUCTION_READY.md)](./PRODUCTION_READY.md)**

## 🛠️ How to Run the Project Locally

### 1. System Requirements
- Node.js (v18 or newer)
- Go (1.21 or newer)
- PostgreSQL
- Google AI Studio Account (To get the `GEMINI_API_KEY`)
- **Core Wallet** Browser Extension (Required for the Admin Authority page, MetaMask is not supported on the Admin page)

### 2. Backend & Database Setup (Golang)
Open a terminal and navigate to the `backend` directory:
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
