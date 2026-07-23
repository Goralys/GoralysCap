@echo off
setlocal EnableExtensions EnableDelayedExpansion

type scripts\banner.txt

rem Detect a PHP 8.5+ binary. Adjust the fallback path below if your
rem local PHP installs live somewhere else (e.g. C:\php85\php.exe).
set "PHP_BIN=php"
where php85 >nul 2>&1
if not errorlevel 1 (
    set "PHP_BIN=php85"
) else if exist "C:\php85\php.exe" (
    set "PHP_BIN=C:\php85\php.exe"
)

echo ==================================================
echo =====             Goralys setup              =====
echo ==================================================

echo [1/4] Checking for pnpm...
where pnpm >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Fatal: pnpm not found in PATH.
    echo >> Please install pnpm or add it to your system PATH.
    pause
    exit /b 1
)

echo [OK] pnpm found.


echo [2/4] Installing dependencies ...

call pnpm install
if errorlevel 1 (
    echo [ERROR] pnpm install failed.
    pause
    exit /b 1
)

echo [OK] Successfully installed dependencies.
echo.

echo [3/4] Creating .env file ...

if exist ".\.env.local" (
    echo An existing .env.local file was found, do you want to overwrite it ? This will delete all previous configuration.
    set /p OVERWRITE="Overwrite ? (Y/n) : "
    if /I not "!OVERWRITE!"=="Y" (
        echo Keeping existing .env
        goto :after_env
    )
)

(
echo NEXT_PUBLIC_API_DOMAIN="your api domain"
echo NEXT_PUBLIC_API_TOKEN="veryrand0mbytes"
) > ./.env.local

echo .env ready.
echo.

:after_env

echo [4/4] Running checks
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