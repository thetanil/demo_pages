all: install build deploy

install:
	@echo "Installing dependencies..."
	@npm install

build:
	@echo "Building..."
	@npm run build

deploy:
	@echo "Deploying..."
	mkdir -p ../build/pixi_gol2
	cp -r dist/* ../build/pixi_gol2/