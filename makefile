.PHONY: build clean

BINARY_NAME=inventories

build:
	go build -ldflags="-X main.ReleaseMode=false" -o dist/${BINARY_NAME} ./src/server/

run: build
	dist/${BINARY_NAME}

prod:
	go env -w CGO_ENABLED=0
	@echo 'Bundling steam inventories'
	rollup -c --environment BUILD:production
	@echo 'Building go app'
	go build -o dist/${BINARY_NAME} ./src/server/

clean:
	go clean
