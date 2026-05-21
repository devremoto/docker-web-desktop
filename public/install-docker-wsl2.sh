#!/bin/bash

# Docker Installation Script for WSL2
# This script automates the installation of Docker Engine and Docker Compose on WSL2 (Ubuntu)

set -e

echo "================================================"
echo "Docker Installation Script for WSL2"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running on WSL2
if ! grep -q "microsoft" /proc/version; then
    echo -e "${RED}Error: This script must be run inside WSL2${NC}"
    exit 1
fi

echo -e "${BLUE}Step 1: Checking Node.js installation...${NC}"
if command -v node >/dev/null 2>&1; then
  echo -e "${GREEN}Node.js already installed: $(node --version)${NC}"
else
  echo -e "${BLUE}Node.js not found. Installing nodejs and npm...${NC}"
  sudo apt update
  sudo apt install -y nodejs npm
fi

if command -v node >/dev/null 2>&1; then
  echo "Node.js version: $(node --version)"
else
  echo -e "${RED}Node.js installation failed.${NC}"
  exit 1
fi

if command -v npm >/dev/null 2>&1; then
  echo "npm version: $(npm --version)"
else
  echo -e "${RED}npm installation failed.${NC}"
  exit 1
fi

echo -e "${BLUE}Step 2: Updating package repository...${NC}"
sudo apt update && sudo apt upgrade -y

echo -e "${BLUE}Step 3: Installing prerequisites...${NC}"
sudo apt install -y \
    ca-certificates \
    curl \
  gnupg

echo -e "${BLUE}Step 4: Installing Docker Engine and Compose...${NC}"
if sudo apt install -y docker.io docker-compose-v2; then
  echo -e "${GREEN}Installed docker.io + docker-compose-v2${NC}"
else
  echo -e "${BLUE}docker-compose-v2 package not available, using docker-compose fallback...${NC}"
  sudo apt install -y docker.io docker-compose
fi

echo -e "${BLUE}Step 5: Adding user to docker group...${NC}"
sudo usermod -aG docker "$USER"

echo -e "${BLUE}Step 6: Starting Docker service...${NC}"
sudo service docker start

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}Docker installation completed successfully!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "Testing Docker installation in WSL..."
docker --version

echo ""
if docker compose version >/dev/null 2>&1; then
  echo "Docker Compose (plugin) detected:"
  docker compose version
elif command -v docker-compose >/dev/null 2>&1; then
  echo "Docker Compose (standalone) detected:"
  docker-compose --version
else
  echo -e "${RED}Docker Compose is not available.${NC}"
  exit 1
fi

echo ""
echo "Running hello-world container..."
if docker run hello-world; then
  echo -e "${GREEN}Docker engine test passed.${NC}"
else
  echo -e "${RED}Docker hello-world test failed. Check daemon status.${NC}"
  exit 1
fi

echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Close this terminal and open a new one to apply group changes"
echo "2. Run 'docker --version' and 'docker compose version'"
echo "3. Use Docker Web Desktop with WSL2 Docker source"
echo "4. Basic Docker Compose flow inside WSL:"
echo "   docker compose up -d"
echo "   docker compose ps"
echo "   docker compose logs -f"
echo "   docker compose down"
echo ""
echo -e "${BLUE}To start Docker manually:${NC}"
echo "  sudo service docker start"
echo ""
echo -e "${BLUE}To auto-start Docker on WSL launch, add to ~/.bashrc:${NC}"
echo "  echo 'if ! service docker status > /dev/null 2>&1; then' >> ~/.bashrc"
echo "  echo '    sudo service docker start > /dev/null 2>&1' >> ~/.bashrc"
echo "  echo 'fi' >> ~/.bashrc"
echo ""
