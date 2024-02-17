all: install build deploy

install:
	@echo "Installing dependencies..."
	@npm install

build:
	@echo "Building..."
	@npm run build

deploy:
	@echo "Deploying..."
	cp -r dist/* ../build/pixi/