package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"
)

func main() {
	dbSource := "postgresql://postgres:password@127.0.0.1:5433/privacy_social?sslmode=disable"
	db, err := sql.Open("postgres", dbSource)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	res, err := db.Exec("UPDATE users SET role = 'admin' WHERE username = 'sara'")
	if err != nil {
		log.Fatal(err)
	}
	rows, _ := res.RowsAffected()
	fmt.Printf("Updated %d users to admin\n", rows)
}
