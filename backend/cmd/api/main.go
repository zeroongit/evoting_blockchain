package main

import (

	"fmt"
	"log"
	"math/big"
	"math/rand"
	"net/http"
	"os"

	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"vibevote/backend/internal/relayer"
)

type ProofData struct {
	PiA []string   `json:"pi_a"`
	PiB [][]string `json:"pi_b"`
	PiC []string   `json:"pi_c"`
}

type VoteRequest struct {
	ElectionID    string    `json:"electionId" binding:"required"`
	CandidateID   string    `json:"candidateId" binding:"required"`
	Nullifier     string    `json:"nullifier" binding:"required"`
	Proof         ProofData `json:"proof" binding:"required"`
	PublicSignals []string  `json:"publicSignals" binding:"required"`
}

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

func parseBigIntArray(arr []string) ([2]*big.Int, error) {
	if len(arr) < 2 {
		return [2]*big.Int{}, fmt.Errorf("array length < 2")
	}
	a0, ok := new(big.Int).SetString(arr[0], 10)
	if !ok {
		return [2]*big.Int{}, fmt.Errorf("invalid number: %s", arr[0])
	}
	a1, ok := new(big.Int).SetString(arr[1], 10)
	if !ok {
		return [2]*big.Int{}, fmt.Errorf("invalid number: %s", arr[1])
	}
	return [2]*big.Int{a0, a1}, nil
}

func parseBigIntMatrix(arr [][]string) ([2][2]*big.Int, error) {
	if len(arr) < 2 || len(arr[0]) < 2 || len(arr[1]) < 2 {
		return [2][2]*big.Int{}, fmt.Errorf("matrix size < 2x2")
	}
	b00, _ := new(big.Int).SetString(arr[0][0], 10)
	b01, _ := new(big.Int).SetString(arr[0][1], 10)
	b10, _ := new(big.Int).SetString(arr[1][0], 10)
	b11, _ := new(big.Int).SetString(arr[1][1], 10)
	return [2][2]*big.Int{{b00, b01}, {b10, b11}}, nil
}

func parsePublicSignals(arr []string) ([4]*big.Int, error) {
	if len(arr) < 4 {
		return [4]*big.Int{}, fmt.Errorf("public signals length < 4")
	}
	var res [4]*big.Int
	for i := 0; i < 4; i++ {
		val, ok := new(big.Int).SetString(arr[i], 10)
		if !ok {
			return [4]*big.Int{}, fmt.Errorf("invalid number: %s", arr[i])
		}
		res[i] = val
	}
	return res, nil
}

func initDB() *gorm.DB {
	err := godotenv.Load("../.env")
	if err != nil {
		godotenv.Load(".env")
	}

	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")


	var dsn string
	if dbPassword != "" {
		dsn = fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Jakarta", dbHost, dbUser, dbPassword, dbName, dbPort)
	} else {
		dsn = fmt.Sprintf("host=%s user=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Jakarta", dbHost, dbUser, dbName, dbPort)
	}
	
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Printf("Unable to connect to database: %v\n", err)
		return nil
	}
	log.Println("Connected to PostgreSQL database successfully with GORM.")

	// Auto Migrate
	err = db.AutoMigrate(&Voter{})
	if err != nil {
		log.Printf("Failed to auto migrate database: %v\n", err)
	}

	return db
}

func generateRandomName(rng *rand.Rand) string {
	firstNames := []string{"Budi", "Siti", "Agus", "Ayu", "Joko", "Dewi", "Eko", "Rini", "Hadi", "Indah"}
	lastNames := []string{"Santoso", "Sari", "Pratama", "Lestari", "Setiawan", "Wulandari", "Kusuma", "Rahayu", "Putra", "Utami"}
	return firstNames[rng.Intn(len(firstNames))] + " " + lastNames[rng.Intn(len(lastNames))]
}

