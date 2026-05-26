package models

import (
	"fmt"
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() *gorm.DB {
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

	db, err := gorm.Open(postgres.New(postgres.Config{
		DSN:                  dsn,
		PreferSimpleProtocol: true, // Mencegah error prepared statement (SQLSTATE 42P05) pada Postgres / Supabase
	}), &gorm.Config{})
	if err != nil {
		log.Printf("Unable to connect to database: %v\n", err)
		return nil
	}
	log.Println("Connected to PostgreSQL database successfully with GORM.")

	// Auto Migrate
	err = db.AutoMigrate(&Voter{})
	if err != nil {
		log.Printf("Peringatan: Gagal melakukan auto migrate (bisa diabaikan jika tabel sudah ada): %v\n", err)
	} else {
		log.Println("Database migration completed.")
	}

	DB = db
	return db
}
