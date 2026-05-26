# ⚙️ Backend Golang - E-Voting Pemilu

Direktori ini berisi *source code* untuk server Backend API sistem E-Voting, yang dibangun menggunakan **Golang** (framework Gin) dan ORM **GORM** untuk PostgreSQL. Backend ini bertugas mengelola data *off-chain* (seperti simulasi DPT), memfasilitasi transaksi blockchain (*Relayer* ke jaringan Avalanche), memvalidasi payload menggunakan **Gemini AI**, serta bertindak sebagai fasilitator *Zero-Knowledge Proofs* (ZK-SNARKs).

## 🛠️ Persyaratan
- **Go** (v1.21 atau lebih baru)
- **PostgreSQL** (berjalan di background dan dapat diakses lokal)
- **Akun Google AI Studio** (untuk mendapatkan `GEMINI_API_KEY`)

## 🚀 Cara Menjalankan Server Lokal

1. **Salin file konfigurasi environment:**
   ```bash
   cp .env.example .env
   ```
2. **Sesuaikan kredensial di file `.env`**:
   - Konfigurasi database `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.
   - Masukkan `GEMINI_API_KEY`.
   - Masukkan `RELAYER_PRIVATE_KEY` (Private key dompet yang berisi saldo AVAX Fuji Testnet untuk membiayai gas fee relayer).

3. **Unduh dependensi Go:**
   ```bash
   go mod tidy
   ```

4. **Jalankan server API:**
   ```bash
   go run cmd/api/main.go
   ```
   *Server akan berjalan secara default di `http://localhost:8080`.*

## 📜 Script Deployment Smart Contract
Backend ini juga mencakup *script* Golang untuk mendeploy seluruh ekosistem Smart Contract ke jaringan Avalanche Fuji Testnet (menggantikan penggunaan Hardhat).

Untuk menjalankan deployer mandiri:
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
- `zk/` - Logika pemanggilan *Zero-Knowledge Proving* (melalui SnarkJS wrapper).