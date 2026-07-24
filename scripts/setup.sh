#!/usr/bin/env bash

set -euo pipefail

pause() {
 read -s -n 1 -p "Press any key to continue . . ."
 echo ""
}

show_banner() {
    cat "scripts/banner.txt"
    echo
}

show_banner

echo "=================================================="
echo "=====             Goralys setup              ====="
echo "=================================================="

echo "[1/5] Checking for pnpm and npx..."
if ! command -v pnpm >/dev/null 2>&1; then
    echo "[ERROR] Fatal: pnpm not found in PATH."
    echo ">> Please install pnpm or add it to your system PATH."
    pause
    exit 1
fi

if ! command -v npx >/dev/null 2>&1; then
    echo "[ERROR] Fatal: npx not found in PATH."
    echo ">> Please install npx or add it to your system PATH."
    pause
    exit 1
fi

echo "[OK] pnpm and npx found."

echo "[2/5] Installing dependencies ..."
pnpm install || {
    echo "[ERROR] pnpm install failed."
    pause
    exit 1
}

echo "[OK] Successfully installed dependencies."
echo

echo "[3/5] Creating Android project..."

npx cap add android || {
    echo "[ERROR] Android project creation failed."
    pause
    exit 1
}

cp "./templates/MainActivity.java" "./android/app/src/main/java/fr/goralys/app/MainActivity.java"

echo "[OK] Android project created."

echo "[4/5] Creating .env.local file ..."

if [ -f "./.env.local" ]; then
    echo "An existing .env.local file was found, do you want to overwrite it ?"
    read -r -p "Overwrite ? (Y/n) : " OVERWRITE
    if [[ ! "${OVERWRITE:-Y}" =~ ^[Yy]$ ]]; then
        echo "Keeping existing .env.local"
        goto_after_env=true
    fi
fi

if [ "${goto_after_env:-false}" != "true" ]; then
    cp "./templates/.env.local" "./.env.local"
    echo ".env.local ready."
    echo
fi

echo "[5/5] Running checks"

read -r -p "Would you like the setup to run checks (eslint)? (Y/n) : " RUN_CHECKS
if [[ ! "${RUN_CHECKS:-Y}" =~ ^[Yy]$ ]]; then
    goto_done=true
fi

if [ "${goto_done:-false}" != "true" ]; then
    echo
    echo "Running eslint checks..."

    pnpm run lint || {
        echo "[ERROR] ESLint failed."
        echo "Fix issues and re-run setup or run: pnpm run lint"
        pause
        exit 1
    }
fi

echo
echo "=================================================="
echo "=====             Setup Complete             ====="
echo "=================================================="
echo "You can now edit your .env.local file and start coding."
pause