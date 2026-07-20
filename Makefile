.PHONY: help install dev build lint clean

help:
	@echo "💬 RAG SaaS Starter - Developer Experience"
	@echo "----------------------------------------"
	@echo "Available commands:"
	@echo "  make install    - Install Node.js dependencies (npm install)"
	@echo "  make dev        - Start the Next.js development server"
	@echo "  make build      - Build the Next.js app for production"
	@echo "  make lint       - Run ESLint to ensure TypeScript/RTL code quality"
	@echo "  make clean      - Remove node_modules and .next build cache"

install:
	@echo "Installing dependencies..."
	npm install

dev:
	@echo "Starting Next.js development server..."
	npm run dev

build:
	@echo "Building for production..."
	npm run build

lint:
	@echo "Linting TypeScript and UI components..."
	npm run lint

clean:
	@echo "Cleaning up project..."
	rm -rf node_modules/ .next/
