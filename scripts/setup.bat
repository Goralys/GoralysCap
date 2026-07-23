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

echo [2.1/4] Creating MainActivity.java...
if not exist ".\android\app\src\main\java\fr\goralys\app" mkdir -p ".\android\app\src\main\java\fr\goralys\app" >nul 2>&1
(
echo package fr.goralys.app;
echo
echo import android.os.Build;
echo import android.os.Bundle;
echo import android.view.View;
echo
echo import com.getcapacitor.BridgeActivity;
echo
echo public class MainActivity extends BridgeActivity {
echo     @Override
echo     protected void onCreate(Bundle savedInstanceState) {
echo         super.onCreate(savedInstanceState);
echo
echo         if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
echo             getBridge()
echo                     .getWebView()
echo                     .setImportantForAutofill(
echo                             View.IMPORTANT_FOR_AUTOFILL_YES
echo                     );
echo         }
echo     }
echo }
) > ./android/app/src/main/java/fr/goralys/app/MainActivity.java
echo [OK] MainActivity.java created.

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