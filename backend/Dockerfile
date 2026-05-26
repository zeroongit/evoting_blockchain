# =========================================================================
# STAGE 1: Go Builder
# =========================================================================
FROM golang:1.21-alpine AS builder
WORKDIR /app

# Download dependensi Go
COPY go.mod go.sum* ./
RUN go mod download

# Copy seluruh source code
COPY . .

# Build aplikasi Go (CGO dinonaktifkan untuk container Alpine)
RUN CGO_ENABLED=0 GOOS=linux go build -o main cmd/api/main.go

# =========================================================================
# STAGE 2: Runner (Membutuhkan Node.js untuk ZK Prover)
# =========================================================================
FROM alpine:latest
WORKDIR /app

# INSTALL NODE.JS (Kritikal untuk eksekusi scripts/generate-proof.cjs di prover.go)
RUN apk add --no-cache nodejs

COPY --from=builder /app/main .
COPY --from=builder /app/scripts ./scripts

EXPOSE 8080

CMD ["./main"]