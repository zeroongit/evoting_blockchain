package handlers

import (
	"fmt"
	"math/rand"
	"net/http"
	"strings"
	"time"
	"vibevote/backend/store"

	"github.com/gin-gonic/gin"
)

func ListDPT(c *gin.Context) {
	store.DPTMutex.Lock()
	defer store.DPTMutex.Unlock()
	c.JSON(http.StatusOK, gin.H{"dpt": store.DPTStore})
}

func GenerateDPT(c *gin.Context) {
	// Check CSRF token header
	csrfToken := c.GetHeader("X-CSRF-Token")
	if csrfToken != "mock-csrf-token-12345" {
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

	store.DPTMutex.Lock()
	defer store.DPTMutex.Unlock()

	// Cek apakah nama sudah digunakan
	for _, entry := range store.DPTStore {
		if strings.EqualFold(entry.Name, req.Name) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Nama sudah terdaftar dalam DPT"})
			return
		}
	}

	rnd := rand.New(rand.NewSource(time.Now().UnixNano()))
	var newNik string
	baseNik := fmt.Sprintf("%013d", rnd.Int63n(1e13)) // 13 digit acak
	
	switch req.SimulationType {
	case "fail_liveness":
		newNik = baseNik + "999"
	default:
		// Normal valid NIK (ends in a random 3 digits not 999 or 888)
		suffix := rnd.Intn(800) + 100 // 100-899
		newNik = baseNik + fmt.Sprintf("%03d", suffix)
	}

	newEntry := store.DPTEntry{
		Name: req.Name,
		NIK:  newNik,
	}

	store.DPTStore = append(store.DPTStore, newEntry)
	c.JSON(http.StatusOK, gin.H{"dpt": newEntry, "message": "Berhasil membuat DPT baru"})
}

func VerifyNIK(c *gin.Context) {
	var req struct {
		NIK string `json:"nik"`
	}
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	store.DPTMutex.Lock()
	defer store.DPTMutex.Unlock()

	// Cari NIK di DPT
	for _, entry := range store.DPTStore {
		if entry.NIK == req.NIK {
			c.JSON(http.StatusOK, gin.H{"valid": true, "name": entry.Name})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"valid": false, "error": "NIK tidak ditemukan dalam DPT"})
}
