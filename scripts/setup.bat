@echo off
setlocal EnableExtensions EnableDelayedExpansion

type scripts\banner.txt

echo ==================================================
echo =====             Goralys setup              =====
echo ==================================================

echo [1/5] Checking for pnpm and npx...
where pnpm >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Fatal: pnpm not found in PATH.
    echo >> Please install pnpm or add it to your system PATH.
    pause
    exit /b 1
)

where npx >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Fatal: npx not found in PATH.
    echo >> Please install npx or add it to your system PATH.
    pause
    exit /b 1
)

echo [OK] pnpm and npx found.


echo [2/5] Installing dependencies ...

call pnpm install
if errorlevel 1 (
    echo [ERROR] pnpm install failed.
    pause
    exit /b 1
)

echo [OK] Successfully installed dependencies.



echo [3/5] Creating Android project...

call npx cap add android
if errorlevel 1 (
    echo [ERROR] Android project creation failed.
    pause
    exit /b 1
)

copy /Y ".\templates\MainActivity.java" ".\android\app\src\main\java\fr\goralys\app\MainActivity.java"

echo [OK] Android project created.

echo [4/5] Creating .env.local file ...

if exist ".\.env.local" (
    echo An existing .env.local file was found, do you want to overwrite it ? This will delete all previous configuration.
    set /p OVERWRITE="Overwrite ? (Y/n) : "
    if /I not "!OVERWRITE!"=="Y" (
        echo Keeping existing .env.local
        goto :after_env
    )
)

copy /y ".\templates/.env.local" ".\.env.local"

echo .env.local ready.
echo.

:after_env

echo [5/5] Running checks
echo Would you like the setup to run checks (eslint)?
set /p RUN_CHECKS="Run checks ? (Y/n) : "
if /I not "!RUN_CHECKS!"=="Y" (
    goto :done
)

echo.
echo Running eslint ...
call pnpm run lint
if errorlevel 1 (
    echo [ERROR] ESLint failed. Fix issues and re-run setup or run: pnpm run lint
    pause
    exit /b 1
)

:done
echo.
echo ==================================================
echo =====             Setup Complete             =====
echo ==================================================
echo You can now edit your .env.local file and start coding.
pause
exit /b 0