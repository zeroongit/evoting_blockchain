# =========================================================================
# STAGE 1: BUILDER (Golang)
# Mengompilasi kode Go menjadi binary eksekusi tunggal
# =========================================================================
FROM golang:1.21-alpine AS builder

# Set working directory di dalam container
WORKDIR /build

# Copy file module Go dan download dependensi
COPY backend/go.mod backend/go.sum ./
RUN go mod download

# Copy seluruh source code backend
COPY backend/ ./

# Kompilasi aplikasi Go (Binary statis, CGO dimatikan agar berjalan di Alpine)
RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/api/main.go

# =========================================================================
# STAGE 2: RUNTIME (Alpine Linux + Node.js)
# Lingkungan production yang sangat ringan namun mendukung eksekusi ZK
# =========================================================================
FROM alpine:latest

# Install Node.js dan npm untuk kebutuhan eksekusi script generate-proof.cjs
RUN apk add --no-cache nodejs npm

WORKDIR /app

# 1. Copy binary Go dari stage builder
COPY --from=builder /build/server .

# 2. Copy package.json dan install dependensi Node (seperti snarkjs)
COPY backend/package.json backend/package-lock.json* ./
RUN npm install --omit=dev

# 3. (Opsional) Copy script ZK Prover - Dinonaktifkan sementara karena di fase purwarupa tidak ada folder scripts
# COPY backend/scripts/ ./scripts/

# Set environment variable standar
ENV GIN_MODE=release
ENV PORT=8080

# Buka port aplikasi
EXPOSE 8080

# Jalankan server Golang
CMD ["./server"]
