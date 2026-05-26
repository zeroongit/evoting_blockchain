# ⚙️ Golang Backend - E-Voting Election

This directory contains the *source code* for the E-Voting system Backend API server, built using **Golang** (Gin framework) and **GORM** ORM for PostgreSQL. This backend is responsible for managing *off-chain* data (such as DPT simulation), facilitating blockchain transactions (*Relayer* to the Avalanche network), validating payloads using **Gemini AI**, and acting as a facilitator for *Zero-Knowledge Proofs* (ZK-SNARKs).

## 🛠️ Requirements
- **Go** (v1.21 or newer)
- **PostgreSQL** (running in the background and accessible locally)
- **Google AI Studio Account** (to get the `GEMINI_API_KEY`)

## 🚀 How to Run the Local Server

1. **Copy the environment configuration file:**
   ```bash
   cp .env.example .env
   ```
2. **Adjust credentials in the `.env` file**:
   - Configure database `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.
   - Enter `GEMINI_API_KEY`.
   - Enter `RELAYER_PRIVATE_KEY` (The private key of the wallet containing AVAX Fuji Testnet balance to fund relayer gas fees).

3. **Download Go dependencies:**
   ```bash
   go mod tidy
   ```

4. **Run the API server:**
   ```bash
   go run cmd/api/main.go
   ```
   *The server will run by default at `http://localhost:8080`.*

## 📜 Smart Contract Deployment Script
This backend also includes a Golang *script* to deploy the entire Smart Contract ecosystem to the Avalanche Fuji Testnet network (replacing the use of Hardhat).

To run the standalone deployer:
```bash
go run cmd/deploy/main.go
```
*(Pastikan alamat kontrak baru hasil deploy disalin ke dalam konstanta alamat E-Voting di Frontend maupun Backend agar saling tersinkronisasi).*

## 📂 Struktur Direktori Spesifik
- `cmd/` - *Entry point* aplikasi. Terdiri dari `api` untuk web server, dan `deploy` untuk blockchain deployment script.
- `internal/` - Logika inti backend.
  - `blockchain/` - Berisi *Go bindings* (abigen) & interaksi relayer ke Avalanche.
  - `handlers/` - *Controller* untuk melayani rute HTTP (API DPT, API Vote, & AI Audit).
  - `models/` - *Schema* model database GORM.
  - `relayer/` - Pemrosesan format payload dan integrasi relay on-chain EVM.