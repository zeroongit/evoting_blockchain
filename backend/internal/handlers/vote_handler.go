package handlers

import (
	"log"
	"math/big"
	"net/http"
	"time"
	"vibevote/backend/internal/relayer"

	"github.com/gin-gonic/gin"
)

func SubmitVote(c *gin.Context) {
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
	log.Printf("Generating ZK Proof for NIK: %s, Candidate: %d", req.NIK, req.CandidateID)
	// time.Sleep(2 * time.Second) // Simulasi kalkulasi ZK
	
	// 2. DI SINI KOMUNIKASI WALLET TERJADI (MENGGUNAKAN RELAYER)
	voteProof := relayer.Proof{} // Mock proof for now
	txHash, err := relayer.CastVoteRelay(
		big.NewInt(0),
		big.NewInt(int64(req.CandidateID)),
		big.NewInt(time.Now().UnixNano()), // Dummy nullifier
		voteProof,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"txHash": txHash, 
		"status": "success",
		"message": "Transaksi berhasil dikirim oleh Relayer Server",
	})
}
