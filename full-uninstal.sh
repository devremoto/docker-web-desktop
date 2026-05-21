#!/usr/bin/env bash
# Full uninstall in Linux/WSL context
# Removes Docker infra + Node.js packages from the current distro.
# Note: Removing Windows WSL features must be done from Windows (full-uninstal.bat).

set -euo pipefail

echo "[1/4] Stopping Docker service if running..."
sudo service docker stop >/dev/null 2>&1 || true

echo "[2/4] Removing Docker packages and data..."
sudo apt-get purge -y docker.io docker-compose-v2 docker-compose containerd runc || true
sudo apt-get autoremove -y --purge || true
sudo rm -rf /var/lib/docker /var/lib/containerd /etc/docker /etc/apt/keyrings/docker.gpg /etc/apt/sources.list.d/docker.list

echo "[3/4] Removing Node.js and npm packages..."
sudo apt-get purge -y nodejs npm || true
sudo apt-get autoremove -y --purge || true

echo "[4/4] Full uninstall complete for this Linux/WSL distro."
echo "If you are on Windows and need full WSL teardown, run full-uninstal.bat as Administrator."
