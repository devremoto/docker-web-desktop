#!/usr/bin/env bash
# Docker infrastructure uninstall only (keeps WSL distro and Node.js)

set -euo pipefail

if ! grep -qi microsoft /proc/version 2>/dev/null; then
  echo "This script is intended for WSL/Linux environments."
fi

echo "[1/3] Stopping Docker service if running..."
sudo service docker stop >/dev/null 2>&1 || true

echo "[2/3] Removing Docker packages and runtime data..."
sudo apt-get purge -y docker.io docker-compose-v2 docker-compose containerd runc || true
sudo apt-get autoremove -y --purge || true
sudo rm -rf /var/lib/docker /var/lib/containerd /etc/docker /etc/apt/keyrings/docker.gpg /etc/apt/sources.list.d/docker.list

echo "[3/3] Docker infrastructure uninstall complete."
echo "Validation: docker should no longer resolve in this shell after reopen."
