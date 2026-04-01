package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

func main() {
	dbUrl := os.Getenv("DB_SOURCE")
	if dbUrl == "" {
		dbUrl = "postgresql://postgres:password@localhost:5432/privacy_social?sslmode=disable"
	}

	db, err := sql.Open("postgres", dbUrl)
	if err != nil {
		log.Fatalf("failed to open db: %v", err)
	}
	defer db.Close()

	var count int
	err = db.QueryRow("SELECT COUNT(*) FROM stories").Scan(&count)
	if err != nil {
		log.Fatalf("failed to count stories: %v", err)
	}
	fmt.Printf("Total stories: %d\n", count)

	var activeCount int
	err = db.QueryRow("SELECT COUNT(*) FROM stories WHERE expires_at > now()").Scan(&activeCount)
	if err != nil {
		log.Fatalf("failed to count active stories: %v", err)
	}
	fmt.Printf("Total active stories: %d\n", activeCount)

	rows, err := db.Query("SELECT id, user_id, ST_Y(geom::geometry) as lat, ST_X(geom::geometry) as lng FROM stories WHERE expires_at > now() LIMIT 5")
	if err == nil {
		fmt.Println("Active stories sample:")
		for rows.Next() {
			var id, userId string
			var lat, lng float64
			rows.Scan(&id, &userId, &lat, &lng)
			fmt.Printf("- Story %s by User %s at [%f, %f]\n", id, userId, lat, lng)
		}
		rows.Close()
	} else {
		fmt.Printf("Error querying stories: %v\n", err)
	}
}
