package main

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	_ "github.com/lib/pq"
)

func main() {
	dbSource := "postgresql://postgres:password@127.0.0.1:5433/privacy_social?sslmode=disable"
	db, err := sql.Open("postgres", dbSource)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	fmt.Println("--- USERS ---")
	rows, err := db.Query("SELECT id, username, email, is_ghost_mode, is_shadow_banned, role FROM users")
	if err != nil {
		log.Fatal(err)
	}
	for rows.Next() {
		var id, username, email, role string
		var ghost, shadow bool
		rows.Scan(&id, &username, &email, &ghost, &shadow, &role)
		fmt.Printf("ID: %s | Username: %s | Email: %s | Ghost: %v | Shadow: %v | Role: %s\n", id, username, email, ghost, shadow, role)
	}
	rows.Close()

	fmt.Println("\n--- ACTIVE STORIES ---")
	rows, err = db.Query("SELECT id, user_id, expires_at, created_at, lat, lng FROM (SELECT s.id, s.user_id, s.expires_at, s.created_at, ST_Y(s.geom::geometry) as lat, ST_X(s.geom::geometry) as lng FROM stories s) s WHERE expires_at > now()")
	if err != nil {
		log.Fatal(err)
	}
	for rows.Next() {
		var id, userID string
		var expiresAt, createdAt time.Time
		var lat, lng float64
		rows.Scan(&id, &userID, &expiresAt, &createdAt, &lat, &lng)
		fmt.Printf("ID: %s | UserID: %s | CreatedAt: %s | ExpiresAt: %s | Lat: %f | Lng: %f\n", id, userID, createdAt, expiresAt, lat, lng)
	}
	rows.Close()

	fmt.Println("\n--- POSTS ---")
	rows, err = db.Query("SELECT id, user_id, media_url, media_type, caption, created_at FROM posts ORDER BY created_at DESC")
	if err != nil {
		log.Printf("Query error for posts: %v", err)
	} else {
		for rows.Next() {
			var id, userID, mediaUrl, mediaType string
			var caption sql.NullString
			var createdAt time.Time
			rows.Scan(&id, &userID, &mediaUrl, &mediaType, &caption, &createdAt)
			fmt.Printf("ID: %s | UserID: %s | Type: %s | Caption: %s | CreatedAt: %s\n", id, userID, mediaType, caption.String, createdAt)
		}
		rows.Close()
	}
}
