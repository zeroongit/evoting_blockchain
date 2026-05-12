package models

import (
	"time"
	"gorm.io/gorm"
)

type Voter struct {
	ID         uint           `gorm:"primaryKey" json:"id"`
	NIK        string         `gorm:"uniqueIndex;type:varchar(16);not null" json:"nik"`
	FullName   string         `gorm:"type:varchar(100)" json:"full_name"`
	IsUsed     bool           `gorm:"default:false" json:"is_used"`
	IsVoterVerified  bool   `gorm:"default:false" json:"is_voter_verified"` // VoterVerifier
    IsHumanVerified  bool   `gorm:"default:false" json:"is_human_verified"` // HumanityVerifier
    IsAuthority      bool   `gorm:"default:false" json:"is_authority"`
	SuffixType string         `gorm:"type:varchar(20)" json:"suffix_type"` // normal, rejected_999, warning_888
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
}

// Function untuk menjalankan migrasi
func MigrateModels(db *gorm.DB) error {
	return db.AutoMigrate(&Voter{})
}