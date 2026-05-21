#!/usr/bin/env bash
# One-click setup inside Linux/WSL for Docker + Compose + Node checks

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [[ ! -f "public/install-docker-wsl2.sh" ]]; then
  echo "ERROR: Could not find public/install-docker-wsl2.sh"
  exit 1
fi

chmod +x public/install-docker-wsl2.sh
exec ./public/install-docker-wsl2.sh
