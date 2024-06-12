// handlers.go
package main

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
)

// 記録したスコアを送信
func submitScore(c *gin.Context, db *sql.DB) {
	var json struct {
		PlayerName string
		Score      int
		PlayDate   string
	}

	if c.BindJSON(&json) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON data"})
		return
	}

	_, err := db.Exec("INSERT INTO Scores (PlayerName, Score, PlayDate) VALUES (?, ?, ?)", json.PlayerName, json.Score, json.PlayDate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success"})
}

// スコアをDBから取ってくる
func getTopScores(c *gin.Context, db *sql.DB) {
	rows, err := db.Query("SELECT PlayerName, Score, PlayDate FROM Scores ORDER BY Score DESC LIMIT 10")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error", "details": err.Error()})
		return
	}
	defer rows.Close()

	var scores []struct {
		PlayerName string
		Score      int
		PlayDate   string
	}

	for rows.Next() {
		var score struct {
			PlayerName string
			Score      int
			PlayDate   string
		}
		if err := rows.Scan(&score.PlayerName, &score.Score, &score.PlayDate); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error", "details": err.Error()})
			return
		}
		scores = append(scores, score)
	}

	c.JSON(http.StatusOK, scores)
}
