package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

// Menyimpan limiter untuk setiap alamat IP
var visitors = make(map[string]*rate.Limiter)
var mu sync.Mutex

// Membersihkan map secara berkala agar tidak terjadi memory leak
func init() {
	go func() {
		for {
			time.Sleep(1 * time.Hour)
			mu.Lock()
			visitors = make(map[string]*rate.Limiter)
			mu.Unlock()
		}
	}()
}

func getVisitor(ip string) *rate.Limiter {
	mu.Lock()
	defer mu.Unlock()

	limiter, exists := visitors[ip]
	if !exists {
		// Limit: 2 request per detik, maksimal burst 5 request
		limiter = rate.NewLimiter(2, 5)
		visitors[ip] = limiter
	}
	return limiter
}

// RateLimiter adalah middleware Gin untuk membatasi request per IP
func RateLimiter() gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()
		limiter := getVisitor(ip)
		if !limiter.Allow() {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"status": "FAILED",
				"error":  "Terlalu banyak permintaan. Silakan coba beberapa saat lagi.",
			})
			c.Abort()
			return
		}
		c.Next()
	}
}
