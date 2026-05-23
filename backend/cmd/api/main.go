package main

import (
	"context"
	"evoting_pemilu/internal/handlers"
	"evoting_pemilu/internal/middleware"
	"evoting_pemilu/internal/models"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-contrib/cors"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(".env"); err != nil {
		log.Println("No .env file found, relying on environment variables if available")
	}

	// Inisialisasi koneksi PostgreSQL
	models.InitDB()

	router := gin.Default()

	// CORS middleware
	// 🚀 HAPUS MIDDLEWARE LAMA, GANTI DENGAN BLOK INI:
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3000"} // Izinkan frontend Next.js kamu
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization", "X-CSRF-Token", "x-csrf-token"}
	config.AllowCredentials = true

	// Pasang ke router Gin
	router.Use(cors.New(config))

	api := router.Group("/api/v1")
	{
		api.GET("/csrf-token", handlers.GenerateCSRF)
		api.POST("/verify-face", middleware.RateLimiter(), handlers.VerifyFace) // Dilindungi Rate Limiter
		api.POST("/vote", middleware.RateLimiter(), handlers.SubmitVote)        // Dilindungi Rate Limiter
		api.GET("/dpt", handlers.ListDPT)
		api.POST("/dpt", handlers.GenerateDPT)
		api.POST("/verify-nik", handlers.VerifyNIK)
		api.POST("/admin/start", handlers.StartElection)
		api.POST("/admin/end", handlers.EndElection)
		api.GET("/admin/status", handlers.GetElectionStatus)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server listening on port %s", port)

	srv := &http.Server{
		Addr:    "127.0.0.1:" + port,
		Handler: router,
	}

	// Jalankan server di goroutine agar tidak memblokir sinyal OS
	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Gagal menjalankan server: %v", err)
		}
	}()

	// Menunggu sinyal interrupt (CTRL+C) untuk Graceful Shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Menutup server secara elegan (Graceful Shutdown)...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server dipaksa mati: ", err)
	}
	log.Println("Server berhasil dimatikan dengan aman.")
}
