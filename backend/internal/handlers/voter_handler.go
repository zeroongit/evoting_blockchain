package handlers

import (
	"fmt"
	"math/rand"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"vibevote/backend/internal/models"
)

func GetVotersHandler(c *gin.Context) {
	if models.DB == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database not initialized"})
		return
	}

	var voters []models.Voter
	if err := models.DB.Order("created_at desc").Find(&voters).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch voters"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Success", "data": voters})
}

func generateRandomName(rng *rand.Rand) string {
	firstNames := []string{"Budi", "Siti", "Agus", "Ayu", "Joko", "Dewi", "Eko", "Rini", "Hadi", "Indah", "tuti", "brian", "muhammad"}
	lastNames := []string{"Santoso", "Sari", "Pratama", "Lestari", "Setiawan", "Wulandari", "Kusuma", "Rahayu", "Putra", "Utami", "rahayu", "putri"}
	return firstNames[rng.Intn(len(firstNames))] + " " + lastNames[rng.Intn(len(lastNames))]
}

func GenerateDPTHandler(c *gin.Context) {
	if models.DB == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database not initialized"})
		return
	}

	rng := rand.New(rand.NewSource(time.Now().UnixNano()))

	var generated []models.Voter
	for i := 0; i < 5; i++ {
		// Provinsi (2) + Kota/Kab (2) + Kec (2) + Tgl Lahir (6) + Urut (4)
		// Contoh: 31 71 01 010180 0001
		baseNIK := fmt.Sprintf("317101%02d%02d%02d", rng.Intn(28)+1, rng.Intn(12)+1, rng.Intn(50)+50)
		urut := rng.Intn(900) + 1

		suffixType := "normal"
		suffix := fmt.Sprintf("%04d", urut)

		// Randomly assign special suffix for testing
		prob := rng.Float32()
		if prob < 0.2 {
			suffix = "0999"
			suffixType = "rejected_999"
		} else if prob < 0.4 {
			suffix = "0888"
			suffixType = "warning_888"
		}

		nik := baseNIK + suffix

		// If already exists, skip
		var count int64
		models.DB.Model(&models.Voter{}).Where("nik = ?", nik).Count(&count)
		if count > 0 {
			continue
		}

		voter := models.Voter{
			NIK:        nik,
			FullName:   generateRandomName(rng),
			IsUsed:     false,
			SuffixType: suffixType,
		}

		models.DB.Create(&voter)
		generated = append(generated, voter)
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Successfully generated random DPT",
		"count":   len(generated),
		"data":    generated,
	})
}
