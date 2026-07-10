@echo off
setlocal
cd /d "%~dp0"

if not exist "node_modules" (
    echo [start.bat] Installing dependencies...
    call npm install
    if errorlevel 1 goto :error
)

echo [start.bat] Building app...
call npm run build
if errorlevel 1 goto :error

echo [start.bat] Starting server...
call npm start
if errorlevel 1 goto :error

goto :eof

:error
echo.
echo [start.bat] FAILED. See errors above.
pause
exit /b 1
