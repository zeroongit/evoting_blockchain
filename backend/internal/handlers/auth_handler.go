package handlers

import (
	"crypto/rand"
	"encoding/hex"
	"net/http"

	"github.com/gin-gonic/gin"
)

var validCSRFTokens = make(map[string]bool)

func GenerateCSRF(c *gin.Context) {
	bytes := make([]byte, 16)
	if _, err := rand.Read(bytes); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}
	token := hex.EncodeToString(bytes)
	validCSRFTokens[token] = true
	c.JSON(http.StatusOK, gin.H{"csrfToken": token})
}
