#!/usr/bin/env bash

set -euo pipefail

show_banner() {
    cat "scripts/banner.txt"
    echo
}

show_banner

echo "=================================================="
echo "=====             Goralys setup              ====="
echo "=================================================="

echo "[1/4] Checking for pnpm..."
if ! command -v pnpm >/dev/null 2>&1; then
    echo "[ERROR] Fatal: pnpm not found in PATH."
    echo ">> Please install pnpm or add it to your system PATH."
    exit 1
fi

echo "[OK] pnpm found."

echo "[2/4] Installing dependencies ..."
pnpm install || {
    echo "[ERROR] pnpm install failed."
    exit 1
}

echo "[OK] Successfully installed dependencies."
echo

echo "[3/4] Creating .env.local file ..."

if [ -f "./.env.local" ]; then
    echo "An existing .env.local file was found, do you want to overwrite it ?"
    read -r -p "Overwrite ? (Y/n) : " OVERWRITE
    if [[ "${OVERWRITE:-Y}" != "Y" ]]; then
        echo "Keeping existing .env.local"
        goto_after_env=true
    fi
fi

if [ "${goto_after_env:-false}" != "true" ]; then
cat > ./.env.local << 'EOF'
NEXT_PUBLIC_API_DOMAIN="your api domain"
NEXT_PUBLIC_API_TOKEN="veryrand0mbytes"
EOF

    echo ".env.local ready."
    echo
fi

echo "[4/4] Running checks"

read -r -p "Would you like the setup to run checks (eslint)? (Y/n) : " RUN_CHECKS
if [[ "${RUN_CHECKS:-Y}" != "Y" ]]; then
    goto_done=true
fi

if [ "${goto_done:-false}" != "true" ]; then
    echo
    echo "Running eslint checks..."

    pnpm run lint || {
        echo "[ERROR] ESLint failed."
        echo "Fix issues and re-run setup or run: pnpm run lint"
        exit 1
    }
fi

echo
echo "=================================================="
echo "=====             Setup Complete             ====="
echo "=================================================="
echo "You can now edit your .env.local file and start coding."