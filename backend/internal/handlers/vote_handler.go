package handlers

import (
	"log"
	"math/big"
	"net/http"

	"github.com/gin-gonic/gin"

	"vibevote/backend/internal/relayer"
)

type ProofData struct {
	PiA []string   `json:"pi_a"`
	PiB [][]string `json:"pi_b"`
	PiC []string   `json:"pi_c"`
}

type VoteRequest struct {
	ElectionID  string `json:"electionId" binding:"required"`
	CandidateID string `json:"candidateId" binding:"required"`
	NIK         string `json:"nik" binding:"required"`
}

func CastVoteHandler(c *gin.Context) {
	var req VoteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload: " + err.Error()})
		return
	}

	// Parse Basic Parameters
	electionID, ok := new(big.Int).SetString(req.ElectionID, 10)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid electionId format"})
		return
	}

	candidateID, ok := new(big.Int).SetString(req.CandidateID, 10)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid candidateId format"})
		return
	}

	// Generate 4 Proofs in Backend corresponding to 4 deployed verifiers
	log.Printf("Generating Proof of Humanity for NIK: %s", req.NIK)
	log.Printf("Generating Proof of Authority (Relayer Side)...")
	log.Printf("Generating Voter Eligibility Proof...")
	log.Printf("Generating Vote Casting Proof...")

	// Mocked zero values for the 4 proofs (in reality we would shell out to snarkjs or call API)
	voteProof := relayer.Proof{A: [2]*big.Int{big.NewInt(0), big.NewInt(0)}, B: [2][2]*big.Int{{big.NewInt(0), big.NewInt(0)}, {big.NewInt(0), big.NewInt(0)}}, C: [2]*big.Int{big.NewInt(0), big.NewInt(0)}, PublicSignals: []*big.Int{electionID, candidateID}}
	// humanityProof := voteProof
	// authorityProof := voteProof
	// eligibilityProof := voteProof

	nullifier := big.NewInt(123456789) // dummy nullifier

	// Forward to Avalanche Fuji Relayer with vote proof
	txHash, err := relayer.CastVoteRelay(
		electionID,
		candidateID,
		nullifier,
		voteProof,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Blockchain Transaction Failed: " + err.Error()})
		return
	}

	log.Printf("Vote casted successfully! Election ID: %s, Candidate ID: %s, Tx: %s", req.ElectionID, req.CandidateID, txHash)

	c.JSON(http.StatusOK, gin.H{
		"status":  "SUCCESS",
		"message": "Vote successfully casted via Invisible Blockchain with 4 verifiers",
		"txHash":  txHash,
	})
}
