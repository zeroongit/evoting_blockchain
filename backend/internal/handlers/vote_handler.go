package handlers

import (
	"context"
	"fmt"
	"math/big"
	"net/http"
	"os"
	"strings"

	"evoting_pemilu/internal/relayer"

	"github.com/gin-gonic/gin"
	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

// Samakan dengan struct yang dikirim Next.js
type VotePayload struct {
	NIK           string       `json:"nik"`
	ElectionID    string       `json:"electionId"`
	CandidateID   string       `json:"candidateId"`
	Nullifier     string       `json:"nullifier"`
	ProofA        [2]string    `json:"proofA"`
	ProofB        [2][2]string `json:"proofB"`
	ProofC        [2]string    `json:"proofC"`
	PublicSignals []string     `json:"publicSignals"`
}

// parseBigInt mengubah string dari frontend menjadi format matematika EVM
func parseBigInt(val string) *big.Int {
	val = strings.TrimSpace(val)
	n := new(big.Int)
	var ok bool

	if strings.HasPrefix(val, "0x") {
		// Jika secara eksplisit menggunakan prefix 0x, parse sebagai hexadecimal
		n, ok = n.SetString(strings.TrimPrefix(val, "0x"), 16)
	} else {
		// SnarkJS secara default menghasilkan string dalam format basis 10 (desimal)
		n, ok = n.SetString(val, 10)
	}

	if !ok || n == nil {
		n = big.NewInt(0)
	}
	return n
}

func SubmitVote(c *gin.Context) {
	// =========================================================================
	// 🔐 SIMULASI ZK-SNARKs (SERVER-SIDE PROVING / MOCK PAYLOAD)
	// =========================================================================
	// Untuk keperluan demonstrasi (vibe coding), pembuatan Zero-Knowledge Proof
	// (ZK-Proof) disimulasikan di sisi server/frontend untuk kemudahan integrasi.
	//
	// 🚀 TARGET PRODUCTION:
	// Proses Proving WAJIB dilakukan secara Client-Side (WASM di browser atau
	// Secure Enclave/TEE di smartphone). Hal ini menjamin NIK mentah dan pilihan
	// kandidat (clear text) TIDAK PERNAH dikirim ke server. Server hanya menerima
	// bukti matematisnya saja.
	// (Referensi: PRODUCTION_READY.md - Poin 5)
	// =========================================================================
	var payload VotePayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "FAILED", "reason": "Format JSON Request tidak valid"})
		return
	}

	// =========================================================================
	// Saat ini, Gemini AI bertindak sebagai auditor statis yang memastikan
	// format JSON (Proof & Public Signals) layak diteruskan ke blockchain.
	//
	// 🚀 TARGET PRODUCTION:
	// Peran AI akan ditingkatkan menjadi "Deep Anomaly Detection" dan RAG
	// (Retrieval-Augmented Generation) berbasis hukum tata negara.
	// AI akan membaca on-chain data secara real-time dan memblokir anomali
	// (misal: 10.000 Proof diajukan dari 1 rentang IP dalam hitungan detik)
	// untuk memastikan relayer tidak menyuntikkan malicious payload.
	// (Referensi: PRODUCTION_READY.md - Poin 2)
	// =========================================================================
	// 2. Panggil Gemini API sebagai Smart Auditor
	ctx := context.Background()
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "FAILED", "reason": "GEMINI_API_KEY belum dikonfigurasi di file .env backend"})
		return
	}

	aiClient, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "FAILED", "reason": "Gagal inisialisasi AI Auditor"})
		return
	}
	defer aiClient.Close()

	model := aiClient.GenerativeModel("gemini-1.5-flash")

	// Set mode agar Gemini wajib merespon dengan format JSON
	model.ResponseMIMEType = "application/json"

	prompt := fmt.Sprintf(`
		Anda adalah auditor sistem e-voting. 
		Evaluasi struktur proof ZK berikut untuk memastikan format teksnya tidak kosong:
		- ProofA: %v
		- ProofB: %v
		- ProofC: %v

		Tolong balas dalam format JSON persis seperti ini, tanpa markdown:
		{"decision": "PASSED", "reason": "alasan"}
	`, payload.ProofA, payload.ProofB, payload.ProofC)

	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		var pubSignals []*big.Int
		for _, ps := range payload.PublicSignals {
			pubSignals = append(pubSignals, parseBigInt(ps))
		}

		// Jika Gemini timeout (Bypass mode), tetap kirim langsung ke Blockchain Avalanche
		voteProof := relayer.Proof{
			A:             [2]*big.Int{parseBigInt(payload.ProofA[0]), parseBigInt(payload.ProofA[1])},
			B:             [2][2]*big.Int{{parseBigInt(payload.ProofB[0][0]), parseBigInt(payload.ProofB[0][1])}, {parseBigInt(payload.ProofB[1][0]), parseBigInt(payload.ProofB[1][1])}},
			C:             [2]*big.Int{parseBigInt(payload.ProofC[0]), parseBigInt(payload.ProofC[1])},
			PublicSignals: pubSignals,
		}
		txHash, relayerErr := relayer.CastVoteRelay(parseBigInt(payload.ElectionID), parseBigInt(payload.CandidateID), parseBigInt(payload.Nullifier), voteProof)
		if relayerErr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"status": "FAILED", "reason": "Relayer Avalanche Gagal: " + relayerErr.Error()})
			return
		}

		// Jika Gemini limit / down, kita loloskan dengan warning demi kelancaran demo (Bypass Mode)
		c.JSON(http.StatusOK, gin.H{
			"status":      "SUCCESS",
			"message":     "AI Auditor timeout. Transaksi tetap dieksekusi di Blockchain!",
			"txHash":      txHash,
			"ai_analysis": fmt.Sprintf("Error API Gemini: %v", err),
		})
		return
	}

	// Ambil response text dari Gemini
	aiResultText := ""
	if len(resp.Candidates) > 0 && resp.Candidates[0].Content != nil {
		for _, part := range resp.Candidates[0].Content.Parts {
			aiResultText += fmt.Sprintf("%v", part)
		}
	} else {
		aiResultText = `{"decision": "PASSED", "reason": "AI response empty or filtered"}`
	}

	// 3. Kirim balik hasil JSON ke Next.js agar tidak memicu "Invalid JSON response"
	c.Header("Content-Type", "application/json")

	if strings.Contains(aiResultText, `"PASSED"`) {
		var pubSignals []*big.Int
		for _, ps := range payload.PublicSignals {
			pubSignals = append(pubSignals, parseBigInt(ps))
		}

		// Siapkan data ZK Proof untuk dieksekusi Relayer
		voteProof := relayer.Proof{
			A:             [2]*big.Int{parseBigInt(payload.ProofA[0]), parseBigInt(payload.ProofA[1])},
			B:             [2][2]*big.Int{{parseBigInt(payload.ProofB[0][0]), parseBigInt(payload.ProofB[0][1])}, {parseBigInt(payload.ProofB[1][0]), parseBigInt(payload.ProofB[1][1])}},
			C:             [2]*big.Int{parseBigInt(payload.ProofC[0]), parseBigInt(payload.ProofC[1])},
			PublicSignals: pubSignals,
		}

		// Panggil Relayer untuk mengirim transaksi ke Blockchain Avalanche!
		txHash, err := relayer.CastVoteRelay(parseBigInt(payload.ElectionID), parseBigInt(payload.CandidateID), parseBigInt(payload.Nullifier), voteProof)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"status": "FAILED", "message": "Transaksi Blockchain Gagal (Revert/Error)", "error": err.Error(), "ai_analysis": aiResultText})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"status":      "SUCCESS",
			"message":     "Lolos AI Auditor. Suara berhasil dimasukkan ke Avalanche Fuji!",
			"txHash":      txHash,
			"ai_analysis": aiResultText,
		})
	} else {
		c.JSON(http.StatusUnprocessableEntity, gin.H{
			"status":      "FAILED",
			"message":     "Ditolak oleh AI Smart Auditor",
			"ai_analysis": aiResultText,
		})
	}
}
