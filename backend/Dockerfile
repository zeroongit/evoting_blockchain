# =========================================================================
# STAGE 1: Go Builder
# =========================================================================
FROM golang:alpine AS builder
WORKDIR /app

# Download dependensi Go
COPY go.mod go.sum* ./
RUN go mod download

# Copy seluruh source code
COPY . .

# Build aplikasi Go (CGO dinonaktifkan untuk container Alpine)
RUN CGO_ENABLED=0 GOOS=linux go build -o main cmd/api/main.go

# =========================================================================
# STAGE 2: Runner
# =========================================================================
FROM alpine:latest
WORKDIR /app

COPY --from=builder /app/main .

EXPOSE 8080

CMD ["./main"]