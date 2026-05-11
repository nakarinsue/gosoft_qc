# --- Variables ---
# กำหนดเส้นทางต่างๆ เพื่อให้ง่ายต่อการแก้ไข
DOCKER_COMPOSE_FILE = ./docker/docker-compose.yml
PYTHON_VENV_BIN = ./.venv/Scripts/python
WEBPACK_DIR = ./app/webpack

# --- Default Target ---
.PHONY: help
help:
	@echo "================================================================"
	@echo "                PROMOTION SYSTEM - MANAGEMENT                   "
	@echo "================================================================"
	@echo "Docker Commands:"
	@echo "  make up             - Build and Start Docker containers"
	@echo "  make down           - Stop Docker containers"
	@echo "  make ps             - List all containers"
	@echo ""
	@echo "Backend Commands (Python):"
	@echo "  make api            - Run Python Backend (main)"
	@echo ""
	@echo "Frontend Commands (Webpack/NPM):"
	@echo "  make npm-install    - Install frontend dependencies"
	@echo "  make npm-build      - Build frontend for production"
	@echo "  make npm-preview    - Preview frontend"
	@echo ""
	@echo "Full Setup:"
	@echo "  make setup          - Install all and Build everything"
	@echo "================================================================"

# --- Docker Targets ---
.PHONY: up
up:
	docker compose -f $(DOCKER_COMPOSE_FILE) up -d --build

.PHONY: down
down:
	docker compose -f $(DOCKER_COMPOSE_FILE) down

.PHONY: ps
ps:
	docker ps -a

# --- Backend Targets ---
.PHONY: api
api:
	$(PYTHON_VENV_BIN) -m app.backend.main

# --- Frontend Targets ---
.PHONY: npm-install
npm-install:
	cd $(WEBPACK_DIR) && npm install

.PHONY: npm-build
npm-build:
	cd $(WEBPACK_DIR) && npm run build

.PHONY: npm-preview
npm-preview:
	cd $(WEBPACK_DIR) && npm run preview

# --- Combined Targets ---
.PHONY: setup
setup: npm-install npm-build up
	@echo "Setup completed successfully."