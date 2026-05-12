package handlers

import (
	"fmt"
	"math/rand"
	"time"
	"vibevote/backend/internal/models"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type VoterHandler struct {
	DB *gorm.DB
}

func (h *VoterHandler) GetVoters(c *fiber.Ctx) error {
	var voters []models.Voter
	h.DB.Find(&voters)
	return c.JSON(voters)
}

func (h *VoterHandler) GenerateDPT(c *fiber.Ctx) error {
	// Hapus data lama jika ingin reset
	h.DB.Exec("DELETE FROM voters")

	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	var newVoters []models.Voter

	for i := 0; i < 15; i++ {
		prefix := "3173" // Jakarta Barat
		randomDigits := fmt.Sprintf("%09d", r.Int63n(1000000000))
		suffix := fmt.Sprintf("%03d", r.Intn(1000))
		suffixType := "normal"

		// Inject data khusus untuk testing
		if i == 0 {
			suffix = "999"
			suffixType = "rejected_999"
		} else if i == 1 {
			suffix = "888"
			suffixType = "warning_888"
		}

		newVoters = append(newVoters, models.Voter{
			NIK:        prefix + randomDigits + suffix,
			FullName:   fmt.Sprintf("Dummy Voter %d", i+1),
			SuffixType: suffixType,
			IsUsed:     false,
		})
	}

	h.DB.Create(&newVoters)
	return c.JSON(fiber.Map{"message": "DPT Berhasil di-generate", "count": len(newVoters)})
}
