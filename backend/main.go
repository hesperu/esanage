package main

import (
	"log"
)

func main() {
	db := InitDB()
	defer db.Close()

	router := SetupRouter(db)
	log.Fatal(router.Run(":8080"))
}
