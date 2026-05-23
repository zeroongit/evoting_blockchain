package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"

	"evoting_pemilu/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
	"gorm.io/gorm"
)

type NIKPayload struct {
	NIK string `json:"nik" binding:"required"`
}

func VerifyNIK(c *gin.Context) {
	var payload NIKPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "FAILED", "reason": "Format Request tidak valid"})
		return
	}

	payload.NIK = strings.TrimSpace(payload.NIK)

	// =========================================================================
	// 🟢 SIMULASI JOKI NIK (LAPIS 1: DI-LOLOSKAN KARENA NIK BELUM MEMILIH)
	// =========================================================================
	if strings.HasSuffix(payload.NIK, "999") {
		c.JSON(http.StatusOK, gin.H{
			"status":    "VALID",
			"voterName": "Simulasi Korban Joki (DPT Sah)",
			"reason":    "Lapis 1 Lolos: NIK Terdaftar di DPT & Belum Menggunakan Hak Suara.",
		})
		return
	}

	// 1. Periksa apakah NIK terdaftar di Database DPT Lokal (Untuk NIK Normal)
	var voter models.Voter
	if err := models.DB.Where("nik = ?", payload.NIK).First(&voter).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"status": "FAILED",
				"reason": "NIK tidak terdaftar dalam DPT. Silakan buat simulasi DPT terlebih dahulu.",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "FAILED",
			"reason": "Terjadi kesalahan saat memeriksa data NIK ke database",
		})
		return
	}

	// 2. Pastikan hak suara di database lokal belum digunakan
	if voter.IsUsed {
		c.JSON(http.StatusBadRequest, gin.H{
			"status": "FAILED",
			"reason": "Maaf, NIK ini sudah menggunakan hak suaranya dan tidak dapat memilih kembali!",
		})
		return
	}

	// =========================================================================
	// 🤖 AI SMART AUDITOR: STRUKTUR IDENTITAS
	// =========================================================================
	ctx := context.Background()
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		c.JSON(http.StatusOK, gin.H{"status": "VALID", "voterName": voter.FullName, "reason": "Bypass AI (API Key Kosong)"})
		return
	}

	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"status": "VALID", "voterName": voter.FullName, "reason": "Bypass AI (Gagal Init)"})
		return
	}
	defer client.Close()

	model := client.GenerativeModel("gemini-1.5-flash")
	model.ResponseMIMEType = "application/json"

	prompt := fmt.Sprintf(`Anda adalah auditor data sistem e-voting. Evaluasi NIK berikut: "%s".
	Apakah format string NIK ini masuk akal sebagai standar NIK Indonesia (16 digit angka)?
	Tolong balas dalam format JSON persis seperti ini: {"decision": "PASSED" atau "FAILED", "reason": "alasan"}`, payload.NIK)

	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"status": "VALID", "voterName": voter.FullName, "reason": "Lapis 1 Lolos (Bypass Mode)"})
		return
	}

	var aiResult map[string]string
	if len(resp.Candidates) > 0 && len(resp.Candidates[0].Content.Parts) > 0 {
		part := resp.Candidates[0].Content.Parts[0]
		if txt, ok := part.(genai.Text); ok {
			json.Unmarshal([]byte(txt), &aiResult)
		}
	}

	if aiResult["decision"] == "FAILED" {
		c.JSON(http.StatusBadRequest, gin.H{"status": "FAILED", "reason": "Audit AI Gagal: " + aiResult["reason"]})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":    "VALID",
		"voterName": voter.FullName,
		"reason":    "NIK Terverifikasi di DPT.",
	})
}