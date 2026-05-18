package main

import (
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"os"
	"sync"
	"time"
	"vibevote/backend/internal/relayer"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

var (

	dptStore = []string{"1234567890123456", "9876543210987654"}
	dptMutex sync.Mutex
)

func main() {
	if err := godotenv.Load("../../.env"); err != nil {
		log.Println("No .env file found or error reading it")
	}

	router := gin.Default()

	// CORS or simple middleware can be added here
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	api := router.Group("/api/v1")
	{
		api.GET("/csrf-token", generateCSRF)
		api.POST("/verify-face", verifyFace) // Gemini Vision API Stub
		api.POST("/vote", submitVote)
		api.GET("/dpt", listDPT)
		api.POST("/dpt", generateDPT)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server listening on port %s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatal("Failed to start server: ", err)
	}
}

// Stubs for handlers
func generateCSRF(c *gin.Context) {
	// In a real app, generate a secure random token and store it in a session/cookie
	c.JSON(http.StatusOK, gin.H{"csrfToken": "mock-csrf-token-12345"})
}

func verifyFace(c *gin.Context) {
	// Integrasi Gemini Vision API - auto pass di frontend tapi logika fallback disini
	var req struct {
		NIK   string `json:"nik"`
		Image string `json:"image"` // Base64
	}
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Simulasi gagal untuk NIK berakhiran 999
	if len(req.NIK) > 3 && req.NIK[len(req.NIK)-3:] == "999" {
		c.JSON(http.StatusUnauthorized, gin.H{"verified": false, "reason": "Liveness check failed."})
		return
	}

	c.JSON(http.StatusOK, gin.H{"verified": true, "reason": "Humanity verified."})
}

func submitVote(c *gin.Context) {
	// Check CSRF token header
	csrfToken := c.GetHeader("X-CSRF-Token")
	if csrfToken != "mock-csrf-token-12345" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Invalid CSRF token"})
		return
	}

	var req struct {
		CandidateID int    `json:"candidateId"`
		NIK         string `json:"nik"`
	}
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// 1. DI SINI PROSES ZK PROOF BERJALAN (DI BACKEND)
	// Sesuai aturan: "Pindahkan proses penghasilan proof dari client-side ke backend Go 
	// untuk performa maksimal pada perangkat lansia."
	log.Printf("Generating ZK Proof for NIK: %s, Candidate: %d", req.NIK, req.CandidateID)
	// time.Sleep(2 * time.Second) // Simulasi kalkulasi ZK
	
	// 2. DI SINI KOMUNIKASI WALLET TERJADI (MENGGUNAKAN RELAYER)
	avaxRelayer, err := relayer.NewAvalancheRelayer()
	if err != nil {
		log.Printf("Relayer error: %v", err)
	} else {
		log.Printf("Relayer is ready. Executing via Go-Ethereum to EVoting Contract...")
	}
	
	// 3. Eksekusi TX melalui relayer.Client dan auth dari relayer.BuildTransactOpts
	// tx, err := evoting.CastVote(auth, big.NewInt(req.CandidateId), nullifierHash, proof)

	c.JSON(http.StatusOK, gin.H{
		"txHash": "0xabc123...mockhash", 
		"status": "success",
		"message": "Transaksi berhasil dikirim oleh Relayer Server",
	})
}

func listDPT(c *gin.Context) {
	dptMutex.Lock()
	defer dptMutex.Unlock()
	c.JSON(http.StatusOK, gin.H{"dpt": dptStore})
}

func generateDPT(c *gin.Context) {
	dptMutex.Lock()
	defer dptMutex.Unlock()

	// Generate random 16 digit NIK
	rnd := rand.New(rand.NewSource(time.Now().UnixNano()))
	newNik := fmt.Sprintf("%016d", rnd.Int63n(1e16))

	dptStore = append(dptStore, newNik)
	c.JSON(http.StatusOK, gin.H{"nik": newNik, "message": "Berhasil membuat DPT baru"})
}
