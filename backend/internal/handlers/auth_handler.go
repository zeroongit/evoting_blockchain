package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func GenerateCSRF(c *gin.Context) {
	// In a real app, generate a secure random token and store it in a session/cookie
	c.JSON(http.StatusOK, gin.H{"csrfToken": "mock-csrf-token-12345"})
}

func VerifyFace(c *gin.Context) {
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