func main() {
	// Initialize Database
	db := initDB()

	r := gin.Default()

	// Endpoint untuk casting vote via Server-side Relayer
	r.POST("/api/v1/vote", func(c *gin.Context) {
		var req VoteRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload: " + err.Error()})
			return
		}

		// Parse Basic Parameters
		electionID, ok := new(big.Int).SetString(req.ElectionID, 10)
		if !ok {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid electionId format"})
			return
		}

		candidateID, ok := new(big.Int).SetString(req.CandidateID, 10)
		if !ok {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid candidateId format"})
			return
		}

		nullifier, ok := new(big.Int).SetString(req.Nullifier, 10)
		if !ok {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid nullifier format"})
			return
		}

		// Parse Proof Elements
		a, err := parseBigIntArray(req.Proof.PiA)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse pi_a: " + err.Error()})
			return
		}

		b, err := parseBigIntMatrix(req.Proof.PiB)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse pi_b: " + err.Error()})
			return
		}

		cArr, err := parseBigIntArray(req.Proof.PiC)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse pi_c: " + err.Error()})
			return
		}

		publicSignals, err := parsePublicSignals(req.PublicSignals)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse publicSignals: " + err.Error()})
			return
		}

		// Forward to Avalanche Fuji Relayer
		txHash, err := relayer.CastVoteRelay(
			electionID,
			candidateID,
			nullifier,
			a,
			b,
			cArr,
			publicSignals,
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Blockchain Transaction Failed: " + err.Error()})
			return
		}

		log.Printf("Vote casted successfully! Election ID: %s, Candidate ID: %s, Tx: %s", req.ElectionID, req.CandidateID, txHash)

		c.JSON(http.StatusOK, gin.H{
			"status":  "SUCCESS",
			"message": "Vote successfully casted via Invisible Blockchain",
			"txHash":  txHash,
		})
	})

	// GET /api/v1/voters - Menampilkan daftar DPT dari database
	r.GET("/api/v1/voters", func(c *gin.Context) {
		if db == nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database not initialized"})
			return
		}

		var voters []Voter
		if err := db.Order("created_at desc").Find(&voters).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch voters"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Success", "data": voters})
	})

	// POST /api/v1/generate-dpt - Generate DPT dummy baru
	r.POST("/api/v1/generate-dpt", func(c *gin.Context) {
		if db == nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database not initialized"})
			return
		}

		rng := rand.New(rand.NewSource(time.Now().UnixNano()))
		
		// Generate 5 random voters
		var generated []Voter
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
			db.Model(&Voter{}).Where("nik = ?", nik).Count(&count)
			if count > 0 {
				continue
			}

			voter := Voter{
				NIK:        nik,
				FullName:   generateRandomName(rng),
				IsUsed:     false,
				SuffixType: suffixType,
			}
			
			db.Create(&voter)
			generated = append(generated, voter)
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Successfully generated random DPT",
			"count": len(generated),
			"data": generated,
		})
	})

	// GET /api/v1/results - Menampilkan hasil vote dummy
	r.GET("/api/v1/results", func(c *gin.Context) {
		dummyResults := []gin.H{
			{"candidateId": "1", "candidateName": "Kandidat A", "votes": 120},
			{"candidateId": "2", "candidateName": "Kandidat B", "votes": 95},
			{"candidateId": "3", "candidateName": "Kandidat C", "votes": 150},
		}
		c.JSON(http.StatusOK, gin.H{"message": "Success", "data": dummyResults})
	})

	// GET /api/v1/admin/voters - Admin endpoint untuk manage voters
	r.GET("/api/v1/admin/voters", func(c *gin.Context) {
		if db == nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database not initialized"})
			return
		}

		var voters []Voter
		if err := db.Order("created_at desc").Find(&voters).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch voters"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Admin Success", "data": voters})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("VibeVote Golang Relayer starting on port %s", port)
	r.Run(":" + port)
}
