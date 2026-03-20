.PHONY: help setup dev start docker-up docker-down install clean logs

# Colors
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
NC := \033[0m # No Color

help:
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo "$(BLUE)  Divergent College - Available Commands$(NC)"
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo ""
	@echo "$(GREEN)Setup & Run:$(NC)"
	@echo "  make setup            Setup and run everything (one command!)"
	@echo "  make dev              Start dev servers (requires docker to be running)"
	@echo ""
	@echo "$(GREEN)Installation:$(NC)"
	@echo "  make install          Install dependencies only"
	@echo ""
	@echo "$(GREEN)Docker:$(NC)"
	@echo "  make docker-up        Start PostgreSQL and Redis"
	@echo "  make docker-down      Stop PostgreSQL and Redis"
	@echo "  make logs             View Docker logs"
	@echo ""
	@echo "$(GREEN)Development:$(NC)"
	@echo "  make start-backend    Start backend dev server only"
	@echo "  make start-frontend   Start frontend dev server only"
	@echo "  make clean            Remove node_modules and dist"
	@echo ""

setup: install
	@echo "$(YELLOW)Setting up environment files...$(NC)"
	@npm run setup:env
	@echo "$(YELLOW)Starting Docker services...$(NC)"
	@npm run docker:up
	@sleep 5
	@echo "$(GREEN)✓ Setup complete! Starting application...$(NC)"
	@npm run start:all

dev: docker-up
	@echo "$(GREEN)Starting development servers...$(NC)"
	@npm run start:all

start-backend:
	@cd backend && npm run dev

start-frontend:
	@cd frontend && npm run dev

install:
	@echo "$(YELLOW)Installing dependencies...$(NC)"
	@npm install

docker-up:
	@echo "$(YELLOW)Starting Docker services...$(NC)"
	@docker-compose up -d
	@sleep 3
	@echo "$(GREEN)✓ Docker services started$(NC)"

docker-down:
	@echo "$(YELLOW)Stopping Docker services...$(NC)"
	@docker-compose down

logs:
	@docker-compose logs -f

clean:
	@echo "$(YELLOW)Cleaning up...$(NC)"
	@rm -rf node_modules backend/node_modules frontend/node_modules
	@rm -rf backend/dist frontend/dist
	@echo "$(GREEN)✓ Cleanup complete$(NC)"

.DEFAULT_GOAL := help
