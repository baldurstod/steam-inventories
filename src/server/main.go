package main

import (
	"encoding/json"
	"log"
	"os"
)

var ReleaseMode = "true"

func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	config := Config{}

	var content []byte
	var err error

	if content, err = os.ReadFile("config.json"); err != nil {
		log.Println("Error while reading configuration file", err)
		return
	}
	if err = json.Unmarshal(content, &config); err != nil {
		log.Println("Error while reading configuration", err)
		return
	}

	startServer(config)
}
