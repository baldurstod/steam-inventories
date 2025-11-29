package main

type Config struct {
	HTTPS `json:"https"`
}

type HTTPS struct {
	Port          int    `json:"port"`
	HttpsKeyFile  string `json:"https_key_file"`
	HttpsCertFile string `json:"https_cert_file"`
}
