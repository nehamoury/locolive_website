package main
import (
	"database/sql"
	"fmt"
	_ "github.com/lib/pq"
)
func main() {
	db, _ := sql.Open("postgres", "postgresql://postgres:password@127.0.0.1:5433/privacy_social?sslmode=disable")
	defer db.Close()
	fmt.Println("Nemo:")
	var id, u string
	var g, s bool
	err := db.QueryRow("SELECT id, username, is_ghost_mode, is_shadow_banned FROM users WHERE username = 'nemo'").Scan(&id, &u, &g, &s)
	if err != nil {
		fmt.Println("Error:", err)
	} else {
		fmt.Printf("%s|%s|G:%v|S:%v\n", id, u, g, s)
	}
	fmt.Println("Latest Stories:")
	rows, _ := db.Query("SELECT user_id, count(*) FROM stories GROUP BY user_id")
	for rows.Next() {
		var uid string
		var count int
		rows.Scan(&uid, &count)
		fmt.Printf("UID:%s|Count:%d\n", uid, count)
	}
}
