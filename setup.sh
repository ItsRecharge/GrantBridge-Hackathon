#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Divergent College - Setup & Launch${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed. Please install Node.js 18+${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node -v) detected${NC}\n"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker is not installed. Please install Docker${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker detected${NC}\n"

echo -e "${YELLOW}Step 1/5: Installing dependencies...${NC}"
export PUPPETEER_SKIP_DOWNLOAD=true
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}\n"


# Step 2: Setup environment files
echo -e "${YELLOW}Step 2/5: Setting up environment files...${NC}"
npm run setup:env
echo -e "${GREEN}✓ Environment files created${NC}\n"

# Step 3: Start Docker services
echo -e "${YELLOW}Step 3/5: Starting Docker services (PostgreSQL, Redis & Ollama)...${NC}"
docker compose up -d
echo -e "${GREEN}✓ Docker services started${NC}\n"

# Wait for services to be ready
echo -e "${YELLOW}Waiting for services to be ready...${NC}"
sleep 5

# Check if PostgreSQL is ready
for i in {1..30}; do
    if docker exec divergent_college_postgres pg_isready -U postgres &> /dev/null; then
        echo -e "${GREEN}✓ PostgreSQL is ready${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}✗ PostgreSQL failed to start${NC}"
        exit 1
    fi
    sleep 1
done

# Check if Redis is ready
for i in {1..30}; do
    if docker exec divergent_college_redis redis-cli ping &> /dev/null; then
        echo -e "${GREEN}✓ Redis is ready${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}✗ Redis failed to start${NC}"
        exit 1
    fi
    sleep 1
done

echo -e "\n"

# Step 4: Setup Ollama agents
echo -e "${YELLOW}Step 4/5: Setting up Ollama agents...${NC}"

# Check if Ollama container is running
if docker ps | grep -q divergent_college_ollama; then
    echo -e "${GREEN}✓ Ollama container is running${NC}"

    # Wait for Ollama to be ready
    for i in {1..30}; do
        if docker exec divergent_college_ollama ollama list &> /dev/null; then
            break
        fi
        sleep 1
    done

    # Function to build agent with error handling
    build_agent() {
        local modelfile=$1
        local agent_name=$2

        echo -e "  Building ${BLUE}$agent_name${NC} agent..."

        if docker exec divergent_college_ollama ollama create $agent_name -f /modelfiles/$modelfile &> /dev/null; then
            echo -e "  ${GREEN}✓ $agent_name agent built successfully${NC}"
        else
            echo -e "  ${RED}✗ Failed to build $agent_name agent${NC}"
            return 1
        fi
    }

    echo -e "  Downloading base models (this may take a while)..."
    docker exec divergent_college_ollama ollama pull mistral:7b
    docker exec divergent_college_ollama ollama pull phi:2.7b
    docker exec divergent_college_ollama ollama pull llama2:7b

    echo -e "  Building custom agents..."
    build_agent "profile-summarizer-modelfile" "profile-summarizer"
    build_agent "scholarship-extractor-modelfile" "scholarship-extractor"
    build_agent "match-scorer-modelfile" "match-scorer"

    echo -e "${GREEN}✓ Ollama agents ready${NC}\n"
else
    echo -e "${YELLOW}⚠ Ollama container not running — skipping agent setup${NC}"
    echo -e "${YELLOW}  Start Ollama and re-run this script to set up agents${NC}\n"
fi

# Step 5: Start the application
echo -e "${YELLOW}Step 5/5: Starting the application...${NC}"
echo -e "${GREEN}✓ Starting backend (port 5001) and frontend (port 3000)${NC}\n"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Application is starting...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${GREEN}Frontend:${NC} http://localhost:3000"
echo -e "${GREEN}Backend:${NC}  http://localhost:5001"
echo -e "${GREEN}API:${NC}      http://localhost:5001/api\n"

echo -e "${YELLOW}To stop the application, run:${NC}"
echo -e "  npm run docker:down\n"

echo -e "${YELLOW}To view Docker logs, run:${NC}"
echo -e "  npm run docker:logs\n"

# Run the application
npm run start:all
