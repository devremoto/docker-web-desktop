#!/bin/bash

# Docker Installation Script for WSL2
# This script automates the installation of Docker Engine on WSL2 (Ubuntu)

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

echo -e "${BLUE}Step 1: Updating package repository...${NC}"
sudo apt update && sudo apt upgrade -y

echo -e "${BLUE}Step 2: Installing prerequisites...${NC}"
sudo apt install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

echo -e "${BLUE}Step 3: Adding Docker's official GPG key...${NC}"
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

echo -e "${BLUE}Step 4: Setting up Docker repository...${NC}"
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

echo -e "${BLUE}Step 5: Installing Docker Engine...${NC}"
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

echo -e "${BLUE}Step 6: Adding user to docker group...${NC}"
sudo usermod -aG docker $USER

echo -e "${BLUE}Step 7: Starting Docker service...${NC}"
sudo service docker start

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}Docker installation completed successfully!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "Testing Docker installation..."
docker --version

echo ""
echo "Running hello-world container..."
docker run hello-world

echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Close this terminal and open a new one to apply group changes"
echo "2. Run 'docker --version' to verify installation"
echo "3. Use Docker Desktop Web UI and select 'WSL2' as container source"
echo ""
echo -e "${BLUE}To start Docker manually:${NC}"
echo "  sudo service docker start"
echo ""
echo -e "${BLUE}To auto-start Docker on WSL launch, add to ~/.bashrc:${NC}"
echo "  echo 'if ! service docker status > /dev/null 2>&1; then' >> ~/.bashrc"
echo "  echo '    sudo service docker start > /dev/null 2>&1' >> ~/.bashrc"
echo "  echo 'fi' >> ~/.bashrc"
echo ""
