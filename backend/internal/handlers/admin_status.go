package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// IsVotingActive menyimpan status voting secara in-memory untuk purwarupa
var IsVotingActive bool = false

func GetElectionStatus(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"votingActive": IsVotingActive})
}
