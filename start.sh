#!/bin/bash

echo "🚀 Memulai sistem E-Voting Pemilu (Backend & Frontend)..."

# Tangkap sinyal CTRL+C untuk mematikan semua proses yang berjalan di script ini
trap "exit" INT TERM ERR
trap "kill 0" EXIT

# 1. Jalankan Backend (Golang)
echo "⚙️ Memulai Golang Backend di port 8080..."
cd backend || exit
go run cmd/api/main.go &
BACKEND_PID=$!
cd ..

# 2. Jalankan Frontend (Next.js)
echo "🎨 Memulai Next.js Frontend di port 3000..."
cd frontend || exit
npm run dev &
FRONTEND_PID=$!
cd ..

echo "======================================================="
echo "✅ E-Voting Pemilu berhasil dijalankan!"
echo "🛑 Tekan [CTRL+C] kapan saja untuk mematikan kedua server."
echo "======================================================="

# Tunggu proses selesai agar script tidak langsung tertutup
wait