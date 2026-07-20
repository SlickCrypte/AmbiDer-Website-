@echo off
cd /d "%~dp0"

echo Starting backend in the background...
start "Marketplace Backend" cmd /k "uvicorn main:app --reload"

echo Starting frontend server in the background...
cd frontend\dist
start "Marketplace Frontend" cmd /k "npx serve . -l 4000"

timeout /t 3 /nobreak >nul

echo Opening in browser...
start http://localhost:4000

pause
