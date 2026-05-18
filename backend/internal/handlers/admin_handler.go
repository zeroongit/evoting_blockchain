package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"vibevote/backend/internal/models"
)

func GetAdminVotersHandler(c *gin.Context) {
	if models.DB == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database not initialized"})
		return
	}

	var voters []models.Voter
	if err := models.DB.Order("created_at desc").Find(&voters).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch voters"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Admin Success", "data": voters})
}
