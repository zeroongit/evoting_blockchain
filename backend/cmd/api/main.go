package main

import (
	"log"
	"os"
	"vibevote/backend/internal/handlers"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load("../../.env.example"); err != nil {
		log.Println("No .env.example file found or error reading it")
	}

	router := gin.Default()

	// CORS or simple middleware can be added here
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	api := router.Group("/api/v1")
	{
		api.GET("/csrf-token", handlers.GenerateCSRF)
		api.POST("/verify-face", handlers.VerifyFace) // Gemini Vision API Stub
		api.POST("/vote", handlers.SubmitVote)
		api.GET("/dpt", handlers.ListDPT)
		api.POST("/dpt", handlers.GenerateDPT)
		api.POST("/verify-nik", handlers.VerifyNIK)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server listening on port %s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatal("Failed to start server: ", err)
	}
}