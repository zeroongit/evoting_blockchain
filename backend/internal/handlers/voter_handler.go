package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// GlobalDB merujuk ke koneksi GORM PostgreSQL/Supabase Anda.
// Pastikan untuk mengisinya dari main.go saat inisialisasi aplikasi.
// Contoh: handlers.GlobalDB = dbInstance
var GlobalDB *gorm.DB

type MarkVotedRequest struct {
	VoterID string `json:"voter_id" binding:"required"`
}

// MarkVotedHandler menangani update status has_voted pemilih di Supabase
func MarkVotedHandler(c *gin.Context) {
	var req MarkVotedRequest

	// 1. Membaca request body JSON "voter_id"
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format request tidak valid. Parameter 'voter_id' dibutuhkan."})
		return
	}

	if GlobalDB == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Koneksi database (Supabase) belum terhubung ke handler."})
		return
	}

	// 2. Melakukan update baris data pada tabel 'voters' (kolom is_used)
	// Asumsi kolom penanda identitas NIK bernama 'nik' dan kolom status bernama 'is_used'
	result := GlobalDB.Table("voters").Where("nik = ?", req.VoterID).Update("is_used", true)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Terjadi kesalahan saat memperbarui database Supabase."})
		return
	}

	// 3. Mengembalikan respons JSON sukses
	c.JSON(http.StatusOK, gin.H{
		"message": "Status voting berhasil diperbarui",
	})
}

type VerifyStatusRequest struct {
	VoterID            string `json:"voter_id" binding:"required"`
	IsVoterVerified    bool   `json:"is_voter_verified"`
	IsHumanityVerified bool   `json:"is_humanity_verified"`
}

// VerifyStatusHandler menangani update status verifikasi pemilih di Supabase
func VerifyStatusHandler(c *gin.Context) {
	var req VerifyStatusRequest

	// 1. Membaca request body JSON
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format request tidak valid. Parameter 'voter_id' dibutuhkan."})
		return
	}

	if GlobalDB == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Koneksi database (Supabase) belum terhubung ke handler."})
		return
	}

	// 2. Melakukan update multiple kolom pada tabel 'voters' berdasarkan NIK
	result := GlobalDB.Table("voters").Where("nik = ?", req.VoterID).Updates(map[string]interface{}{
		"is_voter_verified": req.IsVoterVerified,
		"is_human_verified": req.IsHumanityVerified,
	})

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Terjadi kesalahan saat memperbarui database Supabase."})
		return
	}

	// 3. Mengembalikan respons JSON sukses
	c.JSON(http.StatusOK, gin.H{
		"message": "Status verifikasi berhasil diperbarui",
	})
}
