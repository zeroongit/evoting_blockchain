package handlers

import (
	"evoting_pemilu/internal/models"
	"fmt"
	"math/rand"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func ListDPT(c *gin.Context) {
	var voters []models.Voter
	if err := models.DB.Order("created_at desc").Find(&voters).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data DPT dari database"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"dpt": voters})
}

func GenerateDPT(c *gin.Context) {
	// Check CSRF token header
	csrfToken := c.GetHeader("X-CSRF-Token")
	if !validCSRFTokens[csrfToken] {
		c.JSON(http.StatusForbidden, gin.H{"error": "Invalid CSRF token"})
		return
	}

	var req struct {
		Name           string `json:"name"`
		SimulationType string `json:"simulationType"` // "valid", "fail_liveness"
	}
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	req.Name = strings.TrimSpace(req.Name)
	if req.Name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nama tidak boleh kosong"})
		return
	}

	// Cek apakah nama sudah digunakan di database (case-insensitive)
	var existingVoter models.Voter
	result := models.DB.Where("LOWER(full_name) = LOWER(?)", req.Name).First(&existingVoter)
	if result.Error == nil {
		// Jika tidak ada error, berarti data ditemukan
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nama sudah terdaftar dalam DPT"})
		return
	}
	if result.Error != gorm.ErrRecordNotFound {
		// Handle error database selain "tidak ditemukan"
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memverifikasi nama di database"})
		return
	}

	rnd := rand.New(rand.NewSource(time.Now().UnixNano()))
	var newNik string
	baseNik := fmt.Sprintf("%013d", rnd.Int63n(1e13))

	simulationType := "normal" // default
	switch req.SimulationType {
	case "fail_liveness":
		newNik = baseNik + "999"
		simulationType = "rejected_999"
	default:
		suffix := rnd.Intn(800) + 100 // 100-899
		newNik = baseNik + fmt.Sprintf("%03d", suffix)
	}

	newVoter := models.Voter{
		FullName:   req.Name,
		NIK:        newNik,
		SuffixType: simulationType, // Simpan tipe simulasi ke DB
	}

	if err := models.DB.Create(&newVoter).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan DPT baru ke database"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "SUCCESS", "dpt": newVoter, "message": "Berhasil membuat DPT baru"})
}
